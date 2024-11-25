

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





//AUTHENTICATION
router.get( "/"   ,  adminAuthentication,   adminAuth.adminLogin ) ;  

router.post( "/loginPost" , adminAuth.loginPost )   ;  
  
router.get( "/adminSignup" , adminAuth.adminSignup )  ; 

router.post("/adminSignup"  , adminAuth.adminSignupPost ) ;

router.post("/adminCheckOtp" , adminAuth.adminVerifyOtp) ; 

router.post("/resendEmailOtp" ,adminAuth.resendEmailOtp)  ;

router.get("/forgotPassword" ,adminAuth.forgotPassword ) ;   

router.post("/forgotPassword" , adminAuth.forgotPasswordPost); 

router.get("/adminLogout"  , adminAuth.adminLogout ) ;  

router.get("/adminResetPassword/:token" , adminAuth.resetPassword); 

router.post("/adminResetPassword/:token" , adminAuth.resetPasswordPost) ;  






//DASHBOARD
router.get( "/dashboard"  ,adminAuthentication,  dashboard.dashboard )  ; 

router.post('/dashboard/generate-ledger'   ,adminAuthentication , dashboard.generateLedger) ;




//LANDING PAGE                                        
router.get("/landingPage"    ,adminAuthentication , landingPage.landingPage ) ;

router.post("/uploadLogo"    ,adminAuthentication , landingPage.uploadLogo) ;

router.post("/updatelogoDate" , adminAuthentication , landingPage. updatelogoDate )

router.post("/uploadBanner"  ,adminAuthentication , landingPage.uploadBanner ) ;

router.post("/updateBannerDate" , adminAuthentication , landingPage.updateBannerDate)

router.delete("/deleteImage/:type/:id"    , adminAuthentication , landingPage.deleteImages ) ;  




//CUSTOMERS 
router.get("/customers"   ,adminAuthentication , customers.users ) ;
 
router.get("/delete-user"   ,adminAuthentication, customers.userDel ) ;

router.get("/edit-user"  ,adminAuthentication , customers.userEdit) ;

router.post("/updateUser"  ,adminAuthentication , customers.updateUsers) ;

router.post("/update-status/:id"  ,adminAuthentication , customers.updateStatus) ; 




//CATEGORY
router.get("/addCategory"  ,adminAuthentication , category.category ) ;

router.post("/addGenderCategory"   ,adminAuthentication, category.addGenderCategory) ; 

router.put("/update-gender-category/:id" , adminAuthentication , category.editGenderCategory ) ;

router.post("/addProductCategory"   ,adminAuthentication, category.addProductCategory) ; 

router.put("/update-product-category/:id" , adminAuthentication , category.editProductCategory ) ;



router.post("/deleteGenderCategory"  ,adminAuthentication , category.softDeleteGenderCat) ; 

router.post("/softDeleteGenderCate"   ,adminAuthentication, category.softDeleteGenderCate) ;

router.post("/deleteProductCategory"   ,adminAuthentication, category.deleteProductCategory) ;  

router.post("/softDeleteProductCate"   ,adminAuthentication, category.softDeleteProductCate) ;






//PRODUCT
router.get("/addProduct"   ,adminAuthentication, product.addProduct ) ; 

router.post("/addProductPost"   ,adminAuthentication, product.addProductPost);  

router.get("/listProduct"   ,adminAuthentication, product.listProducts );

router.get("/editProduct/:id"   ,adminAuthentication, product.editProduct) ; 

router.delete('/products/:productid/sizes/:sizeid'   ,adminAuthentication, product.deleteSize ) ;

router.delete("/delete-product-image"   ,adminAuthentication, product.deleteProductImage ) ;

router.post("/editProductPost/:id"   ,adminAuthentication, uploadProduct , product.editProductPost);

router.post("/blockProduct"   ,adminAuthentication, product.blockProduct ) ; 

router.delete("/deleteproduct"  ,adminAuthentication , product.deleteproduct ) ;





//ORDER
router.get( "/orders"   ,adminAuthentication, order.orders ) ; 

router.get("/orders/:orderId"   ,adminAuthentication, order.viewOrder ) ; 

router.post("/updateOrderStatus"   ,adminAuthentication, order.updateOrderStatus ); 




//RETURN ORDERS 
router.get( "/returnOrders"   ,adminAuthentication, returnOrders.returnOrders ) ;

router.get("/returnOrders/:id"   ,adminAuthentication, returnOrders.getReturnOrderDetails )

router.post( "/returnOrders/:id/update-status"   ,adminAuthentication, returnOrders.updateStatus )




//SALES REPORT
router.get( "/sales-report"   ,adminAuthentication, salesReport.salesReport );

router.get( '/download-pdf'   ,adminAuthentication, salesReport.generatePDF) ;

router.get("/download-excel"   ,adminAuthentication, salesReport.generateExcel) ;




//OFFER
router.get("/offers"   ,adminAuthentication, offer.offers ) ;

router.get("/offers-product"   ,adminAuthentication, offer.productOffers) ;

router.post("/save-category-offer"  ,adminAuthentication, offer.saveCategoryOffer );

router.post("/save-product-offer"   ,adminAuthentication, offer.saveProductOffer );




//COUPON
router.get("/coupon"   ,adminAuthentication, coupon.getCoupon)  ; 

router.post("/coupon-add"   ,adminAuthentication, coupon.addCoupon ) ;

router.put("/coupon-update" , adminAuthentication , coupon.updateCoupon ) ; 

router.delete("/coupon-delete/:id"  ,adminAuthentication , coupon.deleteCoupon ) ; 








module.exports  =  router ;  