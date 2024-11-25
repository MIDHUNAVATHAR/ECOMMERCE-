

//import schemas
const Logo             =    require("../../models/logoSchema") ;
const GenderCategory   =    require("../../models/genderCategory") ;
const User             =    require("../../models/userSchema") ;
const Cart             =    require("../../models/cartSchema") ;
const Wishlist         =    require("../../models/wishList") ;





//GET  WISHLIST
const wishlist = async ( req , res ) => {
  try{
    const logo = await Logo.findOne().sort({ updatedAt: -1 });
    const genderCategory = await GenderCategory.find({softDelete : false});  
    const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
   
 
    const user = await User.findById( userId ) ;
 
    const cart = await Cart.findOne({ user : userId }); 
    const  wishlist = await Wishlist.findOne({ user : userId ,  }).populate("items.product");
   
    let cartTotal =0 ;
    if(cart){
     cart.items.forEach(item =>{
       cartTotal += item.quantity ;
     })
    } 
     
 
    res.render("frontend/wish-list.ejs" ,{logo, genderCategory , user ,, wishlist , cartTotal });  
  }catch(err){
    console.log(err);  
    res.status(500).render("frontend/404");  
   }
}
   
 




//POST WISHIST-ADD
const addToWishlist  = async ( req , res ) =>{


  try {

    const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
 
    if(!userId){
     
       return res.status(401).json({ success: false, redirect: '/userLogin' }); 
    }     
 
   
     const { productId, sizeId } = req.body;
     

     // Find the user's wishlist (assuming you have a Wishlist schema)
     let wishlist = await Wishlist.findOne({ user: userId });

     if (!wishlist) {
         // If the wishlist doesn't exist, create a new one
         wishlist = new Wishlist({ user: userId, items: [] , sizeId });
     }


       // Check if the product with the same size already exists in the wishlist
     const itemExists = wishlist.items.some(
         (item) => item.product.toString() === productId && item.sizeId.toString() === sizeId
     );

     if (itemExists) {
         // If the item exists, return a response indicating it's already added
         return res.json({ success: false, message: 'Product with this size is already in your wishlist!' });
     }

     // Add the product to the wishlist
     wishlist.items.push({ product: productId, sizeId });

     // Save the updated wishlist
     await wishlist.save();

     // Respond with success
     res.json({ success: true });
 } catch (error) {
     console.log(err);
     res.status(500).render("frontend/404");  
 }

}





//DELETE WISHLIST -REMOVE 
const removeWishlistitem  = async  ( req,res ) =>{  
  try{
    let userId = req.session.userId || req.user._id ;  

    const itemId = req.params.id ;
    const result = await Wishlist.updateOne(
      { user: userId }, // Match the wishlist by user ID
      { $pull: { items: { _id: itemId } } } // Pull the item with the specified itemId
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Item removed from wishlist successfully.' });
    } else {
      res.status(404).json({ message: 'Item not found in wishlist.' });
    }
    
  }catch(err){
    console.log(err);
    res.status(500).render("frontend/404");  
  } 
}







 module.exports = {  wishlist  ,  addToWishlist , removeWishlistitem  } ; 