


//import schemas
const Logo               =  require("../../models/logoSchema")   ; 
const GenderCategory     =  require("../../models/genderCategory")  ; 
const User               =  require("../../models/userSchema" ) ;
const Banner             =  require("../../models/bannerSchema") ;
const ProductCategory    =  require("../../models/productCategory") ; 
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

        const categories = await ProductCategory.find({softDelete : false}).populate('genderCategory'); 
 
    
        const categoryProducts = await Promise.all( categories.map ( async ( category ) => {
            const products = await Product.find({ productCategory : category._id  , softDelete : false })   
              .sort({ createdAt : -1 })  
              .limit(8); 
             return {    
               category ,        
               products  
             }; 
         })) ;   
        
     
    res.render("frontend/landing-page" , { logo , banners , user , u , categoryProducts , genderCategory , cartTotal } ) ; 

  }catch(err){
    console.log(err)
    res.status(500).render("frontend/404") ;   
  }
}
 



module.exports  =  { landingPage  }  ;             