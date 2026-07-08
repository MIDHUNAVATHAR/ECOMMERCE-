

const express = require("express");
const router = express.Router();
const { ADMIN_ROUTES } = require("../constants/routes");



//import multer funtions 
const { uploadProduct } = require("../configs/multer");



//import controllers
const adminAuth = require("../controllers/admin/authentication");
const dashboard = require("../controllers/admin/dashboard");
const landingPage = require("../controllers/admin/landingPage");
const customers = require("../controllers/admin/customers");
const category = require("../controllers/admin/category");
const product = require("../controllers/admin/product");
const order = require("../controllers/admin/order");
const salesReport = require("../controllers/admin/salesReport");
const offer = require("../controllers/admin/offer");
const coupon = require("../controllers/admin/coupon");
const returnOrders = require("../controllers/admin/returnOrders");



//import middlewares
const adminAuthentication = require("../middlewares/admin-authentication");


// ====== AUTHENTICATION ROUTES ======
// Render the dashboard page
router.get(ADMIN_ROUTES.ROOT, adminAuthentication, adminAuth.adminLogin);

// Handle admin login POST request
router.post(ADMIN_ROUTES.LOGIN, adminAuth.loginPost);

// Render signup page
router.get(ADMIN_ROUTES.SIGNUP, adminAuth.adminSignup);

// Handle admin signup POST request
router.post(ADMIN_ROUTES.SIGNUP, adminAuth.adminSignupPost);

// Verify admin OTP during signup
router.post(ADMIN_ROUTES.VERIFY_OTP, adminAuth.adminVerifyOtp);

// Resend email OTP
router.post(ADMIN_ROUTES.RESEND_EMAIL_OTP, adminAuth.resendEmailOtp);

// Render forgot password page
router.get(ADMIN_ROUTES.FORGOT_PASSWORD, adminAuth.forgotPassword);

// Handle forgot password POST request
router.post(ADMIN_ROUTES.FORGOT_PASSWORD, adminAuth.forgotPasswordPost);

// Handle admin logout
router.get(ADMIN_ROUTES.LOGOUT, adminAuth.adminLogout);

// Render reset password page using token
router.get(ADMIN_ROUTES.RESET_PASSWORD, adminAuth.resetPassword);

// Handle reset password POST request
router.post(ADMIN_ROUTES.RESET_PASSWORD, adminAuth.resetPasswordPost);






// ====== DASHBOARD ROUTES ======
// Render the admin dashboard
router.get(ADMIN_ROUTES.DASHBOARD, adminAuthentication, dashboard.dashboard);

// Generate and download ledger from the dashboard
router.post(ADMIN_ROUTES.GENERATE_LEDGER, adminAuthentication, dashboard.generateLedger);




// ====== LANDING PAGE ROUTES ======
// Render the landing page for admin settings                                       
router.get(ADMIN_ROUTES.LANDING_PAGE, adminAuthentication, landingPage.landingPage);

// Upload website logo
router.post(ADMIN_ROUTES.UPLOAD_LOGO, adminAuthentication, landingPage.uploadLogo);

// Update logo expiration date
router.post(ADMIN_ROUTES.UPDATE_LOGO_DATE, adminAuthentication, landingPage.updatelogoDate)

// Upload banner image
router.post(ADMIN_ROUTES.UPLOAD_BANNER, adminAuthentication, landingPage.uploadBanner);

// Update banner expiration date
router.post(ADMIN_ROUTES.UPDATE_BANNER_DATE, adminAuthentication, landingPage.updateBannerDate)

// Delete image (logo or banner)
router.delete(ADMIN_ROUTES.DELETE_IMAGE, adminAuthentication, landingPage.deleteImages);




// ====== CUSTOMER ROUTES ======
// View all customers
router.get(ADMIN_ROUTES.CUSTOMERS, adminAuthentication, customers.users);

// Delete a customer
router.get(ADMIN_ROUTES.DELETE_USER, adminAuthentication, customers.userDel);

// Edit customer details
router.get(ADMIN_ROUTES.EDIT_USER, adminAuthentication, customers.userEdit);

// Update customer details
router.post(ADMIN_ROUTES.UPDATE_USER, adminAuthentication, customers.updateUsers);

// Update customer status (active/inactive)
router.post(ADMIN_ROUTES.UPDATE_USER_STATUS, adminAuthentication, customers.updateStatus);





// ====== CATEGORY ROUTES ======
// Render add category page
router.get(ADMIN_ROUTES.ADD_CATEGORY, adminAuthentication, category.category);

// Add gender category
router.post(ADMIN_ROUTES.ADD_GENDER_CATEGORY, adminAuthentication, category.addGenderCategory);

// Update existing gender category
router.put(ADMIN_ROUTES.UPDATE_GENDER_CATEGORY, adminAuthentication, category.editGenderCategory);

