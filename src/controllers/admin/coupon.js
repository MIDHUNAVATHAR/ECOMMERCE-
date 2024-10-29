


//import schemas
const  coupon  =    require("../../models/couponSchema")  ;








//GET  COUPON PAGE
const  getCoupon  = async  ( req , res ) => {
    try{
        if(!req.session.adminEmail){
            return res.redirect('/admin')
         }
         const page = parseInt(req.query.page) || 1 ;
         const limit = 10 ;
         
         const totalCoupons = await coupon.countDocuments() ;
         const skip = ( page-1 ) * limit ; 
         
   
         //const products = await Product.find().skip(skip).limit(limit) ;
         const coupons = await coupon.find().skip(skip).limit(limit) ; 
         const totalPages = Math.ceil( totalCoupons/limit ) ; 
         
        
         res.render("backend/admin-dashboard" ,{ admin : req.session.adminEmail , partial : "partials/coupon" ,coupons,
             currentPage : page , totalPages  
        }) ;
     
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;           
    }
}




//ADD COUPON
// const  addCoupon  =  async  ( req , res ) => {
//     try{
//         const { code, discountValue, expiryDate, usageLimit } = req.body ;
//         if(!code){
//           return res.redirect("/admin/coupon")
//         }
       
//         const submittedCoupons = code.map((code, index) => ({
//           code,
//           couponBalance : discountValue[index], 
//           expiryDate: expiryDate[index],
//           usageLimit: usageLimit[index]
//       }));
     
//       // Update or add each submitted coupon
//       for (const submittedCoupon of submittedCoupons) {
//           await coupon.updateOne(
//               { code: submittedCoupon.code },
//               {
//                   $set: {
//                       couponBalance: submittedCoupon.couponBalance ,
//                       expiryDate: submittedCoupon.expiryDate ,
//                       usageLimit: submittedCoupon.usageLimit
//                   }
//               },
//               { upsert : true }  // Creates a new coupon if it doesn't exist 
//           );
//       }
//        return res.redirect("/admin/coupon?add=1");
//     }catch(err){
//         console.log(err);
//         res.status(500).render("frontend/404") ;         
//     }
// }





// ADD COUPON
const addCoupon = async (req, res) => {
    try {
      const { code, discountValue, expiryDate, usageLimit } = req.body;
      // If it's an array of coupons, handle as a bulk operation (table form submission)
      if (Array.isArray(code)) {
        const submittedCoupons = code.map((code, index) => ({
          code,
          couponBalance: discountValue[index],
          expiryDate: expiryDate[index],
          usageLimit: usageLimit[index]
        }));
        
        for (const submittedCoupon of submittedCoupons) {
          await coupon.updateOne(
            { code: submittedCoupon.code },
            {
              $set: {
                couponBalance: submittedCoupon.couponBalance,
                expiryDate: submittedCoupon.expiryDate,
                usageLimit: submittedCoupon.usageLimit
              }
            },
            { upsert: true }
          );
        }
        return res.redirect("/admin/coupon?add=1");
      } 
      
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








module.exports  =  { getCoupon , addCoupon ,  deleteCoupon }  ;