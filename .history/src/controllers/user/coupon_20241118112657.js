


//import schemas
const User        =  require("../../models/userSchema") ;
const Cart        =  require("../../models/cartSchema") ;
const Coupon      =  require("../../models/couponSchema") ;
const Logo             =    require("../../models/logoSchema") ;
const GenderCategory   =    require("../../models/genderCategory") ;
const { userLogout } = require("./authentication") ; 







//add coupon
const couponAddCart = async (req,res) => { 
    try{
       const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
       const user  =  await User.findById(userId);
       const cart = await Cart.findOne( {user  : userId });  

       const couponCode = req.body.couponCode ? req.body.couponCode.trim() : "" ;
       const coupon = await Coupon.findOne({ code : couponCode }); 

       //check coupon should have min cart value 
       if( coupon ){  

       let cartValue = 0;
   
       for(let i=0 ; i< cart.items.length ; i++){  
         if(cart.items[i].status == "Available"){
           for(let m =0 ; m < cart.items[i].quantity ; m++ ){
               cartValue += cart.items[i].discountedPrice ;
           }
         } 
       } 
      
       if(coupon.couponBalance > (cartValue - cart.walletBalance)){
         return res.status(400).json({ success : false , message : `cart must be minimum cart value - ${coupon.couponBalance}`  }) 
        // return res.redirect(`/cart?coupon-success=0&couponBalance=${coupon.couponBalance}`) ;
       }; 
       }
       
       
       const userCoupon = user.appliedCoupons.find(coupon => coupon.couponCode === couponCode ) ; 
       
       if(!coupon){
        return res.status(400).json({ success : false , message : `Enter a valid Coupon`  }) 

       }else if(coupon.expiryDate <= Date.now()){ 
        return res.status(400).json({ success : false , message : `Coupon Expired`  }) 
       }else if(userCoupon ){ 
            if (userCoupon.totalApply >= coupon.usageLimit) { 
              
                return res.status(400).json({ success : false , message : `Coupon limit Exceeded`  }) 
              } 
              // Increment the usage limit if it's still within the allowed limit
              else { 
                userCoupon.totalApply += 1 ;
                user.couponBalance = coupon.couponBalance ; 
                user.coupon = userCoupon._id;
                cart.couponBalance = coupon.couponBalance ;
              }
       }else{
        user.appliedCoupons.push({
            couponCode: couponCode , 
            totalApply : 1, // Initial usage
          });
          user.couponBalance = coupon.couponBalance ; 
          cart.couponBalance = coupon.couponBalance ;
       }
 
       // Save the updated user document 
       const Updateduser = await user.save();
       const usercoupon = Updateduser.appliedCoupons.find(coupon => coupon.couponCode === couponCode ) ; 
       Updateduser.coupon = usercoupon._id ; 

       await cart.save();
       await user.save();
       return res.status(400).json({ success : true   }) 

    }catch(err){
        console.log(err);
        res.status(400).json({user : false });
       // return res.redirect("/cart?coupon-error=1") ;
    }
}




//remove coupon
const removeCoupon = async ( req,res ) =>{

    try{
        const couponId = req.body.couponId;
       
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const user  =  await User.findById(userId);
        const cart = await Cart.findOne( {user  :userId}); 
     
        const userCoupon = user.appliedCoupons.find(coupon => coupon._id.equals(couponId));
      
        userCoupon.totalApply  =  userCoupon.totalApply - 1 ; 
        user.couponBalance = 0 ;
        user.coupon = null ;
        cart.couponBalance = 0 ;
        user.save();
        cart.save();
     
        res.status(200).json({success : true }) ; 
        
    }catch(err){
        console.log(err);
        res.status(400).json({user : false }); 
    }
 
}
 



//GET COUPONS
const  coupons  =  async  ( req , res ) => {
    try{
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const logo = await Logo.findOne().sort({ updatedAt: -1 });
        const genderCategory = await GenderCategory.find({ softDelete : false }) ;   
        const user = await User.findById( userId ) ; 


        let cartTotal ; 
        if( userId ){
        const cart = await Cart.findOne({user : userId}) ; 
        if( cart && cart.items > 0 ){
           console.log(cart.items);
           cartTotal = cart.items.reduce( ( total , item ) => {
           return item.status === "Available" ? total + item.quantity : total ;
         }, 0); 
        }
        }else{
        cartTotal = 0 ; 
        }   

      

        const { page = 1, limit = 8 } = req.query ;

        const coupons = await Coupon.find()
            .sort({ expiryDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

         
         const appliedCoupons = user.appliedCoupons ;
        
         // Restructure coupons based on user's applied coupons
         const couponsWithAdjustedUsage = coupons.map(coupon => {
         // Find if user has applied this coupon
         const appliedCoupon = appliedCoupons.find(ac => ac.couponCode === coupon.code);
    
         // Get applied count - if coupon is found in applied coupons, use its totalApply, otherwise 0
         const appliedCount = appliedCoupon ? appliedCoupon.totalApply : 0 ;
    
         // Calculate remaining user limit
         const usageLimit = appliedCoupon ? coupon.usageLimit - appliedCount : coupon.usageLimit  ;  
         
         return {
            ...coupon.toObject(), // Spread all coupon properties
                usageLimit: usageLimit // Override the original usageLimit with calculated one
         };
 
    })

    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil( totalCoupons / limit );
   

        res.render( 'frontend/coupons', { coupons : couponsWithAdjustedUsage , userId,totalPages , currentPage : page , 
         limit ,    logo , genderCategory , user , cartTotal } ) ; 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;        
    }
}


 



module.exports  =  { couponAddCart , removeCoupon  , coupons } ; 