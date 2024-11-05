


//import schemas
const Logo               =  require("../../models/logoSchema")   ; 
const GenderCategory     =  require("../../models/genderCategory")  ; 
const User               =  require("../../models/userSchema" ) ;
const Banner             =  require("../../models/bannerSchema") ;
const ProductCategory    =  require("../../models/productCategory") ; 
const ProductSubCategory =  require("../../models/productSubCategory") ; 
const Product            =  require("../../models/product") ;
const Cart               =  require("../../models/cartSchema")  ; 




//$-----------------------------------------------------------------------------$//


 
// GET LANDING PAGE 
const landingPage   =  async  ( req , res )  => {

  try{
    const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
    const genderCategory = await GenderCategory.find({softDelete : false}) ;  
    let userId = (req.session && req.session.userId) || (req.user && req.user._id);
    let user ;
    let cartTotal ;
 
    if(userId){
      const cart = await Cart.findOne({user : userId}) ;   
        if(cart){
         cartTotal = cart.items.reduce((total, item) =>{  
           return item.status  ==  "Available" ? total + item.quantity : total } ,  
          0);
            
         user = await User.findById(userId) ;
         }
     }else{ 
        cartTotal = 0 ;  
        user = null ;         
     }  

        const banners = await Banner.find().sort({updatedAt :-1 }).limit(3) ;  

        const subCategories = await ProductSubCategory.find({softDelete : false}).populate('genderCategory'); 
 
    
        const subCategoryProducts = await Promise.all( subCategories.map ( async ( subCategory ) => {
            const products = await Product.find({ productSubCategory : { $in: [subCategory._id] } , softDelete : false })  
              .sort({ createdAt : -1 })  
              .limit(8); 
             return {    
               subCategory ,        
               products  
             }; 
         })) ;   
        
    res.render("frontend/landing-page" , { logo , banners , user , subCategoryProducts , genderCategory , cartTotal } ) 

  }catch(err){
    console.log(err)
    res.status(500).render("frontend/404") ;   
  }
}
 




//GET CATEGORIES 
const categorySection = async ( req , res ) =>{

  const categoryId = req.params.id ; 

  try {
      const productCategories = await ProductCategory.find({ genderCategory : categoryId , softDelete : false }); 

      const producatAndSubCat =  await Promise.all(productCategories.map( async (productCategory)=>{
          const subCategories = await ProductSubCategory.find({productCategory : productCategory._id , softDelete : false }) ; 
          return { productCategory , subCategories } ; 
      } )) 

      res.render("frontend/partials/productCategory", { producatAndSubCat  }) ;  
  } catch (error) {  
      console.log(error)
      res.status(500).render("frontend/404");  
  }
}
  



 


module.exports  =  { landingPage , categorySection }  ;             