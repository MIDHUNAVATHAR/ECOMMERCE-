
// Importing schema models for gender and product categories
const   GenderCategory      =   require("../../models/genderCategory") ;
const   ProductCategory     =   require("../../models/productCategory") ;




// GET request to render the Add Category page
const  category  =  async  ( req , res )  =>{
    try{
        const selectedGender = req.query.genderCategory || '';                    // Get selected gender from query  
        const genderCategories = await GenderCategory.find();                     // Fetch all gender categories
        const productCategories = await ProductCategory.find().populate('genderCategory');   // Fetch all product categories with populated gender category
        res.render("backend/admin-dashboard.ejs" ,{ 
            partial : "partials/add-category",
            admin : req.session.admin.email  ,
            genderCategories ,
            productCategories ,
            selectedGender
         }) ;  
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;                                 // Render error page on failure
    }
}




// POST request to add a new gender category
const addGenderCategory = async (req,res) =>{ 
    let {name} = req.body;
    name = name.trim().toUpperCase();                                           // Normalize name input
    const isExists = await GenderCategory.findOne({name}) ;                     // Check if the category already exists
    if(isExists){
      return  res.redirect("/admin/addCategory?alreadyExists=1") ;              // Redirect if category already exists
    }else{
    
    await GenderCategory.create({name});                                        // Create a new gender category
    res.redirect("/admin/addCategory?added=1") ;                                // Redirect on successful creation
    }
} 




// POST request to edit an existing gender category
const editGenderCategory =  async ( req , res ) =>{
    const { id } = req.params;                                                  // Get the category ID from URL params
    let { name } = req.body;
    name = name.trim().toUpperCase() ;                                          // Normalize name input

  
    try {
        const isExists = await GenderCategory.findOne({name})                  // Check if category with new name already exists
        if(isExists){
            return res.status(409).json({message : "category already exists"});// Return conflict response if exists
        }

        // Update category by ID
        const category = await GenderCategory.findByIdAndUpdate(
            id,
            { name: name },
            { new: true } // Return the updated document
        );

        if (!category) {
            // If category is not found, send a 404 error
            return res.status(404).json({ message: 'Category not found' });
        }

        // Send success response
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Failed to update category' });     // Handle server error
    }
}




// POST request to add a new product category
const addProductCategory = async (req,res) =>{
    let {name , genderCategory} = req.body ;  
    name = name.trim().toUpperCase();                                      // Normalize name input
    if(!genderCategory){
        return  res.redirect("/admin/addCategory?genderCategory=0") ;      // Redirect if gender category is not selected
    }
    const isExists = await ProductCategory.findOne({name , genderCategory});// Redirect if exists
    if(isExists){
      return  res.redirect("/admin/addCategory?alreadyExists=1") ;
    }else{
      await ProductCategory.create({name , genderCategory});                 // Create new product category
      res.redirect("/admin/addCategory?added=1");                            // Redirect after creation
    } 
}




// POST request to edit an existing product category
const editProductCategory =  async ( req , res ) =>{
    const { id } = req.params;                                            // Get product category ID
    let { name } = req.body;
    console.log(id , name)
    name = name.trim().toUpperCase() ;                                    // Normalize name input
  
    try {
        const isExists = await  ProductCategory.findOne({name})           // Check if category with new name exists
        if(isExists){
            return res.status(409).json({message : "category already exists"}); // Return conflict response if exists
        }


        // Find the gender category by ID and update its name
        const category = await ProductCategory.findByIdAndUpdate(
            id,
            { name: name },
            { new: true } // Return the updated document
        );

        if (!category) {
            // If category is not found, send a 404 error
            return res.status(404).json({ message: 'Category not found' });
        }

        // Send success response
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Failed to update category' }); // Handle server error
    }
}






// POST request to soft delete a gender category (set softDelete flag to true)
const softDeleteGenderCat =  async(req,res) =>{
    try{
     const { genderId } = req.body;                                                 // Get the gender category ID
     await GenderCategory.findByIdAndUpdate(genderId , {softDelete : true});        // Set softDelete flag to true
     res.json({ success: true, message: 'Gender catgegory deleted successfully' }) ;// Respond with success 
 
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });   // Handle server error
    }
 }





 // POST request to restore a soft-deleted gender category (set softDelete flag to false)
 const softDeleteGenderCate =  async(req,res) =>{
    try{
     const { genderId } = req.body;                                               // Get the gender category ID
     await GenderCategory.findByIdAndUpdate(genderId , {softDelete : false});     // Restore soft-deleted category
     res.json({ success: true, message: 'Gender catgegory added successfully' }) ;// Respond with success
 
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' }); // Handle server error
    }
 }





 // POST request to soft delete a product category (set softDelete flag to true)
 const deleteProductCategory = async ( req , res ) =>{
    try{
    const { productId } = req.body;                                                // Get the product category ID
     await ProductCategory.findByIdAndUpdate(productId , {softDelete : true});     // Set softDelete flag to true
     res.json({ success: true, message: 'Product catgegory deleted successfully'});// Respond with success  
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });   // Handle server error
    }
  }





  // POST request to restore a soft-deleted product category (set softDelete flag to false)
  const softDeleteProductCate =  async(req,res) =>{
    try{
      const { productId } = req.body;                                               // Get the product category ID
      await ProductCategory.findByIdAndUpdate(productId , {softDelete : false});    // Restore soft-deleted category
      res.json({ success: true, message: 'Product catgegory added successfully' }) ;// Respond with success
    }catch(err){ 
      console.error(err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });   // Handle server error
    }
 } 











module.exports  =  {  
    category ,
    addGenderCategory ,
    editGenderCategory ,
    addProductCategory ,
    editProductCategory,
    softDeleteGenderCat  ,
    softDeleteGenderCate   ,
    deleteProductCategory  , 
    softDeleteProductCate   ,
 }  