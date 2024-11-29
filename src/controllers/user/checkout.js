


//import schemas
const Logo               =  require("../../models/logoSchema")   ; 
const GenderCategory     =  require("../../models/genderCategory")  ; 
const User               =  require("../../models/userSchema" ) ;
const Cart               =  require("../../models/cartSchema")  ; 
const Addresses          =  require("../../models/addressSchema") ;





//GET CHECKOUT PAGE
const  getCheckout  =  async  ( req , res )  =>{
  try{
    const logo = await Logo.findOne().sort({ updatedAt : -1 }) ; 
    const genderCategory = await GenderCategory.find({ softDelete : false });
 
    const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
    const user  =  await User.findById(userId);

      
      let cartTotal;

      if (user) {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
          cartTotal = cart.items.reduce((total, item) => {
            // Only include items with status "Available"
            if (item.status === "Available") {
              return total + item.quantity;
            }
            return total; // Don't add if the status is not "Available"
          }, 0);
        }
      } else {
        cartTotal = 0;
      }

      // If cartTotal is 0, redirect to the cart page
      if (cartTotal === 0) {
        return res.redirect("/cart");
      }

     
    
      const userAddresses = await Addresses.find({ userId : userId , softDelete : false });    
   
      const cart = await Cart.findOne({ user : userId }).populate('items.product') ; 


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
        totalPrice = parseFloat(totalPrice.toFixed(2)) ;
        console.log(totalPrice)

    const deliveryCharge = parseFloat(req.query.deliveryCharge) || 0 ;

    let totalAmount = (totalPrice + deliveryCharge)  - ( cart.couponBalance + cart.walletBalance ) ;   
    totalAmount = totalAmount.toFixed(2) ; 

    if(totalAmount <= 0){
      totalAmount = 0 ; 
    }
    

     res.render("frontend/checkout.ejs" , { logo , genderCategory , user ,userId , userAddresses , cart , totalItems, deliveryCharge , totalAmount , totalPrice , cartTotal} );   
  }catch(err){
    console.log(err)
    res.status(500).render("frontend/404");  
  }

}





module.exports  =  {  getCheckout }