


//import modules
const  express               =  require("express") ;
//const app = express();
const  router                =  express.Router() ; 
const  passport              =  require("passport") ;



//import controllers
const  landing               =  require("../controllers/user/landing") ;
const  product               =  require("../controllers/user/product") ;
const  profile               =  require("../controllers/user/profile") ;
const  authentication        =  require("../controllers/user/authentication") ; 
const  wishlist              =  require("../controllers/user/wishlist") ;
const  cart                  =  require("../controllers/user/cart") ;
const  checkout              =  require("../controllers/user/checkout") ;
const  order                 =  require("../controllers/user/order") ; 
const  razorPay              =  require("../controllers/user/razorPay") ;
const  wallet                =  require("../controllers/user/wallet") ;
const  coupon                =  require("../controllers/user/coupon") ; 
const  orderReturn           =  require("../controllers/user/returnOrder") ;
const  refferal              =  require("../controllers/user/referral") ; 




//import  middlewares
const  checkAuthentication   =  require("../middlewares/check-authentication") ;
const  cartAvailability      =  require("../middlewares/check-cartavailability")  ;
const  wishlistAvailability  =  require("../middlewares/check-wishlistAvailability"); 
const  implementOffers       =  require("../middlewares/implement-offers") ; 
const  updateCartPrices      =  require("../middlewares/updateCartPrices")




 

// ====== LANDING ROUTES ======
// Render the landing page
router.get( "/" , landing.landingPage ) ;  

// Display list of all products
router.get("/products" , product.products) ;
 
// Display a specific product with offers applied
router.get("/product/:id", implementOffers  , product.product) ;





// ====== PROFILE ROUTES ======
// Display user profile page
router.get("/userProfile" , checkAuthentication , profile.showProfile ) ;

// Update user profile details
router.post("/userProfile"  , checkAuthentication , profile.editProfilePost);

// Manage user addresses
router.get("/userAdressMang" ,  checkAuthentication  ,  profile.userAdressMng );

//add addresses
router.post("/saveAddress"  , checkAuthentication , profile.saveAddress );

// Delete an existing address
router.get("/deleteAddress/:id"  , checkAuthentication , profile.deleteAddress); 

// Edit and save an existing address
router.post("/saveEditAddress/:id"  , checkAuthentication , profile.editAddress);

//GET CHANGE PASSWORD PAGE
router.get("/changePassword" , checkAuthentication , profile.changePassword ) ;

// Handle password change request
router.post("/changePassword"  , checkAuthentication , profile.postChangePassword ) ; 
 






// ====== AUTHENTICATION ROUTES ======
// Render login page
router.get("/userLogin" , checkAuthentication , authentication.userLogin)  ;

// Handle login POST request
router.post("/userlogin"  , authentication.userLoginPost) ; 

// Render signup page
router.get("/userSignup" ,  authentication.userSignup ) ;

// Handle user signup POST request
router.post("/userSignupPost" ,  authentication.userSignupPost ) ;

// Resend OTP during signup
router.post("/resendEmailOtp", authentication.resendEmailOtp );

// Verify OTP during signup
router.post("/userCheckOtp", authentication.checkOtp );

// Render forgot password page
router.get("/userForgotPassword",authentication.forgotPassword );

// Handle forgot password POST request
router.post("/userForgotPassword", authentication.forgotPasswordPost ); 

// Render reset password page using token
router.get("/userResetPassword/:token" , authentication.resetPassword );   

// Handle reset password POST request
router.post("/userResetPassword/:token" , authentication.resetPasswordPost ); 

// Handle user logout
router.get("/userLogout" , authentication.userLogout ); 

// Render blocked user page
router.get("/blocked"  , authentication.blocked); 






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
router.get('/auth/google/login', cacheAdminStatus , (req, res, next) => {
    
    const referralCode = req.query.referral || ''; // Capture referral code from query params if present
    console.log(referralCode);

    // Pass referral code in the state parameter
    passport.authenticate('google-user', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ referralCode }) // Send referral code as part of OAuth state
    })(req, res, next);
});




