//const User = require("../models/userSchema");
const Cart = require("../models/cartSchema") ; 
const Product = require("../models/product") ;


const cartAvailability  = async(req,res,next) =>{
   
    try{
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
       
        const cart = await Cart.findOne({user : userId});
       
    if(cart){ 
        for (const cartProduct of cart.items){
            
            const product = await Product.findById(cartProduct.product);
            if(!product){
                cartProduct.status = "Unavailable" ; 
                continue ;
            }
            const size =  product.sizes.find(s => s.size === cartProduct.size);
            
            if(size){
                
                cartProduct.status = "Available" ;
            }
            if(!size){
               
                cartProduct.status = "Unavailable" ; 
                continue ; 
               
            }
            
            if(cartProduct.quantity > size.quantity){
                 cartProduct.status = "Unavailable" ;
                 cartProduct.discountedPrice = size.discountedPrice ;   //update the current price
                 await  cart.save();  
            }else if(cartProduct.quantity == 0 ){
                cartProduct.status = "Unavailable" ;
                cartProduct.discountedPrice = size.discountedPrice ;   //update the current price
                await  cart.save();  
            }
            else{
                cartProduct.status = "Available" ;
                cartProduct.discountedPrice = size.discountedPrice ;   //update the current price
                await  cart.save(); 
            }
        }


      // Save the updated cart
      await cart.save();

       
        next();
    }else{
        next() ;
    }
    }catch(err){
        console.log(err.message)
        return; 
    }
}


module.exports = cartAvailability  ; 