

//import modules
const fs                      = require('fs');
const path                    = require('path');




//import schemas 
const   Product               =   require("../../models/product") ; 
const   GenderCategory        =   require("../../models/genderCategory") ;
const   ProductCategory       =   require("../../models/productCategory") ;



//import multer funtions 
const { uploadProduct }       =   require("../../configs/multer") ;





//GET  ADD PRODUCT PAGE 
const  addProduct   =   async  ( req , res )  => {
    try{
       
        const genderCategories = await GenderCategory.find() ;
        const productCategories = await ProductCategory.find().populate('genderCategory');
        console.log(req.session)
    
        res.render("backend/admin-dashboard.ejs" ,{ message : '' , admin : req.session.admin.email , partial : "partials/add-product" , genderCategories , productCategories  }) ;  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;  
    }
}
 



//POST ADD PRODUCT
const  addProductPost  =  async  ( req , res )  => {
    uploadProduct(req, res, async function (err) {

        if (err) {
            return res.status(400).json({ error: 'Error uploading files: ' + err.message }) ; 
        }
        
        try {
           
             let {
                 title, titleDescription, productDescription, highlights, details,
                 genderCategory, productCategory, size , quantity , price ,
             } = req.body ;

             title = title.trim();
             titleDescription = titleDescription.trim();
             productDescription = productDescription.trim();
             highlights = highlights.trim();
             details   = details.trim();


             if(!size || !quantity || !price){
               return  res.status(400).json({ size: 'Fill size fields' }) ; 
             }
              

            const sizes = [] ;
            for(let i = 0 ; i < size.length ; i++){
                const productObject = { 
                    size : size[i],
                    price : parseFloat(price[i]), 
                    quantity : parseInt(quantity[i]),
                }
                sizes.push( productObject );
            }

            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => `/uploads/product/${file.filename}`) ; 
            }
 
            
             const product = new Product({
                 title ,
                 titleDescription ,
                 sizes ,
                 productDescription ,
                 highlights ,
                 details ,
                 genderCategory ,
                 productCategory ,
                 images: imageUrls ,
                 sizes ,
             });
             
            
            await product.save().then( savedproduct => console.log( "New Product Successfully Added" )).catch( error => console.log(error) );
            
            res.status(200).json({ message: 'Product added successfully' });
        } catch (error) {
            console.log(error) ;
            res.status(500).render("frontend/404") ;      
        }

    });
}




//GET LIST PRODUCTS
const  listProducts  =   async  ( req , res ) =>{
  
    
    try{
        const page = parseInt(req.query.page) || 1 ;
        const limit = 8 ; 
        const searchKeyword = req.query.search || "" ;
    
        const searchQuery = { title : { $regex : searchKeyword , $options : "i" } } ; 
        
        const totalProducts = await Product.countDocuments(searchQuery) ;
        const skip = ( page-1 ) * limit ; 
        
        const products = await Product.find(searchQuery).skip(skip).limit(limit) ; 
        const totalPages = Math.ceil( totalProducts/limit ) ;  
    
        res.render("backend/admin-dashboard.ejs" ,{message : '', admin : req.session.admin.email , partial : "partials/product-list" , products , totalPages ,
         currentPage : page , searchKeyword }) ;
    
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;         
    }
}





//GET EDIT PRODUCT
const  editProduct  =  async  ( req , res  )  =>{
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const genderCategories = await GenderCategory.find();
        const productCategories = await ProductCategory.find().populate('genderCategory'); 
         
        res.render("backend/admin-dashboard.ejs" ,{message : '',admin : req.session.admin.email , partial : "partials/edit-product" , genderCategories , productCategories , productSubCategories , product}) ; 
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;        
    }
}