// Google authentication callback route
router.get('/auth/google/callback' , passport.authenticate( 'google-user', {
    failureRedirect: '/userLogin'
}),  restoreAdminStatus , (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/'); 
});  
 





// ====== WISHLIST ROUTES ======
// Display user's wishlist
router.get( "/wishlist" , checkAuthentication, wishlistAvailability , wishlist.wishlist) ;    

// Add an item to the wishlist
router.post("/wishlist/add" , checkAuthentication , wishlist.addToWishlist) ;    // fetch 

// Remove an item from the wishlist
router.delete("/removeWishlistItem/:id" ,checkAuthentication, wishlist.removeWishlistitem ) ; 
 




// ====== CART ROUTES ======
// Display the cart
router.get("/cart" , checkAuthentication , updateCartPrices , cartAvailability  ,  cart.getCart ) ;

// Add an item to the cart
router.post( "/addToCart", checkAuthentication , cart.addToCart); 

// Increase product quantity in the cart
router.post("/cartProductInc", checkAuthentication , cart.increQuantity); 

// Decrease product quantity in the cart
router.post("/cartProductDec", checkAuthentication , cart.decreQuantity);

// Remove an item from the cart
router.post("/removeItem", checkAuthentication , cart.removeItem ); 




// ====== CHECKOUT ROUTES ======
// Render checkout page
router.get( "/checkout" , checkAuthentication , cartAvailability , checkout.getCheckout ) ; 




// ====== ORDER ROUTES ======
// Place an order
router.post( '/placeorder' , checkAuthentication , cartAvailability , order.placeorder ) ;  

// View user's orders
router.get(  "/myOrders" , checkAuthentication , order.myOrders); 

// View details of a specific order
router.get(  "/myOrders/:orderId" , checkAuthentication , order.viewOrder );  

// Download order invoice as PDF
router.get('/api/orders/download-pdf/:orderId', checkAuthentication , order.generateOrderPDF );

// Cancel an order
router.post( "/cancelOrder" , checkAuthentication , order.cancelOrder ) ;

// Submit a review for an order
router.post( "/submitReview", checkAuthentication , order.submitReview ) ; 





// ====== RAZORPAY ROUTES ======
// Create a Razorpay order
router.post("/create-order", checkAuthentication ,razorPay.createOrder );

// Verify Razorpay payment
router.post("/verify-payment" , checkAuthentication , razorPay.verifyPayment ) ;

// Handle payment failure
router.post("/payment-failed" ,checkAuthentication, razorPay.paymentFailed ) ;

// Continue with a failed payment
router.post('/continue-failed-payment' , checkAuthentication , razorPay.continuePayment ) ; 

// Verify continued payment
router.post("/continue-verify-payment" , checkAuthentication, razorPay.continueVerifyPayment );






// ====== WALLET ROUTES ======
// Add wallet balance to cart
router.post("/add-wallet-cart" , wallet.walletAddCart) ;    //fetch

// Remove wallet balance from cart
router.post("/remove-wallet-cart"  , wallet.walletRemoveCart ) ; // fetch

// View wallet transaction history
router.get('/walletHistory' , checkAuthentication  , wallet.getWalletHistory );






// ====== REFERRAL ROUTES ======
// Withdraw referral balance
router.post("/withDrawRefferalBalance" , checkAuthentication , refferal.withDrawBalance ) ; 





// ====== COUPON ROUTES ======
// Get all available coupons
router.get("/getCoupons" , checkAuthentication , coupon.coupons ) ;

// Apply a coupon code
router.post("/add-coupon-code", coupon.couponAddCart ) ;

// Remove an applied coupon code
router.post("/remove-coupon-code" , coupon.removeCoupon ) ;




// ====== RETURN ORDER ROUTES ======
// Render return order details
router.get("/returnOrder/:id" , checkAuthentication ,  orderReturn.returnOrder ) ;

// Submit a return order request
router.post("/returnOrder", checkAuthentication , orderReturn.postReturnOrder ) ;

// View all return orders
router.get("/orderReturns" , checkAuthentication , orderReturn.orderReturn ) ; 





module.exports  =  router ;     