const Cart = require('../models/cartSchema');
const Product = require('../models/product');

const updateCartPrices = async (req, res, next) => {
  try {
    const userId = req.session.user?.id || (req.session.passport?.user ?? '');
    const cart = await Cart.findOne({ user: userId });
    
    if(!cart){
       return next();
    }
 
    for (let i = 0; i < cart.items.length; i++) {
      const cartItem = cart.items[i];
      

      const product = await Product.findById(cartItem.product);
     
      if(!product){
        return next();
      }

      
      const productItem = product.sizes.find(size => size.size === cartItem.size);
    
      if(!productItem){
        continue;
      }
     
      cartItem.price = productItem.price;
      cartItem.discountedPrice = productItem.discountedPrice;
      cartItem.discountPercentage = productItem.discountedPercentage;
    }

    await cart.save();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = updateCartPrices;




