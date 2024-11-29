
// Import necessary modules
const Bcrypt       =   require("bcrypt");                                                     // For hashing passwords and comparing them
const Crypto       =   require("crypto");                                                     // For generating secure random values (e.g., OTPs)

  



//import services
const { sendOTPEmail,  sendPasswordResetEmailAdmin } = require("../../services/emailService");// Email service for sending OTPs and password reset links



// Import schemas
const  Admin       =   require("../../models/adminSchema" ) ;                                 // Admin schema for database operations




//GET ADMIN LOGIN PAGE
const adminLogin   = async ( req , res )  =>{
    try{
       return res.redirect("/admin/dashboard") ;                                             // Redirect to dashboard if already logged in
    }
    catch( err ){
       console.log(err) ;
       res.status(500).render("frontend/404");                                               // Render 404 page on error
    }
}




//POST ADMIN LOGIN
const loginPost  =  async ( req, res )  =>{
    try{
        let {email , password , remember_me } = req.body;
        email  = email.trim();
        password = password.trim();
        
        const admin = await Admin.findOne({email }) ;                                        // Check if admin exists with given email
       
        if(admin){
            // Compare input password with the hashed password in the database
            const passwordCompare = await Bcrypt.compare( password , admin.password ) ; 

           if(!passwordCompare){ 
              res.render( "backend/admin-login.ejs" ,{message : "Incorrect Password" } );    // Password mismatch
              return
           }else{

              // Check if admin is verified
              if(admin.verified == false ){
                const otp = Crypto.randomBytes(3).toString('hex') ;                          // Generate OTP
                const otpExpiry = Date.now() + 30000 ;                                       // OTP valid for 30 seconds
                admin.otp = otp ;
                admin.otpExpiry = otpExpiry ; 
                admin.save();                                                                // Save OTP and expiry in the database
                sendOTPEmail(email , otp);                                                   // Send OTP via email
                res.render("backend/admin-otp-verify" , {email : email ,  message : `An OTP is sent to your registered email : ${email} . Plese enter Otp for verify.`});
                return ;
              }


              // Store admin details in the session
              req.session.admin = {
                id: admin._id,
                email: admin.email,
                role: "admin",
              };
        
             
              if(remember_me){
                 req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000 ;                       // Set session expiration to 7 days
              }else {
                req.session.cookie.expires = false;                                          // Session expires on browser close
              }
           
              
              req.session.save(() => {
                return res.redirect("/admin/dashboard");                                     // Redirect after successful login
              });
           }
           
        }else{
           res.render( "backend/admin-login.ejs" , { message : "Email can't exists. Please signup with Register"} ); // Admin not found
           return ;   
        }
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;                                            // Render 404 page on error
    }
}





//GET ADMIN  SIGNUP PAGE
const adminSignup  = async ( req , res )  =>{
    try{
        res.render( "backend/admin-signup.ejs" , { message : "" } ) ;                      // Render signup page
    }catch( err ){
        console.log(err) ;
        res.status(500).render("frontend/404") ;                                          // Render 404 page on error
    }
}





//POST ADMIN SIGNUP
const adminSignupPost  = async ( req , res )  => {
    try{
        let {firstName , lastName , email , password } = req.body ; 
   
        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.trim();
        password = password.trim();
        
        const adminCount = await Admin.countDocuments() ;                                 // Count the number of admins

    
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email : email }) ;  
     
        if (existingAdmin) {
            res.render("backend/admin-signup.ejs", { message: 'Admin already exist . Please Login.' });
            return;
        }else if( adminCount < 1){
           // Create first admin
            password = await Bcrypt.hash(password,10);                                   // Hash the password
            const otp = Crypto.randomBytes(3).toString('hex');                           // Generate OTP
            const otpExpiry = Date.now() + 30000;                                        // OTP valid for 30 sec 
     
         await Admin.create({
           firstName,
           lastName,
           email,
           password,
           otp,
           otpExpiry
        })
     
        sendOTPEmail(email , otp);                                                      // Send OTP via email
     
        res.render("backend/admin-otp-verify" , {email : email ,  message : `An OTP is sent to your registered email : ${email} . Plese enter Otp for verify.`});
        return;
        }else{
            res.redirect("/admin")  ;                                                   // Redirect if admin limit reached
        }
    }catch( err ){
        console.log(err) ;
        res.status(500).render( "frontend/404" ) ;                                     // Render 404 page on error
    }
}





//POST ADMIN OTP VERIFY
const adminVerifyOtp  =  async  ( req , res ) =>  { 
    try{
        let { email , otp } = req.body ;
        email = email.trim() ; 
        otp = otp.trim() ;
     
        const admin = await Admin.findOne({email}) ;
        if(admin){
         if(admin.otp == otp && admin.otpExpiry > Date.now()){
           admin.otp = null;
           admin.otpExpiry = null;
           admin.verified = true;                                                    // Mark admin as verified
           admin.save();
           res.redirect("/admin")  ; 
           return;
         }else{
           const otp = Crypto.randomBytes(3).toString('hex');                       // Generate new OTP
           const otpExpiry = Date.now() + 30000;                                    // OTP valid for 30 sec 
           admin.otp = otp;
           admin.otpExpiry = otpExpiry;
           admin.save(); 
           sendOTPEmail(email , otp);                                               // Send new OTP
           res.render( "backend/admin-otp-verify" , { email : email ,  message : `Invalid Otp : ${email} . A New otp will be send.`}) ; 
           return;
         }
        }else{
           res.render("backend/admin-signup.ejs", { message: 'Try Again.' }) ;  
           return;
        } 
    }catch(err){
        console.log(err) ;
        res.status(500).render( "frontend/404" ) ;                                // Render 404 page on error
    }
}




