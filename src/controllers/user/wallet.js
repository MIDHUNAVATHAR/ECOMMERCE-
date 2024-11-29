

//import schemas 
const User               =  require("../../models/userSchema") ;
const Cart               =  require("../../models/cartSchema") ;
const WalletTransaction  =  require("../../models/walletTransaction") ;
const Logo               =    require("../../models/logoSchema") ;
const GenderCategory     =    require("../../models/genderCategory") ;




//POST  ADD WALLET
const  walletAddCart  =  async  ( req , res ) =>{
    try{
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const user  =  await User.findById(userId); 
      
        if(user.walletBalance == 0 ){
            return res.status(200).json({ success : false , message : "No wallet Balance to Apply"})
        }

        const cart = await Cart.findOne( {user : userId} );
        // let cartTotal = cart.items.reduce((total , item ) => total + item.quantity * item.discountedPrice , 0); 
        let cartTotal = cart.items.reduce((total, item) => {
            // Only add item to total if its status is "Available"
            if (item.status === "Available") {
              return total + item.quantity * item.discountedPrice;
            }
            return total; // If status is not "Available", just return the current total without adding
          }, 0);


          
          
     
        if( cartTotal ==  0 ){
            return res.status(200).json({ success : false , message : "Please add products to cart"})
        }

        if(cartTotal - cart.couponBalance  < user.walletBalance ){
            return res.status(200).json({ success : false , message : `Cart should have minimum ${user.walletBalance} for order`})
        }
        
       
 
        let walletAmount = user.walletBalance;
  
    
        if(cartTotal >= walletAmount){
            cart.walletBalance = parseFloat(walletAmount).toFixed(2) ;
            user.walletBalance = 0;
            
        }else{
            cart.walletBalance = cartTotal;
            user.walletBalance = walletAmount - cartTotal
           
        }
        await  cart.save();
        await  user.save();
        res.status(200).json({ success : true })
    }catch(err){
        console.log(err.message);
        res.status(400).json({user:false})
    }
}



//POST REMOVE WALLET
const walletRemoveCart  =  async  ( req , res  ) => {
    try{
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const user  =  await User.findById(userId);
        const cart = await Cart.findOne( {user : userId} );
       
        let walletApplied = cart.walletBalance ;
        walletApplied = parseFloat(walletApplied).toFixed(2) ; 
        // Restore the wallet balance and reset the applied wallet amount in cart
     
        user.walletBalance += walletApplied ;
        cart.walletBalance = 0 ;

        cart.save()
        user.save()
        res.status(200).json({ success : true }) ;
    }catch(err){
        console.log(err.message); 
        res.status(400).json({user:false}) ;
    }
}



//GET WALLET HISTORY PAGE
const getWalletHistory = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const logo = await Logo.findOne().sort({ updatedAt: -1 });
        const genderCategory = await GenderCategory.find({softDelete : false}); 
        const user = await User.findById( userId ) ; 


        let cartTotal ; 
        if(userId){
        const cart = await Cart.findOne({user : userId});
        if(cart && cart.items > 0){
           console.log(cart.items);
         cartTotal = cart.items.reduce((total, item) => {
           return item.status === "Available" ? total + item.quantity : total ;
         }, 0); 
        }
        }else{
        cartTotal = 0 ; 
        } 


        const { page = 1, limit = 10 } = req.query;
      
        const walletTransactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit)
        .limit(limit);

        const totalWalletTransactions = await WalletTransaction.countDocuments();
        const totalPages = Math.ceil( totalWalletTransactions / limit);



        res.render('frontend/walletHistory', { walletTransactions , logo ,genderCategory , user , userId ,
            currentPage : page , totalPages , cartTotal
         });
    } catch (error) {
        console.error('Error fetching wallet history:', error);
        res.status(500).render('frontend/404');
    }
};

 
 


module.exports = { 
    walletAddCart , 
    walletRemoveCart , 
    getWalletHistory  
} ; 