// Add product category
router.post(ADMIN_ROUTES.ADD_PRODUCT_CATEGORY, adminAuthentication, category.addProductCategory);

// Update product category
router.put(ADMIN_ROUTES.UPDATE_PRODUCT_CATEGORY, adminAuthentication, category.editProductCategory);

// Soft delete gender category
router.post(ADMIN_ROUTES.DELETE_GENDER_CATEGORY, adminAuthentication, category.softDeleteGenderCat);
router.post(ADMIN_ROUTES.SOFT_DELETE_GENDER_CATEGORY, adminAuthentication, category.softDeleteGenderCate);

// Soft delete product category
router.post(ADMIN_ROUTES.DELETE_PRODUCT_CATEGORY, adminAuthentication, category.deleteProductCategory);
router.post(ADMIN_ROUTES.SOFT_DELETE_PRODUCT_CATEGORY, adminAuthentication, category.softDeleteProductCate);






// ====== PRODUCT ROUTES ======
// Render add product page
router.get(ADMIN_ROUTES.ADD_PRODUCT, adminAuthentication, product.addProduct);

// Handle adding a new product
router.post(ADMIN_ROUTES.ADD_PRODUCT_POST, adminAuthentication, product.addProductPost);

// List all products
router.get(ADMIN_ROUTES.LIST_PRODUCTS, adminAuthentication, product.listProducts);

// Render edit product page
router.get(ADMIN_ROUTES.EDIT_PRODUCT, adminAuthentication, product.editProduct);

// Delete specific product size
router.delete(ADMIN_ROUTES.DELETE_PRODUCT_SIZE, adminAuthentication, product.deleteSize);

// Delete product image
router.delete(ADMIN_ROUTES.DELETE_PRODUCT_IMAGE, adminAuthentication, product.deleteProductImage);

// Handle editing a product
router.post(ADMIN_ROUTES.EDIT_PRODUCT_POST, adminAuthentication, uploadProduct, product.editProductPost);

// Block a product
router.post(ADMIN_ROUTES.BLOCK_PRODUCT, adminAuthentication, product.blockProduct);

// Delete a product
router.delete(ADMIN_ROUTES.DELETE_PRODUCT, adminAuthentication, product.deleteproduct);





// ====== ORDER ROUTES ======
// View all orders
router.get(ADMIN_ROUTES.ORDERS, adminAuthentication, order.orders);

// View specific order details
router.get(ADMIN_ROUTES.ORDER_DETAILS, adminAuthentication, order.viewOrder);

// Update order status
router.post(ADMIN_ROUTES.UPDATE_ORDER_STATUS, adminAuthentication, order.updateOrderStatus);




// ====== RETURN ORDER ROUTES ======
// View all return orders
router.get(ADMIN_ROUTES.RETURN_ORDERS, adminAuthentication, returnOrders.returnOrders);

// Get specific return order details
router.get(ADMIN_ROUTES.RETURN_ORDER_DETAILS, adminAuthentication, returnOrders.getReturnOrderDetails)

// Update return order status
router.post(ADMIN_ROUTES.UPDATE_RETURN_ORDER_STATUS, adminAuthentication, returnOrders.updateStatus)




// ====== SALES REPORT ROUTES ======
// View sales report
router.get(ADMIN_ROUTES.SALES_REPORT, adminAuthentication, salesReport.salesReport);

// Download sales report as PDF
router.get(ADMIN_ROUTES.DOWNLOAD_PDF, adminAuthentication, salesReport.generatePDF);

// Download sales report as Excel
router.get(ADMIN_ROUTES.DOWNLOAD_EXCEL, adminAuthentication, salesReport.generateExcel);




// ====== OFFER ROUTES ======
// View all offers
router.get(ADMIN_ROUTES.OFFERS, adminAuthentication, offer.offers);

// View product offers
router.get(ADMIN_ROUTES.PRODUCT_OFFERS, adminAuthentication, offer.productOffers);

// Save category-specific offer
router.post(ADMIN_ROUTES.SAVE_CATEGORY_OFFER, adminAuthentication, offer.saveCategoryOffer);

// Save product-specific offer
router.post(ADMIN_ROUTES.SAVE_PRODUCT_OFFER, adminAuthentication, offer.saveProductOffer);




// ====== COUPON ROUTES ======
// View all coupons
router.get(ADMIN_ROUTES.COUPONS, adminAuthentication, coupon.getCoupon);

// Add a new coupon
router.post(ADMIN_ROUTES.ADD_COUPON, adminAuthentication, coupon.addCoupon);

// Update an existing coupon
router.put(ADMIN_ROUTES.UPDATE_COUPON, adminAuthentication, coupon.updateCoupon);

// Delete a coupon
router.delete(ADMIN_ROUTES.DELETE_COUPON, adminAuthentication, coupon.deleteCoupon);








module.exports = router;  