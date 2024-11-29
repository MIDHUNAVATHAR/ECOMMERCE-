


//import modules
const  fs            =  require("fs") ;
const  path          =  require("path") ; 


// imoort schemas
const  Logo          =  require("../../models/logoSchema") ;
const  Banner        =  require("../../models/bannerSchema") ;



//import multer functions
const { uploadLogos, uploadBanners } = require("../../configs/multer") ; 






//GET LANNDING PAGE
const  landingPage  =  async  ( req , res )  =>{
    try{
         
        const logo = await Logo.find() ; 
        const banner = await Banner.find() ;
        res.render("backend/admin-dashboard" , {admin : req.session.admin.email , partial :"partials/front-page-img-add" ,logo , banner} ); 
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ; 
    }
}





  
//POST UPLOAD LOGO 
const  uploadLogo  =  async  ( req , res )  => {  
    try{
        uploadLogos(req,res , (err) => { 
            if(err){
                console.log(err);
                return;
            }else{ 
                const logo = new Logo({ 
                    image : {
                        data :  `/uploads/logo/${req.file.filename}` , 
                        contentType: req.file.mimetype , 
                    } 
                })
                logo.save().then(()=> res.redirect("/admin/landingPage")  ).catch((err)=>console.log(err)) ;  
            }
        })
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;        
    }
}





 //updat logo date ,
 const updatelogoDate =async  ( req, res ) =>{
     
    try{
        const { logoId } = req.body;
        if (!logoId) {
            return res.status(400).json({ success: false, message: 'Logo ID is required' });
        }
        await Logo.findByIdAndUpdate(logoId, { updatedAt: Date.now() });

        res.json({ success: true, message: 'Logo date updated successfully' }); 
       
    }catch(error){
        console.error('Error updating logo date:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
 }





//POST UPLOAD BANNER
const  uploadBanner  =  async  ( req , res ) =>{
    try{
        uploadBanners(req , res , ( err ) => {   
            if(err){
                console.log(err);
                return;
            }else{
                const banner = new Banner({
                    image :{
                        data : `/uploads/banner/${req.file.filename}` , 
                        ContentType : req.file.mimetype,
                    }
                })
                banner.save().then( () =>  res.redirect("/admin/landingPage")).catch(( err )=> console.log( err ) ) ; 
            }
        })  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;         
    }
}



 //updat Banner date ,
 const updateBannerDate = async  ( req, res ) =>{
     
    try{
        const { bannerId } = req.body ; 
     
        if (!bannerId) {
            return res.status(400).json({ success : false, message: 'Banner ID is required' }) ; 
        }
        await Banner.findByIdAndUpdate(bannerId, { updatedAt: Date.now() });   

        res.json({ success: true, message: 'Banner date updated successfully' }) ; 
       
    }catch(error){
        console.error('Error updating banner date:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
 }



//DELETE LOGO AND BANNER IMAGES  
const   deleteImages  =   async  ( req , res )  => {
    const { type , id } = req.params ;
    try{
        let model , uploadPath;
        if(type === "logo"){
            model = Logo;
            uploadPath = __dirname,"uploads/logo" ;
        }else if(type === "banner"){
            model = Banner;
            uploadPath = __dirname,"uploads/Banner"; 
        }else{
            return res.status(400).send("Invalid image type"); 
        }

        const image = await model.findById(id); 
        if(!image){
            return res.status(404).send("Image not found") ; 
        }
        
        //Delete from upload folder 
        const filePath = path.join(__dirname ,`../../../${image.image.data}`) ;   
        fs.unlink(filePath , (err)=>{
            if(err) console.error("Error deleting file : ", err) ; 
        } )

        //Delete from database   
        await model.findByIdAndDelete(id) ; 
        res.status(200).send("Image deleted Succesfully") ;  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;  
    }
} 





module.exports  =  {  
    landingPage  ,  
    uploadLogo , 
    updatelogoDate ,   
    updateBannerDate ,  
    uploadBanner , 
    deleteImages 
}  ; 
  
