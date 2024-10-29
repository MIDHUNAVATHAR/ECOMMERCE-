


//import modules
const  express               =  require("express") ;
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
const  cartAvailability      =  require("../middlewares/check-cartavailability") ;
const  implementOffers       =  require("../middlewares/implement-offers") ; 





//LANDING

router.get( "/" , landing.landingPage ) ;

router.get('/categories/:id', landing.categorySection );  

router.get("/products" , product.products) ;
 
router.get("/product/:id", implementOffers  , product.product) ;





//PROFILE

router.get("/userProfile" , checkAuthentication , profile.showProfile ) ;

router.post("/userProfile" , profile.editProfilePost);

//get user adress management
router.get("/userAdressMang" ,  checkAuthentication  ,  profile.userAdressMng );

//add addresses
router.post("/saveAddress" , profile.saveAddress );

//delete addresses
router.get("/deleteAddress/:id" , profile.deleteAddress); 

//post edit address
router.post("/saveEditAddress/:id" , profile.editAddress);

//change password
router.get("/changePassword" , checkAuthentication , profile.changePassword ) ;

router.post("/changePassword" , profile.postChangePassword )
 






//AUTHENTICATION

router.get("/userLogin" , checkAuthentication , authentication.userLogin)  ;

router.post("/userlogin" , authentication.userLoginPost) ; 

router.get("/userSignup" , authentication.userSignup ) ;

router.post("/userSignupPost" , authentication.userSignupPost ) ;

router.post("/resendEmailOtp" , authentication.resendEmailOtp );

router.post("/userCheckOtp" , authentication.checkOtp );

router.get("/userForgotPassword" ,authentication.forgotPassword );

router.post("/userForgotPassword" , authentication.forgotPasswordPost ); 

router.get("/userResetPassword/:token" , authentication.resetPassword );   

router.post("/userResetPassword/:token" , authentication.resetPasswordPost );

router.get("/userLogout" , authentication.userLogout ); 

router.get("/blocked" , authentication.blocked); 






// Google login route (with referral code)
router.get('/auth/google/login', (req, res, next) => {
    const referralCode = req.query.referral || ''; // Capture referral code from query params if present

    // Pass referral code in the state parameter
    passport.authenticate('google-user', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ referralCode }) // Send referral code as part of OAuth state
    })(req, res, next);
});


router.get('/auth/google/callback', passport.authenticate( 'google-user', {
    failureRedirect: '/userLogin'
}), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/'); 
});  
 




 

//WISHLIST  
router.get( "/wishlist" , checkAuthentication, wishlist.wishlist) ; 

router.post("/wishlist/add"  , wishlist.addToWishlist) ; 

router.delete("/removeWishlistItem/:id" ,checkAuthentication, wishlist.removeWishlistitem ); 
 




//CART 
router.get("/cart" , checkAuthentication , cartAvailability  ,  cart.getCart ) ;

router.post( "/addToCart", checkAuthentication , cart.addToCart); 

router.post("/cartProductInc" , cart.increQuantity); 

router.post("/cartProductDec" , cart.decreQuantity);

router.post("/removeItem" , cart.removeItem );  




//CHECKOUT
router.get( "/checkout" , checkAuthentication , cartAvailability , checkout.getCheckout ) ; 




//ORDER
router.post( '/placeorder' , checkAuthentication , cartAvailability , order.placeorder ) ;  
router.get(  "/myOrders" , checkAuthentication , order.myOrders); 
router.get(  "/myOrders/:orderId" , checkAuthentication , order.viewOrder );  
router.get('/api/orders/download-pdf/:orderId', order.generateOrderPDF );
router.post( "/cancelOrder" , order.cancelOrder ) ;




//REVIEW 
router.post( "/submitReview" , order.submitReview ) ; 



//RAZORPAY
router.post("/create-order" ,razorPay.createOrder );

router.post("/verify-payment" , razorPay.verifyPayment ) ;

router.post("/payment-failed" , razorPay.paymentFailed ) ;

router.post('/continue-failed-payment', razorPay.continuePayment );

router.post("/continue-verify-payment" , razorPay.continueVerifyPayment );




//WALLET
router.post("/add-wallet-cart" , wallet.walletAddCart) ; 

router.post("/remove-wallet-cart" , wallet.walletRemoveCart ) ;

router.get('/walletHistory' , checkAuthentication , wallet.getWalletHistory );



//REFERRAL
router.post("/withDrawRefferalBalance" , refferal.withDrawBalance  ) ;



//COUPON
router.get("/getCoupons" , checkAuthentication , coupon.coupons )

router.post("/add-coupon-code" , coupon.couponAddCart ) ;

router.post("/remove-coupon-code" , coupon.removeCoupon ) ; 




//RETURN ORDER
router.get("/returnOrder/:id" , checkAuthentication ,  orderReturn.returnOrder ) ;

router.post("/returnOrder" , orderReturn.postReturnOrder ) ;

router.get("/orderReturns" , checkAuthentication , orderReturn.orderReturn  ) ;



module.exports  =  router ;    