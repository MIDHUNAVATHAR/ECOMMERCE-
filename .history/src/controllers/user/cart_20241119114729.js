

//import modules
const fs = require('fs');  // For file operations (if the image is stored as a file)
const path = require('path');  // To handle file paths


//import schemas
const Logo             =    require("../../models/logoSchema") ;
const GenderCategory   =    require("../../models/genderCategory") ;
const User             =    require("../../models/userSchema") ;
const Cart             =    require("../../models/cartSchema") ;
const Product          =    require("../../models/product") ;





//GET CART PAGE
const getCart = async ( req,res ) => { 
    try{
        
    const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
    const genderCategory = await GenderCategory.find({ softDelete : false }) ;   
  
    const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
    
    const user = await User.findById( userId )  ;       // req.user is user obejct 
    const cart = await Cart.findOne({ user }).populate('items.product');
     
   let cartTotal ;  
 
   if(user){

   if(cart){
    const cart = await Cart.findOne({user : userId});
    cartTotal = cart.items.reduce((total, item) => {
      return item.status === "Available" ? total + item.quantity : total ; 
    }, 0); 
   }
   }else{
   cartTotal = 0 ; 
   }


   if(cart){
    let totalItems =0 ;
    cart.items.forEach(item =>{
      if(item.status == "Available"){
        totalItems += item.quantity ;
      }
    })

    let totalPrice = 0;  
   
    for(let i=0 ; i< cart.items.length ; i++){  
      if(cart.items[i].status == "Available"){
        for(let m =0 ; m < cart.items[i].quantity ; m++ ){
            totalPrice += cart.items[i].discountedPrice ;
        }
      }
    }

   //
   let totalP = parseFloat(totalPrice.toFixed(2)) ;

   


    let couponDiscount =  cart.couponBalance || 0;   
    let walletDiscount = cart.walletBalance || 0; 
    
    
     // Apply coupon first 
     if (couponDiscount > 0) {
      if (totalP <= couponDiscount) {
        // Coupon is larger than or equal to totalPrice, so totalPrice becomes 0
        couponDiscount = totalP;
        //cart.couponBalance = totalP; // Full coupon is used
        totalP= 0;
      } else {
        // Apply part of the coupon 
        totalP -= couponDiscount;
      }
    }

    // Apply wallet balance second
    if (walletDiscount > 0) {
      if (totalP <= walletDiscount) {
        // Wallet is larger than or equal to remaining totalPrice, apply remaining wallet balance
        user.walletBalance += (walletDiscount - totalP); // Return unused wallet balance
        cart.walletBalance = totalP ; // Only use what’s left
        totalP = 0;
      } else {
        // Apply part of the wallet balance
        totalP -= walletDiscount;
      }
    }

   
  
    //let totalAmount = totalP// Final total after coupon and wallet discounts
    let totalAmount = parseFloat(totalP.toFixed(2));

    // Save the updated balances
    await user.save();
    await cart.save(); 
   console.log(totalP)
    return res.render("frontend/cart.ejs" , { logo , user , userId , cart , totalItems , totalAmount , couponDiscount, totalPrice  , genderCategory ,cartTotal }) ; 
  }
  else{
    return res.render("frontend/cart.ejs" , { logo, user, userId , genderCategory , cart : false , cartTotal }) ; 
  }

}catch(err){
    console.log(err); 
    res.status(500).render("frontend/404");  
}

}




//POST ADD TO CART
// const addToCart  =  async  ( req,res )  =>{
//     try{
//         let { userId , productId , sizeId , size , price , discountedPrice , discountPercentage } = req.body ; 
          
//         // Find the product and filter the specific size object   
//         const product = await Product.findOne(
//           { _id: productId },
//           { sizes: { $elemMatch : { _id : sizeId } } } 
//         );   
        
      
//         const stockAvl = product.sizes[0].quantity ;  
        
//          // Check if the user already has a cart
//          let cart = await Cart.findOne({ user : userId }) ;
      
              
//          let quantity = 1 ; //default
      
      
//          // Create the new cart item  
//          const cartItem = {
//           product: productId,
//           size: size,
//           price: price,
//           quantity: quantity,
//           discountedPrice: discountedPrice,
//           discountPercentage: discountPercentage 
//         };
      
        
        
//         if(cart){
//            let existingItem = cart.items.find(
//               item => item.product.toString() === productId && item.size === size 
//            ) ;
//            if(existingItem  &&  stockAvl > existingItem.quantity ){
//               if(existingItem.quantity < 5){
//                 existingItem.quantity += quantity ; 
      
