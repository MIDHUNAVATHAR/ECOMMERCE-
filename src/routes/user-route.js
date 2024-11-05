


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

router.post("/changePassword"  , checkAuthentication , profile.postChangePassword )
 






//AUTHENTICATION

router.get("/userLogin" , checkAuthentication , authentication.userLogin)  ;

router.post("/userlogin"  , authentication.userLoginPost) ; 

router.get("/userSignup" , checkAuthentication , authentication.userSignup ) ;

router.post("/userSignupPost", checkAuthentication , authentication.userSignupPost ) ;

router.post("/resendEmailOtp", authentication.resendEmailOtp );

router.post("/userCheckOtp", authentication.checkOtp );

router.get("/userForgotPassword",authentication.forgotPassword );

router.post("/userForgotPassword", authentication.forgotPasswordPost ); 

router.get("/userResetPassword/:token" , authentication.resetPassword );   

router.post("/userResetPassword/:token" , authentication.resetPasswordPost ); 

router.get("/userLogout" , authentication.userLogout ); 

router.get("/blocked"  , authentication.blocked); 


 



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

router.post("/wishlist/add", checkAuthentication  , wishlist.addToWishlist) ; 

router.delete("/removeWishlistItem/:id" ,checkAuthentication, wishlist.removeWishlistitem ); 
 




//CART 
router.get("/cart" , checkAuthentication , cartAvailability  ,  cart.getCart ) ;

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

router.post("/verify-payment" , razorPay.verifyPayment ) ;

router.post("/payment-failed" , razorPay.paymentFailed ) ;

router.post('/continue-failed-payment' , checkAuthentication , razorPay.continuePayment );

router.post("/continue-verify-payment" , razorPay.continueVerifyPayment );




//WALLET
router.post("/add-wallet-cart", checkAuthentication , wallet.walletAddCart) ; 

router.post("/remove-wallet-cart" , checkAuthentication , wallet.walletRemoveCart ) ;

router.get('/walletHistory' , checkAuthentication , checkAuthentication , wallet.getWalletHistory );



//REFERRAL
router.post("/withDrawRefferalBalance" , checkAuthentication , refferal.withDrawBalance  ) ;



//COUPON
router.get("/getCoupons" , checkAuthentication , coupon.coupons )

router.post("/add-coupon-code", checkAuthentication , coupon.couponAddCart ) ;

router.post("/remove-coupon-code", checkAuthentication , coupon.removeCoupon ) ; 




//RETURN ORDER
router.get("/returnOrder/:id" , checkAuthentication ,  orderReturn.returnOrder ) ;

router.post("/returnOrder", checkAuthentication , orderReturn.postReturnOrder ) ;

router.get("/orderReturns" , checkAuthentication , orderReturn.orderReturn  ) ;



module.exports  =  router ;    