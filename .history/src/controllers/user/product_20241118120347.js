
const mongoose = require('mongoose');
const axios    = require('axios');


//import schemas
const Product         =  require("../../models/product")  ;
const Logo            =  require("../../models/logoSchema") ;
const GenderCategory  =  require("../../models/genderCategory") ;
const User            =  require("../../models/userSchema") ;
const Cart            =  require("../../models/cartSchema") ;
const Reviews         =  require("../../models/reviewSchema") ;
 




//$-----------------------------------------------------------------------------$//




//GET PRODUCTS PAGE 
const products = async ( req , res ) => { 

    try{
     
      const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
    
    const subcategoryId = req.query.subcategoryId;  
    const logo = await Logo.findOne().sort({ updatedAt: -1 });
  
    const genderCategory = await GenderCategory.find({ softDelete : false });
   
    let user;
    if(userId){
       user = await User.findById( userId )
    }
   

    // Calculate cart total
    let cartTotal = 0; 
    if (user) {
       const cart = await Cart.findOne({ user: user._id });
       if (cart) {
          cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0);
       }
    }
  
    // Extract sorting and filter query params  
    const result = req.query.result ;
    const price = req.query.price ;
    const status = req.query.status ;
    const sort = req.query.namesort ;
    const category = req.query.category ; 
  
    // Build query conditions dynamically
    let query = { softDelete: false }; // Base condition to filter non-deleted products
  
    // Filter by subcategory if present
    if (subcategoryId) {
       query.productSubCategory = { $in: [subcategoryId] };
    }
  
    // Filter by search result (title) if present
    if (result) {
       query.title = { $regex: result, $options: 'i' };
      // delete query.productSubCategory ;
      delete query["productSubCategory"] ;
    }
  
    // Filter by status if present
    if (status) {
       query.status = status; // Assuming your product model has a status field
    }
  
  
    //category
    if(category){
      query.genderCategory = category ; 
    }
  
  
    // Sorting logic
    let sortOption = {};
    if (price === 'low-to-high') {
       sortOption = { 'sizes.0.discountedPrice': 1 }; // Sort by price ascending
    } else if (price === 'high-to-low') {
       sortOption = { 'sizes.0.discountedPrice': -1 }; // Sort by price descending
    }
  
    if (sort === 'a-z') {
       sortOption = { title: 1 }; // Sort by name ascending
    } else if (sort === 'z-a') {
       sortOption = { title: -1 }; // Sort by name descending
    }
  
    // Find products based on the query and sort options
    const products = await Product.find(query).sort(sortOption);
  
    // Render the products page with the filtered and sorted data
    res.render("frontend/products-page", { logo, genderCategory, user,userId  ,  products, cartTotal });
  }catch(err){
    console.log(err);
    res.status(500).render("frontend/404");  

  }
  
  }   






//GET  PRODUCT PAGE
const product = async ( req , res ) =>{ 
     
    try {
        
      const productId = req.params.id; // assuming product ID is passed as a URL parameter
      const sizeId = req.query.id; // size ID passed as a query parameter

        // Check if the ID is a valid ObjectId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error(`Invalid product ID: ${productId}`);
      }

      if(sizeId){
        if (!mongoose.Types.ObjectId.isValid(sizeId)) {
          throw new Error(`Invalid size ID: ${sizeId}`);
        }
      }
    
        
        const product = await Product.findById(productId)
        .populate('genderCategory')
        .populate('productCategory')       

        
        
        const relatedProducts = await Product.find({
          productCategory: product.productCategory,
          _id: { $ne: productId } // Exclude the current product from the related products
        });
       
        const reviews = await Reviews.find({product : productId}).populate("user")
        
        // Convert sizeId to ObjectId
        const selectedSizeId = sizeId  || product.sizes[0]._id l;  
     
        // Find the object in the sizes array with the specific _id
        const selectedObject = product.sizes.find(item => item._id.equals(selectedSizeId)) ;
        if(!selectedObject){
          throw new Error("size id can't exists")
        }
      
        
        const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
        
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
       
        let cartTotal ; 
         if(userId){
         const cart = await Cart.findOne({user : userId});
         if(cart){
          cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0); 
         } 
         }else{
         cartTotal = 0;
         }
     
        const genderCategory = await GenderCategory.find({softDelete : false});
      
    
        if (!product) {
          return res.status(404).render('404'); // Render a 404 page if the product is not found
        }
    
        res.render( 'frontend/product-page', {
          logo,
          product,
          user : userId,
          userId,
          genderCategory , 
          selectedObject,
          cartTotal,
          selectedSizeId,
          reviews,
          relatedProducts 
          
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("frontend/404");  
      }

}





module.exports = { products , product }  ; 