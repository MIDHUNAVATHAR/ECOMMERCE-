


//import modules
const   multer  =  require("multer")  ; 




const uploadLogos  = multer({
    storage :  multer.diskStorage ({ 
        destination : "uploads/logo",   
        filename    : (req , file , cb ) =>{ 
            cb(null , Date.now() + file.originalname)   
        }
     })
 }).single("logo");  





const uploadBanners  = multer({
    storage :  multer.diskStorage ({ 
        destination : "uploads/banner",    
        filename    : (req , file , cb ) =>{ 
            cb(null , Date.now() + file.originalname ) ;   
        }
     })
 }).single("banner") ; 





const uploadProduct = multer({
    storage :  multer.diskStorage ({  
        destination : "uploads/product",   
        filename    : (req , file , cb ) =>{ 
            cb(null , Date.now() + file.originalname)   
        }
     })
}).array( 'productImages' , 10 ) ;   





 module.exports  =  {  uploadLogos  ,  uploadBanners  , uploadProduct  } ;  
