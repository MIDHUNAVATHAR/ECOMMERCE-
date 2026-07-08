const MESSAGES = {
    SUCCESS: {
        LOGIN: "Login successful.",
        LOGOUT: "Logout successful.",
        PASSWORD_CHANGED: "Password changed successfully.",
        PASSWORD_RESET: "Password reset successful.",
        OTP_SENT: "OTP sent successfully.",
        ACCOUNT_CREATED: "Account created successfully.",
    },

    ERROR: {
        SOMETHING_WENT_WRONG: "Something went wrong.",
        INVALID_EMAIL: "Invalid email.",
        INVALID_PASSWORD: "Incorrect password.",
        PASSWORDS_NOT_MATCH: "Passwords do not match.",
        ACCOUNT_NOT_FOUND: "Account not found.",
        ACCOUNT_ALREADY_EXISTS: "Account already exists.",
        OTP_INVALID: "Invalid OTP.",
        OTP_EXPIRED: "OTP has expired.",
        TOKEN_INVALID: "Password reset token is invalid or has expired.",
        UNAUTHORIZED: "Unauthorized access.",
        FORBIDDEN: "Access denied.",
        NOT_FOUND: "Resource not found.",
    },

    ADMIN: {
        LOGIN_REQUIRED: "Please login.",
        ADMIN_ALREADY_EXISTS: "Admin already exists. Please login.",
        ADMIN_LIMIT_REACHED: "Admin already registered.",
        EMAIL_NOT_FOUND: "Email does not exist.",
        PASSWORD_CREATED: "Password created successfully. Please login.",
        TRY_AGAIN: "Try Again.",
    },

    USER: {
        EMAIL_ALREADY_EXISTS: "Email already exists.",
        ACCOUNT_BLOCKED: "Your account has been blocked.",
        LOGIN_REQUIRED: "Please login first.",
    },

    OTP: {
        VERIFY:
            "An OTP has been sent to your registered email. Please verify it.",

        RESENT:
            "A new OTP has been sent to your registered email.",

        INVALID_NEW_SENT:
            "Invalid OTP. A new OTP has been sent.",
    },

    PASSWORD_RESET: {
        EMAIL_SENT:
            "A password reset email has been sent.",

        CREATE_NEW_PASSWORD:
            "Create a new password.",
    },
    CATEGORY: {
        CREATED: "Category created successfully.",
        UPDATED: "Category updated successfully.",
        DELETED: "Category deleted successfully.",

        CREATE_FAILED: "Failed to create category.",
        UPDATE_FAILED: "Failed to update category.",
        DELETE_FAILED: "Failed to delete category.",

        ALREADY_EXISTS: "Category already exists.",
        NOT_FOUND: "Category not found.",
    },
};

module.exports = {
    MESSAGES,
};