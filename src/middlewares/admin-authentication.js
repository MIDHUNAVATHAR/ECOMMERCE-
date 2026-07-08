

const { HTTP_STATUS } = require("../constants/statusCodes")


const adminAuthentication = async (req, res, next) => {

  try {

    // Check if user session exists
    if (req.session && req.session.admin) {
      // User is authenticated, allow them to proceed
      return next();
    } else {
      // User is not authenticated, redirect to login
      return res.render("backend/admin-login", { message: "Please log in to continue." });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
  }

}



module.exports = adminAuthentication;   