//               }else{
//                 return res.status(422).json({
//                   message: "Maximum limit exeeds!" ,
//                   success : false ,
//                });
//               }
//            }else if(!existingItem && stockAvl > 0){
//               cart.items.push(cartItem) ; 
//            }else{
//               return res.status(422).json({
//                  message: "This item is no more available",
//                  success : false ,
//               });
//            }
//         }else{
//           if(stockAvl > 0 ){
      
//             cart = new Cart({
//               user : userId ,
//               items : [cartItem ] ,
//             });
      
//           }else{
//             return res.status(422).json({
//               message: "This item is out of stock",
//               success : false ,
//            });
//           }
//         }
      
//         await cart.save().then(()=>{ 
//           return res.status(200).json({ message : "product added to cart" , success : true });
//         }).catch((error)=>console.log(error.message)) ;
//     }catch(err){
//         console.log(err) ;
//         res.status(500).render("frontend/404");  
    
//     }
// }




const addToCart = async (req, res) => {
  try {
    let { userId, productId, sizeId, size, price, discountedPrice, discountPercentage } = req.body;

    // Find the product and filter the specific size object
    const product = await Product.findOne(
      { _id: productId },
      { sizes: { $elemMatch: { _id: sizeId } }, images: 1 } // Ensure `images` field is included
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found', success: false });
    }
    
    const stockAvl = product.sizes[0].quantity;

    // Fetch the product image path (assuming the product has an images array or a single image path)
    const imagePath = product.images && product.images[0]; // Use the first image for simplicity
    let imageBuffer = null;
     
    if (imagePath) {
      // Construct the correct absolute path to the image file using __dirname
      const imageFilePath = path.join(__dirname, '..', '..', '..', imagePath); // Adjust this path to correctly point to the root of your project
      
      // Check if the image file exists
      if (fs.existsSync(imageFilePath)) {
        // Read the image file and store it as a buffer
        imageBuffer = fs.readFileSync(imageFilePath);
      } else {
        console.log('Image not found at path:', imageFilePath);
        return res.status(404).json({ message: 'Image not found', success: false });
      }
    }

    // Check if the user already has a cart
    let cart = await Cart.findOne({ user: userId });

    let quantity = 1; // Default quantity

    // Create the new cart item
    const cartItem = {
      product: productId,
      size: size,
      price: price,
      quantity: quantity,
      discountedPrice: discountedPrice,
      discountPercentage: discountPercentage,
      image: imageBuffer // Store the image as a buffer in the cart item
    };

    if (cart) {
      let existingItem = cart.items.find(
        item => item.product.toString() === productId && item.size === size
      );

      if (existingItem && stockAvl > existingItem.quantity) {
        if (existingItem.quantity < 5) {
          existingItem.quantity += quantity;
        } else {
          return res.status(422).json({
            message: "Maximum limit exceeded!",
            success: false,
          });
        }
      } else if (!existingItem && stockAvl > 0) {
        cart.items.push(cartItem);
      } else {
        return res.status(422).json({
          message: "This item is no longer available",
          success: false,
        });
      }
    } else {
      if (stockAvl > 0) {
        cart = new Cart({
          user: userId,
          items: [cartItem],
        });
      } else {
        return res.status(422).json({
          message: "This item is out of stock",
          success: false,
        });
      }
    }

    await cart.save()
      .then(() => {
        return res.status(200).json({ message: "Product added to cart", success: true });
      })
      .catch((error) => console.log(error.message));

  } catch (err) {
    console.log(err);
    res.status(500).render("frontend/404");
  }
};








