



//import schemas
const   GenderCategory      =   require("../../models/genderCategory") ;
const   ProductCategory     =   require("../../models/productCategory") ;
const   ProductSubCategory  =   require("../../models/productSubCategory") ;





//GET ADD CATEGORY
const  category  =  async  ( req , res )  =>{
    try{
        const genderCategories = await GenderCategory.find();
        const productCategories = await ProductCategory.find().populate('genderCategory');
        const productSubCategories = await ProductSubCategory.find().populate('genderCategory').populate('productCategory');
        res.render("backend/admin-dashboard.ejs" ,{ partial : "partials/add-category", admin : req.session.adminEmail , genderCategories , productCategories , productSubCategories}) ; 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;  
    }
}



const addGenderCategory = async (req,res) =>{ 
    
    let {name} = req.body;
    name = name.trim().toUpperCase();       
    await GenderCategory.create({name}); 
    res.redirect("/admin/addCategory") ;
} 



const addProductCategory = async (req,res) =>{
    let {name , genderCategory} = req.body ;  
    name = name.trim().toUpperCase(); 
    await ProductCategory.create({name , genderCategory});  
    res.redirect("/admin/addCategory");  
}


const addProductSubCategory = async (req,res) =>{
    let {name , genderCategory , productCategory } = req.body ; 
    name = name.trim().toUpperCase(); 
    await ProductSubCategory.create({name ,genderCategory , productCategory});
    res.redirect("/admin/addCategory");
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



 const deleteProductSubCategory = async (req , res) =>{
    try{
        const { prosubId } = req.body;
        await ProductSubCategory.findByIdAndUpdate(prosubId , { softDelete : true});
        res.json({ success: true, message: 'Product subcatgegory added successfully' }) ; 
       }catch(err){  
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
       }
 } 



 const softDeleteProductSubCate = async ( req,res ) =>{
    try{
        const { prosubId } = req.body;
        await ProductSubCategory.findByIdAndUpdate(prosubId , {softDelete : false});
        res.json({ success: true, message: 'Product subcatgegory added successfully' }) ; 
       }catch(err){ 
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
       }
 }







module.exports  =  {  category , addGenderCategory ,addProductCategory ,
    addProductSubCategory , softDeleteGenderCat  , softDeleteGenderCate   ,
    deleteProductCategory  ,  softDeleteProductCate  ,  deleteProductSubCategory  ,
    softDeleteProductSubCate
 }  