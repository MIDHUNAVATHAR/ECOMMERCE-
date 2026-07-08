


//import modules
const express = require("express");
//const app = express();
const router = express.Router();
const passport = require("passport");



//import controllers
const landing = require("../controllers/user/landing");
const product = require("../controllers/user/product");
const profile = require("../controllers/user/profile");
const authentication = require("../controllers/user/authentication");
const wishlist = require("../controllers/user/wishlist");
const cart = require("../controllers/user/cart");
const checkout = require("../controllers/user/checkout");
const order = require("../controllers/user/order");
const razorPay = require("../controllers/user/razorPay");
const wallet = require("../controllers/user/wallet");
const coupon = require("../controllers/user/coupon");
const orderReturn = require("../controllers/user/returnOrder");
const refferal = require("../controllers/user/referral");

const { USER_ROUTES } = require("../constants/routes.js");



//import  middlewares
const checkAuthentication = require("../middlewares/check-authentication");
const cartAvailability = require("../middlewares/check-cartavailability");
const wishlistAvailability = require("../middlewares/check-wishlistAvailability");
const implementOffers = require("../middlewares/implement-offers");
const updateCartPrices = require("../middlewares/updateCartPrices")






// ====== LANDING ROUTES ======
// Render the landing page
router.get(USER_ROUTES.HOME, landing.landingPage);

// Display list of all products
router.get(USER_ROUTES.PRODUCTS, product.products);

// Display a specific product with offers applied
router.get(USER_ROUTES.PRODUCT_DETAILS, implementOffers, product.product);





// ====== PROFILE ROUTES ======
// Display user profile page
router.get(USER_ROUTES.PROFILE, checkAuthentication, profile.showProfile);

// Update user profile details
router.post(USER_ROUTES.PROFILE, checkAuthentication, profile.editProfilePost);

// Manage user addresses
router.get(USER_ROUTES.ADDRESS_MANAGEMENT, checkAuthentication, profile.userAdressMng);

//add addresses
router.post(USER_ROUTES.SAVE_ADDRESS, checkAuthentication, profile.saveAddress);

// Delete an existing address
router.get(USER_ROUTES.DELETE_ADDRESS, checkAuthentication, profile.deleteAddress);

// Edit and save an existing address
router.post(USER_ROUTES.EDIT_ADDRESS, checkAuthentication, profile.editAddress);

//GET CHANGE PASSWORD PAGE
router.get(USER_ROUTES.CHANGE_PASSWORD, checkAuthentication, profile.changePassword);

// Handle password change request
router.post(USER_ROUTES.CHANGE_PASSWORD, checkAuthentication, profile.postChangePassword);







// ====== AUTHENTICATION ROUTES ======
// Render login page
router.get(USER_ROUTES.LOGIN, checkAuthentication, authentication.userLogin);

// Handle login POST request
router.post(USER_ROUTES.LOGIN_POST, authentication.userLoginPost);

// Render signup page
router.get(USER_ROUTES.SIGNUP, authentication.userSignup);

// Handle user signup POST request
router.post(USER_ROUTES.SIGNUP_POST, authentication.userSignupPost);

// Resend OTP during signup
router.post(USER_ROUTES.RESEND_EMAIL_OTP, authentication.resendEmailOtp);

// Verify OTP during signup
router.post(USER_ROUTES.VERIFY_OTP, authentication.checkOtp);

// Render forgot password page
router.get(USER_ROUTES.FORGOT_PASSWORD, authentication.forgotPassword);

// Handle forgot password POST request
router.post(USER_ROUTES.FORGOT_PASSWORD, authentication.forgotPasswordPost);

// Render reset password page using token
router.get(USER_ROUTES.RESET_PASSWORD, authentication.resetPassword);

// Handle reset password POST request
router.post(USER_ROUTES.RESET_PASSWORD, authentication.resetPasswordPost);

// Handle user logout
router.get(USER_ROUTES.LOGOUT, authentication.userLogout);

// Render blocked user page
router.get(USER_ROUTES.BLOCKED, authentication.blocked);






// ====== GOOGLE AUTHENTICATION WITH REFERRAL ======
// Middleware to cache admin status before Google login
function cacheAdminStatus(req, res, next) {
    req.app.locals.adminStatus = req.session.admin; // Cache adminStatus in app.locals
    next();
}



// Middleware to restore `adminStatus` after Passport changes the session
function restoreAdminStatus(req, res, next) {
    //console.log("Restoring adminStatus:", req.app.locals.adminStatus);
    if (req.app.locals.adminStatus !== undefined) {
        req.session.admin = req.app.locals.adminStatus; // Restore adminStatus to session
        delete req.app.locals.adminStatus; // Clear the cache in app.locals after restoration
        //   console.log("adminStatus restored to session:", req.session.admin);
    } else {
        // console.log("No adminStatus found in app.locals to restore.");
    }
    next();
}



