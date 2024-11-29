

const  express               =  require("express") ;
const  router                =  express.Router()   ;




//import multer funtions 
const { uploadProduct }      =  require("../configs/multer") ; 



//import controllers
const  adminAuth             =  require("../controllers/admin/authentication") ; 
const  dashboard             =  require("../controllers/admin/dashboard")   ; 
const  landingPage           =  require("../controllers/admin/landingPage")   ;
const  customers             =  require("../controllers/admin/customers")  ; 
const  category              =  require("../controllers/admin/category")  ;
const  product               =  require("../controllers/admin/product") ;
const  order                 =  require("../controllers/admin/order") ;
const  salesReport           =  require("../controllers/admin/salesReport")  ;
const  offer                 =  require("../controllers/admin/offer") ;
const  coupon                =  require("../controllers/admin/coupon") ;
const  returnOrders          =  require("../controllers/admin/returnOrders") ;



//import middlewares
const  adminAuthentication   =  require("../middlewares/admin-authentication") ;


// ====== AUTHENTICATION ROUTES ======
// Render the login page
router.get( "/"   ,  adminAuthentication,   adminAuth.adminLogin ) ;  

// Handle admin login POST request
router.post( "/loginPost" , adminAuth.loginPost )   ;  
  
// Render signup page
router.get( "/adminSignup" , adminAuth.adminSignup )  ; 

// Handle admin signup POST request
router.post("/adminSignup"  , adminAuth.adminSignupPost ) ;

// Verify admin OTP during signup
router.post("/adminCheckOtp" , adminAuth.adminVerifyOtp) ; 

// Resend email OTP
router.post("/resendEmailOtp" ,adminAuth.resendEmailOtp)  ;

// Render forgot password page
router.get("/forgotPassword" ,adminAuth.forgotPassword ) ;   

// Handle forgot password POST request
router.post("/forgotPassword" , adminAuth.forgotPasswordPost); 

// Handle admin logout
router.get("/adminLogout"  , adminAuth.adminLogout ) ;  

// Render reset password page using token
router.get("/adminResetPassword/:token" , adminAuth.resetPassword); 

// Handle reset password POST request
router.post("/adminResetPassword/:token" , adminAuth.resetPasswordPost) ;  






// ====== DASHBOARD ROUTES ======
// Render the admin dashboard
router.get( "/dashboard"  ,adminAuthentication,  dashboard.dashboard )  ; 

// Generate and download ledger from the dashboard
router.post('/dashboard/generate-ledger'   ,adminAuthentication , dashboard.generateLedger) ;




// ====== LANDING PAGE ROUTES ======
// Render the landing page for admin settings                                       
router.get("/landingPage"    ,adminAuthentication , landingPage.landingPage ) ;

// Upload website logo
router.post("/uploadLogo"    ,adminAuthentication , landingPage.uploadLogo) ;

// Update logo expiration date
router.post("/updatelogoDate" , adminAuthentication , landingPage. updatelogoDate )

// Upload banner image
router.post("/uploadBanner"  ,adminAuthentication , landingPage.uploadBanner ) ;

// Update banner expiration date
router.post("/updateBannerDate" , adminAuthentication , landingPage.updateBannerDate)

// Delete image (logo or banner)
router.delete("/deleteImage/:type/:id"    , adminAuthentication , landingPage.deleteImages ) ;  




// ====== CUSTOMER ROUTES ======
// View all customers
router.get("/customers"   ,adminAuthentication , customers.users ) ;
 
// Delete a customer
router.get("/delete-user"   ,adminAuthentication, customers.userDel ) ;

// Edit customer details
router.get("/edit-user"  ,adminAuthentication , customers.userEdit) ;

// Update customer details
router.post("/updateUser"  ,adminAuthentication , customers.updateUsers) ;

// Update customer status (active/inactive)
router.post("/update-status/:id"  ,adminAuthentication , customers.updateStatus) ; 





// ====== CATEGORY ROUTES ======
// Render add category page
router.get("/addCategory"  ,adminAuthentication , category.category ) ;