//POST RESEND OTP
const  resendEmailOtp  =  async  ( req , res ) =>{
    try{
        let {email } = req.body; 
        email=email.trim();


        const admin = await Admin.findOne({email});                            // Find admin by email
        if (!admin) {
          res.render("backend/admin-otp-verify", { 
              email: email, 
              message: `Email does not exist.` 
          });
          return;
      }
        

        // Generate a new OTP and expiry time
        const otp = Crypto.randomBytes(3).toString('hex');
        const otpExpiry = Date.now() + 30000;                                 // OTP valid for 30 sec 
     
        admin.otp = otp;
        admin.otpExpiry = otpExpiry;
        admin.save() ;                                                        // Save updated OTP details
     
        sendOTPEmail(email , otp);                                           // Send OTP email
        
        res.render("backend/admin-otp-verify" , {email : email ,  message : `A new OTP is sent to your registered email : ${email} . Plese enter new Otp for verify.`});  
              
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;                            // Render 404 page on error
    }
}





//GET FORGOT PASSWORD
const forgotPassword = (req ,res) =>{
    try{
        res.render("backend/admin-forgot-password", {message : 'Enter your email for Password Reset Link '} );
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;                          // Render 404 page on error
    }
  
}
 



//POST FORGOT PASSWORD 
const  forgotPasswordPost   =  async  ( req , res ) =>{
    try{
        let email = req.body.email ; 
        email = email.trim();  

         const admin = await Admin.findOne({ email });                   // Check if admin exists with the given email
         if (!admin) {
           return res.render('backend/admin-forgot-password', { message: 'Email does not exist.' });
         }
        

         // Generate a secure token for password reset
         const token =Crypto.randomBytes(20).toString('hex');
         admin.resetPasswordToken =  token;
         admin.resetPasswordExpires = Date.now() + 600000;              // Token valid for 10 minutes
         await admin.save();
     
         await sendPasswordResetEmailAdmin(admin.email , token , req.headers.host); // Send password reset email
     
         res.render('backend/admin-forgot-password', { message: 'An email has been sent to ' + admin.email + ' with further instructions.' });
    }catch(err){
         console.log(err) ;
         res.status(500).render("frontend/404" ) ;                     // Render 404 page on error
    }
}





//GET RESET PASSWORRD PAGE THROUGH EMAIL LINK
const  resetPassword   =  async  ( req , res ) =>{
    try{
        const admin = await Admin.findOne({
            resetPasswordToken : req.params.token ,                  // Verify the reset token
            resetPasswordExpires: { $gt: Date.now() }                // Check token expiry
        });

          if (!admin) {
            return res.render( 'backend/admin-reset-password', {
               message : 'Password reset token is invalid or has expired.' ,
                token : ""
            });
          }

          res.render('backend/admin-reset-password', { 
            token: req.params.token ,
             message : "create new password" 
          });

    }catch(err){
         console.log(err) ;
         res.status(500).render("frontend/404" ) ;                 // Render 404 page on error
    }
}





// POST RESET PASSWORD
const  resetPasswordPost  =  async  ( req , res ) =>{
   
    try{
        const admin = await Admin.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }             // Verify the token
        });


          if (!admin) {
            return res.render('backend/admin-reset-password', {
               message : 'Password reset token is invalid or has expired.' ,
                token : null 
            }) ;
          }
      
          if (req.body.password === req.body.confirm) { 
            admin.password = await Bcrypt.hash(req.body.password, 10);      // Hash the new password
            admin.resetPasswordToken = undefined;                           // Clear the token
            admin.resetPasswordExpires = undefined;                         // Clear the expiry time
            await admin.save();
             
            res.render("backend/admin-login.ejs",{
              message : "Password creat Success! Please Login"
            });
          } else {
            res.render('backend/admin-reset-password', { 
              message: 'Passwords do not match.',
              token :""
            });
          }

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;                          // Render 404 page on error
    }
}

    



//ADMIN LOGOUT
const adminLogout  = async ( req , res )  => {
    try{
      
    delete req.session.admin ;                                           // Clear admin session
    
    req.session.save((err) => {
    if (err) {
      console.error("Error logging out admin:", err);
      return res.status(500).send("Failed to log out.");
    }
    return res.redirect("/admin");                                      // Redirect to login page after logout
   })

 } catch( err ){
        console.log(err) ;
        res.status(500).render("frontend/404") ;                        // Render 404 page on error
    }
}




 






// Exporting admin-related controller functions for routing and authentication handling
module.exports  =  {

   // Function to render the admin login page
   adminLogin  ,

   // Function to handle the POST request for admin login authentication
   loginPost ,

   // Function to render the admin signup page
   adminSignup , 

   // Function to handle the admin signup process (checks if the admin exists and creates a new one if not)
   adminSignupPost ,

   // Function to verify the OTP entered by the admin during signup
   adminVerifyOtp , 

   // Function to handle admin logout by clearing the session
   adminLogout ,

   // Function to resend OTP if the previous one expired or was invalid
   resendEmailOtp  ,

   // Function to render the forgot password page
   forgotPassword , 

   // Function to handle the password reset process (sends reset link to admin's email)
   forgotPasswordPost ,

   // Function to render the password reset page with a valid token
   resetPassword ,

   // Function to handle the actual password reset process
   resetPasswordPost

  }  ; 
