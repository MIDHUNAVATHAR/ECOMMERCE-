


//import schemas
const  coupon  =    require("../../models/couponSchema")  ;








//GET  COUPON PAGE
const  getCoupon  = async  ( req , res ) => {
    try{
      
         const page = parseInt(req.query.page) || 1 ;
         const limit = 10 ;
         
         const totalCoupons = await coupon.countDocuments() ;
         const skip = ( page-1 ) * limit ; 
         
   
         //const products = await Product.find().skip(skip).limit(limit) ;
         const coupons = await coupon.find().skip(skip).limit(limit) ; 
         const totalPages = Math.ceil( totalCoupons/limit ) ; 
         
        
         res.render("backend/admin-dashboard" ,{ admin : req.session.admin.email ,partial : "partials/coupon" ,coupons,
             currentPage : page , totalPages  
        }) ;
     
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;           
    }
}


 




// ADD COUPON
const addCoupon = async (req, res) => {
    try {
      let { code, discountValue, expiryDate, usageLimit } = req.body;
      
      // Handle single coupon addition (modal form submission)
      const newCoupon = new coupon({
        code,
        couponBalance: discountValue,
        expiryDate,
        usageLimit
      });
      await newCoupon.save();
  
      // Respond with JSON if the request was from AJAX (modal)
      return res.json({ success: true, message: 'Coupon added successfully!' });
      
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error adding coupon' });
    }
  };


  const updateCoupon = async (req, res) => { 
    try {
      const { coupons } = req.body; // Receive the array of coupon objects
  
       
      if (Array.isArray(coupons)) {
          
        if(coupons.length == 0){
          return res.status(400).json({ success: false, message: "No coupons to update" });
        }

        // Loop through each coupon object and update the database
        
        for (const couponData of coupons) {
          await coupon.updateOne(
            { code: couponData.code }, 
            {
              $set: {
                couponBalance: couponData.discountValue, 
                expiryDate: new Date(couponData.expiryDate), // Ensure date is in Date format
                usageLimit: couponData.usageLimit
              }
            },
            { upsert: true }
          );  
        }
        res.status(200).json({success : true , message : "Coupon Updated Succesfull" })
        
      } else {
        res.status(400).json({ success: false, message: "Invalid data format" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error updating coupons" });
    }
  };
  
  



//DELETE COUPON
const  deleteCoupon  =  async ( req , res ) =>{
    try{
        const couponId = req.params.id ;
        await coupon.findByIdAndDelete( couponId ); 
        res.json({ success: true }); // Send a success response
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ; 
    }
}








module.exports  =  { getCoupon , addCoupon , updateCoupon ,  deleteCoupon }  ;