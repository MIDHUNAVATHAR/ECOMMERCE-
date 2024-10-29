


//import schemas
const  GenderCategory  =   require("../../models/genderCategory") ;
const  Product         =   require("../../models/product") ;







//GET OFFERS
const  offers  =  async  ( req , res ) =>{
    try{
        const genderCategories = await GenderCategory.find();
        const products = await Product.find(); 
        res.render("backend/admin-dashboard" , { admin : req.session.adminEmail , partial : "partials/offers" , genderCategories , products }) ;
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;        
    }
}





//GET PRODUCT OFFERS
const  productOffers  =  async  ( req , res ) =>{
    try{
        const genderCategories = await GenderCategory.find();

        const page = parseInt(req.query.page) || 1 ;
        const limit = 7 ;
        
        const totalOrders = await Product.countDocuments() ;
        const skip = ( page-1 ) * limit ; 
        
  
        const products = await Product.find().skip(skip).limit(limit) ;
        const totalPages = Math.ceil( totalOrders/limit ) ; 

       
        res.render("backend/admin-dashboard" , { admin : req.session.adminEmail , partial : "partials/offers-product" , genderCategories , products ,
             currentPage : page , totalPages 
    }) ;
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;   
    }
}




//POST SAVE CATEGORY OFFER
const   saveCategoryOffer   =   async  ( req , res ) =>{
    try{
        const categoryId = req.body.id ;
        const offer = req.body.offer ;
        const expiryDate = req.body.expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000); 

        await GenderCategory.findByIdAndUpdate( categoryId , { offer : offer , offerExpiry : expiryDate  }); 
        res.status(200).json({ 
            message: 'Category offer updated successfully' ,  
        });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;        
    }
}




//POST SAVE PRODUCT OFFER
const  saveProductOffer   =  async  ( req , res ) =>{
    try{
        const productId = req.body.id;
        const offer = req.body.offer ;
        const expiryDate = req.body.expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000) ;

        await Product.findByIdAndUpdate(productId , { offer : offer , offerExpiry : expiryDate  });        res.status(200).json({ 
            message: 'Category offer updated successfully' ,  
        });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;        
    }
}










module.exports  =  { offers , saveCategoryOffer , saveProductOffer , productOffers  }