

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
    const genderCategory = await GenderCategory.find({ softDelete : false}); 
    const user = await User.findById(req.session.userId) || req.user  ;       // req.user is user obejct
    const cart = await Cart.findOne({ user }).populate('items.product');

   let cartTotal ; 
   if(user){
   const cart = await Cart.findOne({user : user._id});
   if(cart){
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
      totalItems += item.quantity ;
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
   let totalP = totalPrice


    let couponDiscount =  cart.couponBalance || 0;   
    let walletDiscount = cart.walletBalance || 0; 
    
    
     // Apply coupon first 
     if (couponDiscount > 0) {
      if (totalP <= couponDiscount) {
        // Coupon is larger than or equal to totalPrice, so totalPrice becomes 0
        couponDiscount = totalP;
        cart.couponBalance = totalP; // Full coupon is used
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

    let totalAmount = totalP ; // Final total after coupon and wallet discounts

    // Save the updated balances
    await user.save();
    await cart.save(); 
       
    return res.render("frontend/cart.ejs" , { logo , user , cart , totalItems , totalAmount , couponDiscount, totalPrice , totalAmount , genderCategory ,cartTotal }) ; 
  }
  else{
    
    return res.render("frontend/cart.ejs" , { logo, user, genderCategory , cart : false , cartTotal}) ; 

  }

}catch(err){
    console.log(error)
    res.status(500).render("frontend/404");  
}

}




//POST ADD TO CART
const addToCart  =  async  ( req,res )  =>{
    try{
        let { userId , productId , sizeId , size , price , discountedPrice , discountPercentage } = req.body ; 

        // Find the product and filter the specific size object   
        const product = await Product.findOne(
          { _id: productId },
          { sizes: { $elemMatch : { _id : sizeId } } } 
        );   
      
        const stockAvl = product.sizes[0].quantity ;  
        
         // Check if the user already has a cart
         let cart = await Cart.findOne({ user : userId }) ;
      
              
         let quantity = 1 ; //default
      
      
         // Create the new cart item  
         const cartItem = {
          product: productId,
          size: size,
          price: price,
          quantity: quantity,
          discountedPrice: discountedPrice,
          discountPercentage: discountPercentage 
        };
      
        
        
        if(cart){
           let existingItem = cart.items.find(
              item => item.product.toString() === productId && item.size === size 
           ) ;
           if(existingItem  &&  stockAvl > existingItem.quantity ){
              if(existingItem.quantity < 5){
                existingItem.quantity += quantity ; 
      
              }else{
                return res.status(422).json({
                  message: "Maximum limit exeeds!" ,
                  success : false ,
               });
              }
           }else if(!existingItem && stockAvl > 0){
              cart.items.push(cartItem);
           }else{
              return res.status(422).json({
                 message: "This item is no more available",
                 success : false ,
              });
           }
        }else{
          if(stockAvl > 0 ){
      
            cart = new Cart({
              user : userId ,
              items : [cartItem ] ,
            });
      
          }else{
            return res.status(422).json({
              message: "This item is out of stock",
              success : false ,
           });
          }
        }
      
        await cart.save().then(()=>{ 
          return res.status(200).json({ message : "product added to cart" , success : true });
        }).catch((error)=>console.log(error.message)) ;
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    
    }
}




  
const increQuantity = async ( req,res ) =>{

    try{

    const {userId , itemId } = req.body ;
    const cart = await Cart.findOne({ user : userId },{ items : { $elemMatch : {  _id : itemId }}}) ;
    
    const productId = cart.items[0].product; 
    const size = cart.items[0].size ;
  
     
    /////////////////////////
    let totalItems =0 ;
    cart.items.forEach(item =>{
      totalItems += item.quantity ;
    })
  
    let totalPrice = 0;  
    const discount = 0;   //default  -->  pass coupon code as query and 
  
    for(let i=0 ; i< cart.items.length ; i++){
        for(let m =0 ; m < cart.items[i].quantity ; m++ ){
            totalPrice += cart.items[i].discountedPrice ;
        }
    }
  
    let totalAmount = totalPrice - discount ; 
    ///////////////////////// 
  
  
    const product = await Product.findOne({_id : productId},{sizes : {$elemMatch:{size }}});
    
    if( cart.items[0].quantity < 5){
        if(cart.items[0].quantity < product.sizes[0].quantity ){
        
          
          await Cart.findOneAndUpdate(
            { user: userId, 'items._id': itemId },
            {
              $set: {
                'items.$.quantity': cart.items[0].quantity + 1,
                'items.$.status': 'Available',
              },
            }
          );
         
          
        
          const productQuant = product.sizes[0].quantity;
          return res.status(200).json({ message : "product added to cart" , productQuant , totalItems , totalAmount , success : true });
        }else{
  
          if(product.sizes[0].quantity >0){
            await Cart.findOneAndUpdate(
              { user: userId, 'items._id': itemId },
              {
                $set: {
                  'items.$.quantity': product.sizes[0].quantity,
                  'items.$.status': 'Available',
                },
              }
            );
          }else{
            await Cart.findOneAndUpdate(
              { user: userId, 'items._id': itemId },
              {
                $set: {
                  'items.$.quantity': product.sizes[0].quantity,
                  'items.$.status': 'Unavailable',
                },
              }
            );
          }
         
          return res.status(400).json({ message : `Product unavailable .Only ${product.sizes[0].quantity} are left! ` , success : false });
        }
    }else{
      if(cart.items[0].quantity >= product.sizes[0].quantity ){
        const productQuant =  product.sizes[0].quantity; 
        const quanity = cart.items[0].quantity;
        cart.items[0].quantity = product.sizes[0].quantity ; 
        cart.save().then(()=>console.log("Cart updated")).catch((err)=>console.log(err.message));
        return res.status(400).json({ message : `Product unavailable .Only ${product.sizes[0].quantity} are left! `,productQuant,quanity , success : false });
      }else{
         return res.status(400).json({ message : "Maximum limit exeeds" , success : false });
    }
  }
 }catch(err){
    console.log(err) ;
    res.status(500).render("frontend/404");  
 }


  }
  
  
  
  

  
  const decreQuantity = async ( req,res ) =>{
   
    try{
        const {userId , itemId} = req.body ; 
        const cart = await Cart.findOne({user : userId },{ items : {$elemMatch:{_id : itemId}}});
      
        const productId = cart.items[0].product ;
        const size = cart.items[0].size ; 
        
        const product = await Product.findOne({_id : productId}, {sizes : { $elemMatch : {size} }}) ;
      
        if(cart.items[0].quantity > 1){
           const productQuant = product.sizes[0].quantity; 
      
          if(cart.items[0].quantity <= product.sizes[0].quantity+1 ){
      
            await Cart.findOneAndUpdate(
              { user: userId, 'items._id': itemId },
              {
                $set: {
                  'items.$.quantity': cart.items[0].quantity -1,
                  'items.$.status': 'Available',
                },
              }
            );
      
      
            return res.status(200).json({ message : "one quantity removed" , productQuant , success : true });
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
      
          return res.status(400).json({ message : `Product unavailable .Only ${product.sizes[0].quantity} are left! ` , productQuant , success : false });
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