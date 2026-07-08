const ADMIN_ROUTES = {
    // ====== AUTHENTICATION ======
    ROOT: "/",
    LOGIN: "/loginPost",
    SIGNUP: "/adminSignup",
    VERIFY_OTP: "/adminCheckOtp",
    RESEND_EMAIL_OTP: "/resendEmailOtp",
    FORGOT_PASSWORD: "/forgotPassword",
    LOGOUT: "/adminLogout",
    RESET_PASSWORD: "/adminResetPassword/:token",

    // ====== DASHBOARD ======
    DASHBOARD: "/dashboard",
    GENERATE_LEDGER: "/dashboard/generate-ledger",

    // ====== LANDING PAGE ======
    LANDING_PAGE: "/landingPage",
    UPLOAD_LOGO: "/uploadLogo",
    UPDATE_LOGO_DATE: "/updatelogoDate",
    UPLOAD_BANNER: "/uploadBanner",
    UPDATE_BANNER_DATE: "/updateBannerDate",
    DELETE_IMAGE: "/deleteImage/:type/:id",

    // ====== CUSTOMERS ======
    CUSTOMERS: "/customers",
    DELETE_USER: "/delete-user",
    EDIT_USER: "/edit-user",
    UPDATE_USER: "/updateUser",
    UPDATE_USER_STATUS: "/update-status/:id",

    // ====== CATEGORY ======
    ADD_CATEGORY: "/addCategory",
    ADD_GENDER_CATEGORY: "/addGenderCategory",
    UPDATE_GENDER_CATEGORY: "/update-gender-category/:id",
    ADD_PRODUCT_CATEGORY: "/addProductCategory",
    UPDATE_PRODUCT_CATEGORY: "/update-product-category/:id",
    DELETE_GENDER_CATEGORY: "/deleteGenderCategory",
    SOFT_DELETE_GENDER_CATEGORY: "/softDeleteGenderCate",
    DELETE_PRODUCT_CATEGORY: "/deleteProductCategory",
    SOFT_DELETE_PRODUCT_CATEGORY: "/softDeleteProductCate",

    // ====== PRODUCTS ======
    ADD_PRODUCT: "/addProduct",
    ADD_PRODUCT_POST: "/addProductPost",
    LIST_PRODUCTS: "/listProduct",
    EDIT_PRODUCT: "/editProduct/:id",
    DELETE_PRODUCT_SIZE: "/products/:productid/sizes/:sizeid",
    DELETE_PRODUCT_IMAGE: "/delete-product-image",
    EDIT_PRODUCT_POST: "/editProductPost/:id",
    BLOCK_PRODUCT: "/blockProduct",
    DELETE_PRODUCT: "/deleteproduct",

    // ====== ORDERS ======
    ORDERS: "/orders",
    ORDER_DETAILS: "/orders/:orderId",
    UPDATE_ORDER_STATUS: "/updateOrderStatus",

    // ====== RETURN ORDERS ======
    RETURN_ORDERS: "/returnOrders",
    RETURN_ORDER_DETAILS: "/returnOrders/:id",
    UPDATE_RETURN_ORDER_STATUS: "/returnOrders/:id/update-status",

    // ====== SALES REPORT ======
    SALES_REPORT: "/sales-report",
    DOWNLOAD_PDF: "/download-pdf",
    DOWNLOAD_EXCEL: "/download-excel",

    // ====== OFFERS ======
    OFFERS: "/offers",
    PRODUCT_OFFERS: "/offers-product",
    SAVE_CATEGORY_OFFER: "/save-category-offer",
    SAVE_PRODUCT_OFFER: "/save-product-offer",

    // ====== COUPONS ======
    COUPONS: "/coupon",
    ADD_COUPON: "/coupon-add",
    UPDATE_COUPON: "/coupon-update",
    DELETE_COUPON: "/coupon-delete/:id",
};

const USER_ROUTES = {
    // ===== LANDING =====
    HOME: "/",
    PRODUCTS: "/products",
    PRODUCT_DETAILS: "/product/:id",

    // ===== PROFILE =====
    PROFILE: "/userProfile",
    ADDRESS_MANAGEMENT: "/userAdressMang",
    SAVE_ADDRESS: "/saveAddress",
    DELETE_ADDRESS: "/deleteAddress/:id",
    EDIT_ADDRESS: "/saveEditAddress/:id",
    CHANGE_PASSWORD: "/changePassword",

    // ===== AUTH =====
    LOGIN: "/userLogin",
    LOGIN_POST: "/userlogin",
    SIGNUP: "/userSignup",
    SIGNUP_POST: "/userSignupPost",
    RESEND_EMAIL_OTP: "/resendEmailOtp",
    VERIFY_OTP: "/userCheckOtp",
    FORGOT_PASSWORD: "/userForgotPassword",
    RESET_PASSWORD: "/userResetPassword/:token",
    LOGOUT: "/userLogout",
    BLOCKED: "/blocked",

    // ===== GOOGLE =====
    GOOGLE_LOGIN: "/auth/google/login",
    GOOGLE_CALLBACK: "/auth/google/callback",

    // ===== WISHLIST =====
    WISHLIST: "/wishlist",
    ADD_WISHLIST: "/wishlist/add",
    REMOVE_WISHLIST: "/removeWishlistItem/:id",

    // ===== CART =====
    CART: "/cart",
    ADD_TO_CART: "/addToCart",
    CART_INCREMENT: "/cartProductInc",
    CART_DECREMENT: "/cartProductDec",
    REMOVE_CART_ITEM: "/removeItem",

    // ===== CHECKOUT =====
    CHECKOUT: "/checkout",

    // ===== ORDER =====
    PLACE_ORDER: "/placeorder",
    MY_ORDERS: "/myOrders",
    ORDER_DETAILS: "/myOrders/:orderId",
    DOWNLOAD_ORDER_PDF: "/api/orders/download-pdf/:orderId",
    CANCEL_ORDER: "/cancelOrder",
    SUBMIT_REVIEW: "/submitReview",

    // ===== RAZORPAY =====
    CREATE_ORDER: "/create-order",
    VERIFY_PAYMENT: "/verify-payment",
    PAYMENT_FAILED: "/payment-failed",
    CONTINUE_PAYMENT: "/continue-failed-payment",
    CONTINUE_VERIFY_PAYMENT: "/continue-verify-payment",

    // ===== WALLET =====
    ADD_WALLET: "/add-wallet-cart",
    REMOVE_WALLET: "/remove-wallet-cart",
    WALLET_HISTORY: "/walletHistory",

    // ===== REFERRAL =====
    WITHDRAW_REFERRAL: "/withDrawRefferalBalance",

    // ===== COUPON =====
    COUPONS: "/getCoupons",
    APPLY_COUPON: "/add-coupon-code",
    REMOVE_COUPON: "/remove-coupon-code",

    // ===== RETURN ORDER =====
    RETURN_ORDER: "/returnOrder/:id",
    RETURN_ORDER_POST: "/returnOrder",
    RETURN_ORDERS: "/orderReturns",
};

module.exports = {
    ADMIN_ROUTES, USER_ROUTES
};