
const User = require("../models/userSchema");





const checkAuthentication = async (req, res ,next) =>{
    try {
    
        // Check if user session exists
        if ( req.session && req.session.user && req.session.user.id ) {

          const user = await User.findById(req.session.user.id);
          if( user.status == "block" ){
            return res.redirect("/blocked");
          }
      
          // User is authenticated, allow them to proceed
          return next();
        } else if(req.session.passport && req.session.passport.user){
        
            return next()
        }
        else {
          // User is not authenticated, redirect to login
          return res.render("frontend/user-login", { message: "Please log in to continue." });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).render("frontend/404") ; 
      }
   
} 

             





 module.exports = checkAuthentication ;   