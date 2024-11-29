


// Import the multer module for handling file uploads
const   multer     =  require("multer")  ; 




// Configure multer for uploading logo files
const uploadLogos  =  multer({
    storage :  multer.diskStorage ({ 
        destination : "uploads/logo",                  // Directory to store uploaded logo files
        filename    : (req , file , cb ) =>{ 
            // Define the file naming convention: prepend the current timestamp to the original file name
            cb(null , Date.now() + file.originalname )    
        }
     })
 }).single("logo") ;                                   // Allow uploading a single file with the field name "logo"          




 // Configure multer for uploading banner files
const uploadBanners  = multer({
    storage :  multer.diskStorage ({ 
        destination : "uploads/banner",                 // Directory to store uploaded banner files
        filename    : (req , file , cb ) =>{ 
            // Define the file naming convention: prepend the current timestamp to the original file name
            cb(null , Date.now() + file.originalname ) ;   
        }
     })
 }).single("banner") ;                                  // Allow uploading a single file with the field name "banner"





 // Configure multer for uploading product images
const uploadProduct = multer({
    storage :  multer.diskStorage ({  
        destination : "uploads/product",                // Directory to store uploaded product images
        filename    : (req , file , cb ) =>{ 
            // Define the file naming convention: prepend the current timestamp to the original file name
            cb( null , Date.now() + file.originalname )     
        }
     })
}).array( 'productImages' , 10 ) ;                      // Allow uploading multiple files (up to 10) with the field name "productImages"





// Export all upload configurations to use them in other parts of the application
 module.exports  =  {  uploadLogos  ,  uploadBanners  , uploadProduct  } ;  










