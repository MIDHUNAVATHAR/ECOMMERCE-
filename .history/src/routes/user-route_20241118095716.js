


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




 

//LANDING

router.get( "/" , landing.landingPage ) ;  

router.get("/products" , product.products) ;
 
router.get("/product/:id", implementOffers  , product.product) ;





//PROFILE

router.get("/userProfile" , checkAuthentication , profile.showProfile ) ;

router.post("/userProfile"  , checkAuthentication , profile.editProfilePost);

//get user adress management
router.get("/userAdressMang" ,  checkAuthentication  ,  profile.userAdressMng );

//add addresses
router.post("/saveAddress"  , checkAuthentication , profile.saveAddress );

//delete addresses
router.get("/deleteAddress/:id"  , checkAuthentication , profile.deleteAddress); 

//post edit address
router.post("/saveEditAddress/:id"  , checkAuthentication , profile.editAddress);

//change password
router.get("/changePassword" , checkAuthentication , profile.changePassword ) ;

router.post("/changePassword"  , checkAuthentication , profile.postChangePassword ) ; 
 






//AUTHENTICATION

router.get("/userLogin" , checkAuthentication , authentication.userLogin)  ;

router.post("/userlogin"  , authentication.userLoginPost) ; 

router.get("/userSignup" ,  authentication.userSignup ) ;

router.post("/userSignupPost" ,  authentication.userSignupPost ) ;

router.post("/resendEmailOtp", authentication.resendEmailOtp );

router.post("/userCheckOtp", authentication.checkOtp );

router.get("/userForgotPassword",authentication.forgotPassword );

router.post("/userForgotPassword", authentication.forgotPasswordPost ); 

router.get("/userResetPassword/:token" , authentication.resetPassword );   

router.post("/userResetPassword/:token" , authentication.resetPasswordPost ); 

router.get("/userLogout" , authentication.userLogout ); 

router.get("/blocked"  , authentication.blocked); 






// Middleware to cache `adminStatus` before Google authentication
function cacheAdminStatus(req, res, next) {
   // console.log("Caching adminStatus:", req.session.admin); 
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

    // Pass referral code in the state parameter
    passport.authenticate('google-user', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ referralCode }) // Send referral code as part of OAuth state
    })(req, res, next);
});




router.get('/auth/google/callback' , passport.authenticate( 'google-user', {
    failureRedirect: '/userLogin'
}),  restoreAdminStatus , (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/'); 
});  
 





//WISHLIST  
router.get( "/wishlist" , checkAuthentication, wishlistAvailability , wishlist.wishlist) ; 

router.post("/wishlist/add" , wishlist.addToWishlist) ;    // fetch 

router.delete("/removeWishlistItem/:id" ,checkAuthentication, wishlist.removeWishlistitem ) ; 
 




//CART 
router.get("/cart" , checkAuthentication , updateCartPrices , cartAvailability  ,  cart.getCart ) ;

router.post( "/addToCart", checkAuthentication , cart.addToCart); 

router.post("/cartProductInc", checkAuthentication , cart.increQuantity); 

router.post("/cartProductDec", checkAuthentication , cart.decreQuantity);

router.post("/removeItem", checkAuthentication , cart.removeItem ); 




//CHECKOUT
router.get( "/checkout" , checkAuthentication , cartAvailability , checkout.getCheckout ) ; 




//ORDER
router.post( '/placeorder' , checkAuthentication , cartAvailability , order.placeorder ) ;  
router.get(  "/myOrders" , checkAuthentication , order.myOrders); 
router.get(  "/myOrders/:orderId" , checkAuthentication , order.viewOrder );  
router.get('/api/orders/download-pdf/:orderId', checkAuthentication , order.generateOrderPDF );
router.post( "/cancelOrder" , checkAuthentication , order.cancelOrder ) ;




//REVIEW 
router.post( "/submitReview", checkAuthentication , order.submitReview ) ; 



//RAZORPAY
router.post("/create-order", checkAuthentication ,razorPay.createOrder );

router.post("/verify-payment" , checkAuthentication , razorPay.verifyPayment ) ;

router.post("/payment-failed" ,checkAuthentication, razorPay.paymentFailed ) ;

router.post('/continue-failed-payment' , checkAuthentication , razorPay.continuePayment ) ; 

router.post("/continue-verify-payment" , checkAuthentication, razorPay.continueVerifyPayment );




//WALLET
router.post("/add-wallet-cart" , wallet.walletAddCart) ;    //fetch

router.post("/remove-wallet-cart"  , wallet.walletRemoveCart ) ; // fetch

router.get('/walletHistory' , checkAuthentication  , wallet.getWalletHistory );



//REFERRAL
router.post("/withDrawRefferalBalance" , checkAuthentication , refferal.withDrawBalance ) ; 



//COUPON
router.get("/getCoupons" , checkAuthentication , coupon.coupons ) ;

router.post("/add-coupon-code", coupon.couponAddCart ) ;

router.post("/remove-coupon-code" , coupon.removeCoupon ) ;




//RETURN ORDER
router.get("/returnOrder/:id" , checkAuthentication ,  orderReturn.returnOrder ) ;

router.post("/returnOrder", checkAuthentication , orderReturn.postReturnOrder ) ;

router.get("/orderReturns" , checkAuthentication , orderReturn.orderReturn ) ; 





module.exports  =  router ;     