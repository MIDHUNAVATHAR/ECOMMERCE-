
const  Wishlist  =  require("../models/wishList") ;
const  Product   =  require()



const wishlistAvailability = async (req, res, next) => {
    try {
      const userId =
        req.session.user
          ? req.session.user.id
          : "" || req.session.passport
          ? req.session.passport.user
          : "";
  
      const wishList = await Wishlist.findOne({ user: userId });
  
      if (wishList) {
        for (let i = 0; i < wishList.items.length; i++) {
          const wishListProduct = wishList.items[i];
          const product = await Product.findById(wishListProduct.product);
  
          if (!product) {
            // If product doesn't exist, remove the item from the wishlist
            wishList.items.splice(i, 1); // Remove the item by index
            continue; // Continue to the next product
          }
  
          // Find the size based on sizeId
          const size = product.sizes.find(
            (s) => s._id.toString() === wishListProduct.sizeId.toString()
          );
  
          console.log("Size found:", size);
  
          if (!size) {
            // If size doesn't exist, remove the item from the wishlist based on sizeId
            wishList.items.splice(i, 1); // Remove the item by index
          }
        }
  
        // After modifying the items array, save the updated wishlist document
        await wishList.save();
        next();
      } else {
        next();
      }
    } catch (err) {
      console.log(err.message);
      return;
    }
  };
  
  module.exports = wishlistAvailability;
  