//POST EDIT PRODUCT
const  editProductPost  = async  ( req , res )  =>{
    try{
        const { id } = req.params ; 
        const product = await Product.findById(id); 
    
        if (!product) {
            return res.status(404).json( { error : 'Product not found' } ) ;
        } 
          

        let  {
            title, titleDescription, productDescription, highlights, details,
            genderCategory, productCategory, productSubCategory , size , quantity , price , 
        } = req.body ;
      
        title = title.trim();
        titleDescription = titleDescription.trim();
        productDescription = productDescription.trim();
        highlights  =  highlights.trim();
        details  = details.trim();
        
         

        const sizes = [] ;
        for(let i = 0 ; i < size.length ; i++){
           const productObject = {
               size : size[i],
               price : parseFloat(price[i]),
               quantity : parseInt(quantity[i]),
           

           }
           sizes.push( productObject );
        }

        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
           newImageUrls = req.files.map(file => `/uploads/product/${file.filename}` ) ; 
        }



         // Append the new images to the existing image array without overwriting the old images
         const allImageUrls = [...product.images, ...newImageUrls];

         // Update the product fields with the new data, keeping existing ones where no new data is provided
         product.title = title || product.title;
         product.titleDescription = titleDescription || product.titleDescription;
         product.productDescription = productDescription || product.productDescription;
         product.highlights = highlights || product.highlights;
         product.details = details || product.details;
         product.genderCategory = genderCategory || product.genderCategory;
         product.productCategory = productCategory || product.productCategory;
         product.productSubCategory = productSubCategory || product.productSubCategory;
         product.sizes = sizes.length > 0 ? sizes : product.sizes;  // Update sizes if provided
         product.images = allImageUrls;  // Merge new images with the existing ones

          // Save the updated product
         await product.save();

         res.status(200).json({ message: 'Product updated successfully' });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;       
    }
}




//POST DELETE SIZE
const   deleteSize  =  async  ( req , res  )  =>{
    try{
        const { productid , sizeid } = req.params;  // Get the ID from the URL
        await Product.updateOne({ _id : productid  } , { $pull: { sizes: { _id: sizeid } } } );   //find product and delete the size based on the size id
        res.status(200).json({ message: 'Size deleted successfully' });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;          
    }
}




//DELETE PRODUCT IMAGE
const   deleteProductImage  =  async  ( req , res )  =>{
    try{
        const { imgSrc , productId } = req.body ;
        const filePath = path.join(__dirname,"../" ,"../","../",imgSrc);
        console.log(filePath)
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, async (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return res.status(500).json( { success : false , message : 'Failed to delete the image file' } ) ; 
                }
    
                // After file deletion, remove the image path from the MongoDB product document
            
                    const updatedProduct = await Product.findByIdAndUpdate(
                        productId,
                        { $pull: { images: imgSrc } },  // Remove the image path from the `images` array
                        { new: true }  // Return the updated product document 
                    );
    
                    if (!updatedProduct) {
                        return res.status(404).json({ success: false, message: 'Product not found' });
                    }
    
                    res.json({ success: true, message: 'Image deleted from server and database', product: updatedProduct }) ;

            });
        }else{
            res.status(404).json({ success : false, message: 'File not found on the server' });
        }

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;           
    }
}




//BLOCK PRODUCT
const  blockProduct  =  async  ( req , res )  => {
    try{
        const { productId } = req.body ; 
        const product = await Product.findById(productId) ;
    
            // Toggle the `softDelete` field
        product.softDelete = !product.softDelete ; 
    
        await product.save();
        res.status(404).json({ status : true });    
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;     
    }
}




//DELETE PRODUCT 
const deleteproduct  =  async ( req , res )  => {
    try{
        const productId = req.body.id
    
        // Find the product in the database
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        } 
    
        // Delete product images from server
        product.images.forEach((imagePath) => {
          const fullPath = path.join(__dirname, '../..', imagePath);
    
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Error deleting image: ${fullPath}`, err);
            }
          });
        });
    
        // Delete product from the database
        await Product.findByIdAndDelete(productId);
    
        // Respond to client
        res.status(200).json({ success : true ,message: 'Product and images deleted successfully' });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;          
    }
}





module.exports  =  {  addProduct , addProductPost , listProducts , editProduct ,
                      editProductPost  ,  deleteSize  ,  deleteProductImage , deleteProductImage  ,
                      blockProduct ,  deleteproduct 
 }  ;