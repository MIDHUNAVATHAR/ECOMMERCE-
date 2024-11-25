



//import schemas
const   GenderCategory      =   require("../../models/genderCategory") ;
const   ProductCategory     =   require("../../models/productCategory") ;






//GET ADD CATEGORY
const  category  =  async  ( req , res )  =>{
    try{

         
        const selectedGender = req.query.genderCategory || '';
       

        const genderCategories = await GenderCategory.find();
        const productCategories = await ProductCategory.find().populate('genderCategory');   
        res.render("backend/admin-dashboard.ejs" ,{ partial : "partials/add-category", admin : req.session.admin.email  , genderCategories , productCategories , selectedGender}) ; 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;  
    }
}



const addGenderCategory = async (req,res) =>{ 
    
    let {name} = req.body;
    name = name.trim().toUpperCase(); 
    
    const isExists = await GenderCategory.findOne({name}) ;
    if(isExists){
      return  res.redirect("/admin/addCategory?alreadyExists=1") ;
    }else{
    
    await GenderCategory.create({name}); 
    res.redirect("/admin/addCategory?added=1") ;
    }
} 


const editGenderCategory =  async ( req , res ) =>{
    const { id } = req.params;
    let { name } = req.body;
    name = name.trim().toUpperCase() ;
  
    try {

        const isExists = await GenderCategory.findOne({name})
        if(isExists){
            return res.status(409).json({message : "category already exists"});
        }

        // Find the gender category by ID and update its name
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
        res.status(500).json({ message: 'Failed to update category' });
    }
}



const addProductCategory = async (req,res) =>{
    let {name , genderCategory} = req.body ;  
    name = name.trim().toUpperCase(); 
    if(!genderCategory){
        return  res.redirect("/admin/addCategory?genderCategory=0") ;
    }
    const isExists = await ProductCategory.findOne({name , genderCategory}) ;
    console.log(isExists)
    if(isExists){
      return  res.redirect("/admin/addCategory?alreadyExists=1") ;
    }else{
    
    await ProductCategory.create({name , genderCategory});  
    res.redirect("/admin/addCategory?added=1"); 
    } 
}




const editProductCategory =  async ( req , res ) =>{
    const { id } = req.params;
    let { name } = req.body;
    console.log(id , name)
    name = name.trim().toUpperCase() ;
  
    try {

        const isExists = await  ProductCategory.findOne({name})
        if(isExists){
            return res.status(409).json({message : "category already exists"});
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
        res.status(500).json({ message: 'Failed to update category' });
    }
}





const softDeleteGenderCat =  async(req,res) =>{
    try{
     const { genderId } = req.body; 
     await GenderCategory.findByIdAndUpdate(genderId , {softDelete : true});
     res.json({ success: true, message: 'Gender catgegory deleted successfully' }) ; 
 
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
 }


 const softDeleteGenderCate =  async(req,res) =>{
    try{
     const { genderId } = req.body;
     await GenderCategory.findByIdAndUpdate(genderId , {softDelete : false});
     res.json({ success: true, message: 'Gender catgegory added successfully' }) ; 
 
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
 }





 const deleteProductCategory = async ( req , res ) =>{
    try{
    const { productId } = req.body;
     await ProductCategory.findByIdAndUpdate(productId , {softDelete : true});
     res.json({ success: true, message: 'Product catgegory deleted successfully'});  
    }catch(err){
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }



  const softDeleteProductCate =  async(req,res) =>{
    try{
     const { productId } = req.body;
     await ProductCategory.findByIdAndUpdate(productId , {softDelete : false});
     res.json({ success: true, message: 'Product catgegory added successfully' }) ; 
    }catch(err){ 
     console.error(err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
 } 











module.exports  =  {  category , addGenderCategory , editGenderCategory ,addProductCategory , editProductCategory
     , softDeleteGenderCat  , softDeleteGenderCate   ,
    deleteProductCategory  ,  softDeleteProductCate   ,
    
 }  