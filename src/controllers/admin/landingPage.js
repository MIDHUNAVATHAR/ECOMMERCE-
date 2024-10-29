


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
        res.render("backend/admin-dashboard" , {admin: req.session.adminEmail , partial :"partials/front-page-img-add" ,logo , banner} ); 
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





module.exports  =  {  landingPage  ,  uploadLogo  ,  uploadBanner , deleteImages } ;
  
