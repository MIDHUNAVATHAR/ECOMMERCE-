



//import schemas
const   GenderCategory      =   require("../../models/genderCategory") ;
const   ProductCategory     =   require("../../models/productCategory") ;
const   ProductSubCategory  =   require("../../models/productSubCategory") ;





//GET ADD CATEGORY
const  category  =  async  ( req , res )  =>{
    try{

        const selectedGender = req.query.genderCategory || '';
       

        const genderCategories = await GenderCategory.find();
        const productCategories = await ProductCategory.find().populate('genderCategory');
        const productSubCategories = await ProductSubCategory.find().populate('genderCategory').populate('productCategory');
        res.render("backend/admin-dashboard.ejs" ,{ partial : "partials/add-category", admin : req.session.adminEmail , genderCategories , productCategories , productSubCategories , selectedGender}) ; 
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


const addProductSubCategory = async (req,res) =>{
    let {name , genderCategory , productCategory } = req.body ; 
    name = name.trim().toUpperCase(); 
    if(!genderCategory){
        return  res.redirect("/admin/addCategory?genderCategory=0") ;
    }
    if(!productCategory){
        return  res.redirect("/admin/addCategory?productCategory=0") ;
    }

    const isExists = await ProductSubCategory.findOne({name , genderCategory , productCategory }) ;
    if(isExists){
      return  res.redirect("/admin/addCategory?alreadyExists=1") ;
    }else{

    await ProductSubCategory.create({name ,genderCategory , productCategory});
    res.redirect("/admin/addCategory?added=1");
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