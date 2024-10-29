


//import schemas
const Logo               =  require("../../models/logoSchema")   ; 
const GenderCategory     =  require("../../models/genderCategory")  ; 
const User               =  require("../../models/userSchema" ) ;
const Banner             =  require("../../models/bannerSchema") ;
const ProductCategory    =  require("../../models/productCategory") ; 
const ProductSubCategory =  require("../../models/productSubCategory") ; 
const Product            =  require("../../models/product") ;
const Cart               =  require("../../models/cartSchema")  ; 
const Addresses          =  require("../../models/addressSchema") ;





//GET CHECKOUT PAGE
const  getCheckout  =  async  ( req , res )  =>{
  try{
    const logo = await Logo.findOne().sort({ updatedAt : -1 }) ; 
    const genderCategory = await GenderCategory.find({ softDelete : false });
 
      let user ;   
      if(req.session.userId){
        user = await User.findById(req.session.userId);  
      }else if(req.user){
        user = await User.findById( req.user._id ); 
      }else{
        return res.redirect("/userLogin") ;
      }

      
      let cartTotal ; 
         if(user){
         const cart = await Cart.findOne({user : user._id});
         if(cart){
         cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0);  
         }
         }else{
         cartTotal = 0;
         }

     
    
      const userAddresses = await Addresses.find({ userId : user._id , softDelete : false });    
   
      const cart = await Cart.findOne({ user : user._id}).populate('items.product') ; 


      const availableItems = cart.items.filter(item => item.status === 'Available');
      cart.items = availableItems;



      let totalItems =0 ;
        cart.items.forEach(item =>{
          totalItems += item.quantity ; 
        })


        let totalPrice = 0;  
        for(let i=0 ; i< cart.items.length ; i++){
            for(let m =0 ; m < cart.items[i].quantity ; m++ ){         
                totalPrice += cart.items[i].discountedPrice ;   
            }
        }  

    const deliveryCharge = parseFloat(req.query.deliveryCharge) || 0 ;

    let totalAmount = (totalPrice + deliveryCharge)  - ( cart.couponBalance + cart.walletBalance ) ;   
    totalAmount = totalAmount.toFixed(2)

    if(totalAmount == 0){
      return res.redirect("/cart") ; 
    }

     res.render("frontend/checkout.ejs" , { logo , genderCategory , user , userAddresses , cart , totalItems, deliveryCharge , totalAmount , totalPrice , cartTotal} );   
  }catch(err){
    console.log(err)
    res.status(500).render("frontend/404");  
  }

}





module.exports  =  {  getCheckout }