// Google login route (with referral code)
router.get(USER_ROUTES.GOOGLE_LOGIN, cacheAdminStatus, (req, res, next) => {

    const referralCode = req.query.referral || ''; // Capture referral code from query params if present
    console.log(referralCode);

    // Pass referral code in the state parameter
    passport.authenticate('google-user', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ referralCode }) // Send referral code as part of OAuth state
    })(req, res, next);
});




// Google authentication callback route
router.get(USER_ROUTES.GOOGLE_CALLBACK, passport.authenticate('google-user', {
    failureRedirect: USER_ROUTES.LOGIN
}), restoreAdminStatus, (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(USER_ROUTES.HOME);
});






// ====== WISHLIST ROUTES ======
// Display user's wishlist
router.get(USER_ROUTES.WISHLIST, checkAuthentication, wishlistAvailability, wishlist.wishlist);

// Add an item to the wishlist
router.post(USER_ROUTES.ADD_WISHLIST, checkAuthentication, wishlist.addToWishlist);    // fetch 

// Remove an item from the wishlist
router.delete(USER_ROUTES.REMOVE_WISHLIST, checkAuthentication, wishlist.removeWishlistitem);





// ====== CART ROUTES ======
// Display the cart
router.get(USER_ROUTES.CART, checkAuthentication, updateCartPrices, cartAvailability, cart.getCart);

// Add an item to the cart
router.post(USER_ROUTES.ADD_TO_CART, checkAuthentication, cart.addToCart);

// Increase product quantity in the cart
router.post(USER_ROUTES.CART_INCREMENT, checkAuthentication, cart.increQuantity);

// Decrease product quantity in the cart
router.post(USER_ROUTES.CART_DECREMENT, checkAuthentication, cart.decreQuantity);

// Remove an item from the cart
router.post(USER_ROUTES.REMOVE_CART_ITEM, checkAuthentication, cart.removeItem);




// ====== CHECKOUT ROUTES ======
// Render checkout page
router.get(USER_ROUTES.CHECKOUT, checkAuthentication, cartAvailability, checkout.getCheckout);




// ====== ORDER ROUTES ======
// Place an order
router.post(USER_ROUTES.PLACE_ORDER, checkAuthentication, cartAvailability, order.placeorder);

// View user's orders
router.get(USER_ROUTES.MY_ORDERS, checkAuthentication, order.myOrders);

// View details of a specific order
router.get(USER_ROUTES.ORDER_DETAILS, checkAuthentication, order.viewOrder);

// Download order invoice as PDF
router.get(USER_ROUTES.DOWNLOAD_ORDER_PDF, checkAuthentication, order.generateOrderPDF);

// Cancel an order
router.post(USER_ROUTES.CANCEL_ORDER, checkAuthentication, order.cancelOrder);

// Submit a review for an order
router.post(USER_ROUTES.SUBMIT_REVIEW, checkAuthentication, order.submitReview);





// ====== RAZORPAY ROUTES ======
// Create a Razorpay order
router.post(USER_ROUTES.CREATE_ORDER, checkAuthentication, razorPay.createOrder);

// Verify Razorpay payment
router.post(USER_ROUTES.VERIFY_PAYMENT, checkAuthentication, razorPay.verifyPayment);

// Handle payment failure
router.post(USER_ROUTES.PAYMENT_FAILED, checkAuthentication, razorPay.paymentFailed);

// Continue with a failed payment
router.post(USER_ROUTES.CONTINUE_PAYMENT, checkAuthentication, razorPay.continuePayment);

// Verify continued payment
router.post(USER_ROUTES.CONTINUE_VERIFY_PAYMENT, checkAuthentication, razorPay.continueVerifyPayment);






// ====== WALLET ROUTES ======
// Add wallet balance to cart
router.post(USER_ROUTES.ADD_WALLET, wallet.walletAddCart);    //fetch

// Remove wallet balance from cart
router.post(USER_ROUTES.REMOVE_WALLET, wallet.walletRemoveCart); // fetch

// View wallet transaction history
router.get(USER_ROUTES.WALLET_HISTORY, checkAuthentication, wallet.getWalletHistory);






// ====== REFERRAL ROUTES ======
// Withdraw referral balance
router.post(USER_ROUTES.WITHDRAW_REFERRAL, checkAuthentication, refferal.withDrawBalance);





// ====== COUPON ROUTES ======
// Get all available coupons
router.get(USER_ROUTES.COUPONS, checkAuthentication, coupon.coupons);

// Apply a coupon code
router.post(USER_ROUTES.APPLY_COUPON, coupon.couponAddCart);

// Remove an applied coupon code
router.post(USER_ROUTES.REMOVE_COUPON, coupon.removeCoupon);




// ====== RETURN ORDER ROUTES ======
// Render return order details
router.get(USER_ROUTES.RETURN_ORDER, checkAuthentication, orderReturn.returnOrder);

// Submit a return order request
router.post(USER_ROUTES.RETURN_ORDER_POST, checkAuthentication, orderReturn.postReturnOrder);

// View all return orders
router.get(USER_ROUTES.RETURN_ORDERS, checkAuthentication, orderReturn.orderReturn);





module.exports = router;     