const increQuantity = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    const MAX_QUANTITY = 5;

    // Get cart item
    const cart = await Cart.findOne(
      { user: userId },
      { items: { $elemMatch: { _id: itemId } } }
    );

    if (!cart?.items?.[0]) {
      return res.status(404).json({ 
        message: 'Item not found', 
        success: false 
      });
    }

    const item = cart.items[0];
    
    // Check product availability
    const product = await Product.findOne(
      { _id: item.product },
      { sizes: { $elemMatch: { size: item.size } } }
    );

    if (!product?.sizes?.[0]) {
      await Cart.updateOne(
        { user: userId, 'items._id': itemId },
        { $set: { 'items.$.status': 'Unavailable' } }
      );
      return res.status(400).json({ 
        message: 'Product unavailable', 
        success: false 
      });
    }

    const stockQuantity = product.sizes[0].quantity;

    // Check quantity limits
    if (item.quantity >= MAX_QUANTITY) {
      return res.status(400).json({ 
        message: 'Maximum limit exceeded', 
        success: false 
      });
    }

    if (item.quantity >= stockQuantity) {
      return res.status(400).json({ 
        message: `Only ${stockQuantity} items available`, 
        success: false 
      });
    }

    // Update cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, 'items._id': itemId },
      { 
        $inc: { 'items.$.quantity': 1 },
        $set: { 'items.$.status': 'Available' }
      },
      { new: true }
    );

    let quantity = updatedCart.items.find(item => item._id.toString() === itemId)?.quantity || 0;
   
    // Calculate totals
    let totals = updatedCart.items.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.quantity,
      totalPrice: acc.totalPrice + (item.quantity * item.discountedPrice)
    }), { totalItems: 0, totalPrice: 0 });

    // Round totalPrice to 2 decimal places
    const totalPrice =  parseFloat(totals.totalPrice.toFixed(2));
    
    let totalAmount = totalPrice - (updatedCart.walletBalance + updatedCart.couponBalance);
    totalAmount     = totalAmount < 
   
    return res.status(200).json({
      message: 'Product quantity updated',
      ...totals,
      totalAmount : parseFloat(totalAmount.toFixed(2)) , 
      quantity ,
      success: true
    });

  } catch (error) {
    console.error('Cart increment error:', error);
    return res.status(500).json({ 
      message: 'Error updating cart', 
      success: false 
    });
  }
};

  

  

  
  const decreQuantity = async ( req , res ) => {
   
    try{
        const {userId , itemId} = req.body ; 
        const cart = await Cart.findOne({user : userId },{ items : {$elemMatch : { _id : itemId}}}) ;
      
        const productId = cart.items[0].product ;
        const size = cart.items[0].size ; 
        
        const product = await Product.findOne({ _id : productId }, {sizes : { $elemMatch : {size} }}) ;
      
        if(cart.items[0].quantity > 1){
           const productQuant = product.sizes[0].quantity; 
      
          if(cart.items[0].quantity <= product.sizes[0].quantity+1 ){
      
           const updatedCart =  await Cart.findOneAndUpdate(
              { user: userId, 'items._id': itemId },
              {
                $set: {
                  'items.$.quantity': cart.items[0].quantity -1,
                  'items.$.status': 'Available',
                },
              }, {new : true}
            );
            
            let quantity = updatedCart.items.find(item => item._id.toString() === itemId)?.quantity || 0;

            // Calculate totals
            const totals = updatedCart.items.reduce((acc, item) => ({
              totalItems: acc.totalItems + item.quantity,
              totalPrice: acc.totalPrice + ( item.quantity * item.discountedPrice )
            }), { totalItems: 0, totalPrice: 0 } ) ; 
        
            const totalPrice  = parseFloat(totals.totalPrice.toFixed(2));
            console.log(totalPrice)
            let totalAmount = totalPrice - ( updatedCart.walletBalance + updatedCart.couponBalance ) ;

            totalAmount = parseFloat(totalAmount).toFixed(2) ;
 
            totalAmount = totalAmount < 0 ? 0 : totalAmount ;
           
            const totalItems  = totals.totalItems ; 
            const status = updatedCart.items.find(item => item._id.toString() === itemId)?.status || 0 ; 
            
      
            return res.status(200).json({ message : "one quantity removed" ,quantity, totalPrice, totalItems , status , totalAmount  , success : true }); 
         
          }else{
      
            await Cart.findOneAndUpdate(
              { user: userId, 'items._id': itemId },
              {
                $set: {
                  'items.$.quantity' : product.sizes[0].quantity, 
                  'items.$.status': 'Unavailable',
                },
              }
            );
      
          return res.status(400).json({ message : `Product unavailable .Only ${product.sizes[0].quantity} are left! `  , success : false });
          }
        }else{
          return res.status(400).json({ message : "Quantity must be minimum One" , success : false }) ;
        }

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    }

  }  
  


  
  
  
  //remove item
  const removeItem = async (req,res) =>{
    try{
        const {userId , itemId} = req.body ; 
        const cart = await Cart.findOneAndUpdate({ user: userId} ,{ $pull: { items: { _id: itemId } } } )
        cart.save().then(()=>{
          return res.status(200).json({message : "Item remove Successfully"} );
        }).catch((err)=>console.log(err.message)); 
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    }
  
  }
     
 





module.exports  =   {  getCart , addToCart , decreQuantity , increQuantity , removeItem   } ; 