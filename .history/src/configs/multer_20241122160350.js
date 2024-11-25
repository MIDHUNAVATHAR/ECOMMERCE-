


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
            cb( null , Date.now() + file.originalname )     
        }
     })
}).array( 'productImages' , 10 ) ;   





 module.exports  =  {  uploadLogos  ,  uploadBanners  , uploadProduct  } ;  












 // Import required modules
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// // Initialize AWS SDK with your credentials
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Your AWS Access Key ID
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Your AWS Secret Access Key   
//   region: 'us-east-1'  // Specify your AWS region
// });

// // Logo upload configuration
// const uploadLogos = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'your-bucket-name',  // Replace with your S3 bucket name
//     acl: 'public-read',  // Set file permissions (e.g., public read access)
//     key: (req, file, cb) => {
//       // Set the file path in S3 (logos are stored in the 'logos' folder)
//       cb(null, `uploads/logo/${Date.now()}-${file.originalname}`);
//     }
//   })
// }).single('logo');  // Single file upload for logo

// // Banner upload configuration
// const uploadBanners = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'your-bucket-name',  // Replace with your S3 bucket name
//     acl: 'public-read',  // Set file permissions (e.g., public read access)
//     key: (req, file, cb) => {
//       // Set the file path in S3 (banners are stored in the 'banners' folder)
//       cb(null, `uploads/banner/${Date.now()}-${file.originalname}`);
//     }
//   })
// }).single('banner');  // Single file upload for banner

// // Product upload configuration (multiple images)
// const uploadProduct = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'your-bucket-name',  // Replace with your S3 bucket name
//     acl: 'public-read',  // Set file permissions (e.g., public read access)
//     key: (req, file, cb) => {
//       // Set the file path in S3 (product images are stored in the 'product' folder)
//       cb(null, `uploads/product/${Date.now()}-${file.originalname}`);
//     }
//   })
// }).array('productImages', 10);  // Multiple file uploads for product images (up to 10)

// module.exports = { uploadLogos, uploadBanners, uploadProduct };







//move the existing images in the upload folderr to s3 bucket
// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');

// // Initialize AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key ID
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Access Key
//   region: 'us-east-1' // Your AWS Region
// });

// // Local folder where images are stored
// const localFolderPath = path.join(__dirname, 'uploads/product');

// // Your S3 Bucket name
// const bucketName = 'your-bucket-name';

// // Function to upload files to S3
// const uploadFilesToS3 = async () => {
//   // Read all the files from the local folder
//   const files = fs.readdirSync(localFolderPath);

//   // Loop through each file in the folder
//   for (const file of files) {
//     const filePath = path.join(localFolderPath, file);
    
//     // Read the file contents
//     const fileContent = fs.readFileSync(filePath);

//     // Define the S3 upload parameters
//     const params = {
//       Bucket: bucketName,  // The S3 Bucket
//       Key: `uploads/product/${file}`,  // Path in the bucket
//       Body: fileContent,  // File content
//       ACL: 'public-read',  // File permissions (set to 'public-read' for public access)
//     };

//     try {
//       // Upload the file to S3
//       const data = await s3.upload(params).promise();
//       console.log(`File uploaded successfully. ${data.Location}`);
//     } catch (err) {
//       console.error(`Error uploading file ${file}:`, err);
//     }
//   }
// };

// // Start the upload process
// uploadFilesToS3();
