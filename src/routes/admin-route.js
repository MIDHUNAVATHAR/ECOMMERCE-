

const  express          =  require("express") ;
const  router           =  express.Router()   ;




//import multer funtions 
const { uploadProduct } =   require("../configs/multer") ; 



//import controllers
const  adminAuth        =  require("../controllers/admin/authentication") ; 
const  dashboard        =  require("../controllers/admin/dashboard")   ; 
const  landingPage      =  require("../controllers/admin/landingPage")   ;
const  customers        =  require("../controllers/admin/customers")  ; 
const  category         =  require("../controllers/admin/category")  ;
const  product          =  require("../controllers/admin/product") ;
const  order            =  require("../controllers/admin/order") ;
const  salesReport      =  require("../controllers/admin/salesReport")  ;
const  offer            =  require("../controllers/admin/offer") ;
const  coupon           =  require("../controllers/admin/coupon") ;
const  returnOrders     =  require("../controllers/admin/returnOrders") ;

 




//AUTHENTICATION
router.get( "/"   ,   adminAuth.adminLogin ) ;  

router.post( "/loginPost"  , adminAuth.loginPost )   ;  
  
router.get( "/adminSignup" , adminAuth.adminSignup )  ; 

router.post("/adminSignup" , adminAuth.adminSignupPost ) ;

router.post("/adminCheckOtp" , adminAuth.adminVerifyOtp) ; 

router.post("/resendEmailOtp" ,adminAuth.resendEmailOtp)  ;

router.get("/forgotPassword" ,adminAuth.forgotPassword ) ;   

router.post("/forgotPassword" , adminAuth.forgotPasswordPost); 

router.get("/adminLogout"  , adminAuth.adminLogout ) ;  

router.get("/adminResetPassword/:token" , adminAuth.resetPassword); 

router.post("/adminResetPassword/:token" , adminAuth.resetPasswordPost) ;  





//DASHBOARD
router.get( "/dashboard"   ,  dashboard.dashboard )  ; 

router.post('/dashboard/generate-ledger', dashboard.generateLedger) ;




//LANDING PAGE                                        
router.get("/landingPage"   , landingPage.landingPage ) ;

router.post("/uploadLogo"   , landingPage.uploadLogo) ;

router.post("/uploadBanner" , landingPage.uploadBanner ) ;

router.delete("/deleteImage/:type/:id" ,landingPage.deleteImages ) ;  




//CUSTOMERS 
router.get("/customers" , customers.users) ;
 
router.get("/delete-user" , customers.userDel) ;

router.get("/edit-user" , customers.userEdit) ;

router.post("/updateUser" , customers.updateUsers) ;

router.post("/update-status/:id" , customers.updateStatus) ; 




//CATEGORY
router.get("/addCategory" , category.category ) ;

router.post("/addGenderCategory", category.addGenderCategory) ;

router.post("/addProductCategory" , category.addProductCategory) ; 

router.post("/addProductSubCategory" , category.addProductSubCategory) ; 

router.post("/deleteGenderCategory" , category.softDeleteGenderCat) ; 

router.post("/softDeleteGenderCate" , category.softDeleteGenderCate) ;

router.post("/deleteProductCategory" , category.deleteProductCategory) ;  

router.post("/softDeleteProductCate" , category.softDeleteProductCate) ;

router.post("/deleteProductSubCategory" , category.deleteProductSubCategory ) ;

router.post("/softDeleteProductSubCate" , category.softDeleteProductSubCate) ;





//PRODUCT
router.get("/addProduct" , product.addProduct ) ; 

router.post("/addProductPost" , product.addProductPost);  

router.get("/listProduct" , product.listProducts );

router.get("/editProduct/:id" , product.editProduct) ; 

router.delete('/products/:productid/sizes/:sizeid' , product.deleteSize ) ;

router.delete("/delete-product-image" , product.deleteProductImage ) ;

router.post("/editProductPost/:id" , uploadProduct , product.editProductPost);

router.post("/blockProduct" , product.blockProduct ) ; 

router.delete("/deleteproduct" , product.deleteproduct ) ;





//ORDER
router.get( "/orders" , order.orders ) ; 

router.get("/orders/:orderId" , order.viewOrder ) ; 

router.post("/updateOrderStatus" , order.updateOrderStatus ); 




//RETURN ORDERS 
router.get( "/returnOrders" , returnOrders.returnOrders ) ;

router.get("/returnOrders/:id" , returnOrders.getReturnOrderDetails )

router.post( "/returnOrders/:id/update-status" , returnOrders.updateStatus )




//SALES REPORT
router.get( "/sales-report" , salesReport.salesReport );

router.get( '/download-pdf' , salesReport.generatePDF) ;

router.get("/download-excel" , salesReport.generateExcel) ;




//OFFER
router.get("/offers" , offer.offers ) ;

router.get("/offers-product" , offer.productOffers) ;

router.post("/save-category-offer", offer.saveCategoryOffer );

router.post("/save-product-offer" , offer.saveProductOffer );




//COUPON
router.get("/coupon" , coupon.getCoupon)  ; 

router.post("/coupon-add" , coupon.addCoupon ) ;

router.delete("/coupon-delete/:id" , coupon.deleteCoupon ) ; 








module.exports  =  router ;  