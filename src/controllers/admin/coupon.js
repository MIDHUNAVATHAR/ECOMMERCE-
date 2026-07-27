


// Importing the coupon schema for interacting with the coupons collection
const coupon = require("../../models/couponSchema");


const { ADMIN_ROUTES } = require("../../constants/routes")
const { VIEWS } = require("../../constants/view")
const { HTTP_STATUS } = require("../../constants/statusCodes")




// GET request to fetch and render the coupon page
const getCoupon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;               // Get the current page from query or default to 1
    const limit = 10;                                         // Set the number of coupons to display per page

    const totalCoupons = await coupon.countDocuments();       // Get the total number of coupons
    const skip = (page - 1) * limit;                          // Calculate the number of documents to skip for pagination


    // Fetch the coupons for the current page
    const coupons = await coupon.find().skip(skip).limit(limit);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCoupons / limit);

    // Render the coupon page with pagination data
    res.render("backend/admin-dashboard", {
      admin: req.session.admin.email,
      partial: "partials/coupon",
      coupons,
      currentPage: page,
      totalPages
    });

  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");    // Handle error and render the 404 page     
  }
}





// POST request to add a new coupon
const addCoupon = async (req, res) => {
  try {
    let { code, discountPercentage, minPurchaseAmount, maxDiscountAmount, expiryDate, usageLimit } = req.body;

    // Create a new coupon object
    const newCoupon = new coupon({
      code,
      discountPercentage,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit
    });

    // Save the new coupon to the database
    await newCoupon.save();

    
    return res.json({ success: true, message: 'Coupon added successfully!' });
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error adding coupon' });     // Handle errors during coupon creation
  }
};






// POST request to update existing coupons
const updateCoupon = async (req, res) => {
  try {
    const { coupons } = req.body; // Receive the array of coupon objects from the request

    // Check if coupons is an array
    if (Array.isArray(coupons)) {

      // Return error if no coupons are provided
      if (coupons.length == 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "No coupons to update" });
      }


      // Loop through each coupon object and update the database
      for (const couponData of coupons) {
        await coupon.updateOne(
          { code: couponData.code },                                 // Find coupon by its code
          {
            $set: {
              discountPercentage: couponData.discountPercentage,
              minPurchaseAmount: couponData.minPurchaseAmount,
              maxDiscountAmount: couponData.maxDiscountAmount,
              expiryDate: new Date(couponData.expiryDate),           // Ensure expiry date is in Date format
              usageLimit: couponData.usageLimit                      // Update usage limit
            }
          },
          { upsert: true }                                           // Create the coupon if it doesn't exist
        );
      }
      res.status(HTTP_STATUS.OK).json({ success: true, message: "Coupon Updated Succesfull" })

    } else {
      // If data format is incorrect, send an error response
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Invalid data format" });
    }
  } catch (err) {
    console.error(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error updating coupons" }); // Handle errors during coupon update
  }
};





// DELETE request to remove a coupon from the database
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;                            // Get the coupon ID from the URL params
    await coupon.findByIdAndDelete(couponId);                  // Delete the coupon by its ID
    res.json({ success: true });                               // Send a success response
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");  // Handle error and render the 404 page
  }
}








// Exporting the functions to be used in the routes
module.exports = {
  getCoupon,
  addCoupon,
  updateCoupon,
  deleteCoupon
};