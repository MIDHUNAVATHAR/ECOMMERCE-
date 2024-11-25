//const User = require("../models/userSchema");
const Wishlist  =  require("../models/wishList") ; 
const Product   =  require("../models/product") ;






const wishlistAvailability  = async(req,res,next) =>{
   
    try{
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
       
        const wishList = await Wishlist.findOne({user : userId});
       
    if(wishList){ 
        for (const wishListProduct of wishList.items){
            
            const product = await Product.findById(wishListProduct.product);
            
            if(!product){
                await wishList.updateOne(
                    { user: userId },
                    { $pull: { items: { product  : wishListProduct.product } } }
                  );
                continue ;  
            }
            const size =  product.sizes.find(s => s._id ===  wishListProduct.sizeId ); 
            console.log(size)
            if(!size){
                await wishList.updateOne(
                    { user: userId },
                    { $pull: { items: { sizeId   } } }
                  );
               
            }
            
        }
       
        next();
    }else{
        next() ;
    }
    }catch(err){
        console.log(err.message)
        return; 
    }
}




module.exports = wishlistAvailability  ; 