// Add gender category
router.post("/addGenderCategory"   ,adminAuthentication, category.addGenderCategory) ; 

// Update existing gender category
router.put("/update-gender-category/:id" , adminAuthentication , category.editGenderCategory ) ;

// Add product category
router.post("/addProductCategory"   ,adminAuthentication, category.addProductCategory) ; 

// Update product category
router.put("/update-product-category/:id" , adminAuthentication , category.editProductCategory ) ;

// Soft delete gender category
router.post("/deleteGenderCategory"  ,adminAuthentication , category.softDeleteGenderCat) ; 
router.post("/softDeleteGenderCate"   ,adminAuthentication, category.softDeleteGenderCate) ;

// Soft delete product category
router.post("/deleteProductCategory"   ,adminAuthentication, category.deleteProductCategory) ;  
router.post("/softDeleteProductCate"   ,adminAuthentication, category.softDeleteProductCate) ;






// ====== PRODUCT ROUTES ======
// Render add product page
router.get("/addProduct"   ,adminAuthentication, product.addProduct ) ; 

// Handle adding a new product
router.post("/addProductPost"   ,adminAuthentication, product.addProductPost);  

// List all products
router.get("/listProduct"   ,adminAuthentication, product.listProducts );

// Render edit product page
router.get("/editProduct/:id"   ,adminAuthentication, product.editProduct) ; 

// Delete specific product size
router.delete('/products/:productid/sizes/:sizeid'   ,adminAuthentication, product.deleteSize ) ;

// Delete product image
router.delete("/delete-product-image"   ,adminAuthentication, product.deleteProductImage ) ;

// Handle editing a product
router.post("/editProductPost/:id"   ,adminAuthentication, uploadProduct , product.editProductPost);

// Block a product
router.post("/blockProduct"   ,adminAuthentication, product.blockProduct ) ; 

// Delete a product
router.delete("/deleteproduct"  ,adminAuthentication , product.deleteproduct ) ;





// ====== ORDER ROUTES ======
// View all orders
router.get( "/orders"   ,adminAuthentication, order.orders ) ; 

// View specific order details
router.get("/orders/:orderId"   ,adminAuthentication, order.viewOrder ) ; 

// Update order status
router.post("/updateOrderStatus"   ,adminAuthentication, order.updateOrderStatus ); 




// ====== RETURN ORDER ROUTES ======
// View all return orders
router.get( "/returnOrders"   ,adminAuthentication, returnOrders.returnOrders ) ;

// Get specific return order details
router.get("/returnOrders/:id"   ,adminAuthentication, returnOrders.getReturnOrderDetails )

// Update return order status
router.post( "/returnOrders/:id/update-status"   ,adminAuthentication, returnOrders.updateStatus )




// ====== SALES REPORT ROUTES ======
// View sales report
router.get( "/sales-report"   ,adminAuthentication, salesReport.salesReport );

// Download sales report as PDF
router.get( '/download-pdf'   ,adminAuthentication, salesReport.generatePDF) ;

// Download sales report as Excel
router.get("/download-excel"   ,adminAuthentication, salesReport.generateExcel) ;




// ====== OFFER ROUTES ======
// View all offers
router.get("/offers"   ,adminAuthentication, offer.offers ) ;

// View product offers
router.get("/offers-product"   ,adminAuthentication, offer.productOffers) ;

// Save category-specific offer
router.post("/save-category-offer"  ,adminAuthentication, offer.saveCategoryOffer );

// Save product-specific offer
router.post("/save-product-offer"   ,adminAuthentication, offer.saveProductOffer );




// ====== COUPON ROUTES ======
// View all coupons
router.get("/coupon"   ,adminAuthentication, coupon.getCoupon)  ; 

// Add a new coupon
router.post("/coupon-add"   ,adminAuthentication, coupon.addCoupon ) ;

// Update an existing coupon
router.put("/coupon-update" , adminAuthentication , coupon.updateCoupon ) ; 

// Delete a coupon
router.delete("/coupon-delete/:id"  ,adminAuthentication , coupon.deleteCoupon ) ; 








module.exports  =  router ;  