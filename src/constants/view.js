const VIEWS = {
    FRONTEND: {
        NOT_FOUND: "frontend/404",
    },

    ADMIN: {
        LOGIN: "backend/admin-login",
        DASHBOARD: "backend/admin-dashboard",
        FORGOT_PASSWORD: "backend/admin-forgot-password",
        OTP_VERIFY: "backend/admin-otp-verify",
        RESET_PASSWORD: "backend/admin-reset-password",
        SIGNUP: "backend/admin-signup",
    },

    USER: {
        HOME: "user/home",
        PROFILE: "user/profile",
        // ...
    },
};

module.exports = {
    VIEWS,
};