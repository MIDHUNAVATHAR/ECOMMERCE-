



//import modules
const Bcrypt       =   require("bcrypt");
const Crypto       =   require("crypto");




//import services
const { sendOTPEmail, sendPasswordResetEmail } = require("../../services/emailService");



//import schemas
const  Admin       =   require("../../models/adminSchema" ) ;




//GET ADMIN LOGIN PAGE
const adminLogin   = async ( req , res )  =>{
    try{
        if(  req.session.adminId ){
          
         
            return res.redirect("/admin/dashboard") ;
         }else{
            res.render( "backend/admin-login.ejs" ,{message : ""} ); 
            return;
         }
    }catch( err ){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    }
}




//POST ADMIN LOGIN
const loginPost  =  async ( req, res )  =>{
    try{
        let {email , password , remember_me } = req.body;
        email  = email.trim();
        password = password.trim();
        
        const admin = await Admin.findOne({email }) ; 
        
        if(admin){
    
            const passwordCompare = await Bcrypt.compare( password , admin.password ) ; 

           if(!passwordCompare){ 
              res.render( "backend/admin-login.ejs" ,{message : "Incorrect Password" } );   
              return
           }else{

              if(admin.verified == false ){
                const otp = Crypto.randomBytes(3).toString('hex') ; 
                const otpExpiry = Date.now() + 30000 ; // OTP valid for 30 sec 
                admin.otp = otp ;
                admin.otpExpiry = otpExpiry ; 
                admin.save();
                sendOTPEmail(email , otp);
                res.render("backend/admin-otp-verify" , {email : email ,  message : `An OTP is sent to your registered email : ${email} . Plese enter Otp for verify.`});
                return ;
              }
             
              if(remember_me){
                 req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000 ; // 30 days
              }
              req.session.adminId = admin._id ;
              req.session.adminEmail = admin.email ;
              res.redirect("/admin/dashboard") ;  
              return;
           }
           
        }else{
           res.render( "backend/admin-login.ejs" , { message : "Email can't exists. Please signup with Register"} );
           return ;   
        }
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;  
    }
}





//GET ADMIN  SIGNUP PAGE
const adminSignup  = async ( req , res )  =>{
    try{
        res.render( "backend/admin-signup.ejs" , { message : "" } ) ;  
    }catch( err ){
        console.log(err) ;
        res.status(500).render("frontend/404") ;
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
        
        const adminCount = await Admin.countDocuments() ; 
    
        // Check if a user with the given email already exists
        const existingAdmin = await Admin.findOne({ email : email }) ;  
     
        if (existingAdmin) {
            res.render("backend/admin-signup.ejs", { message: 'Admin already exist . Please Login.' });
            return;
        }else if( adminCount < 1){
            password = await Bcrypt.hash(password,10);
            const otp = Crypto.randomBytes(3).toString('hex'); 
            const otpExpiry = Date.now() + 30000; // OTP valid for 30 sec 
     
         await Admin.create({
           firstName,
           lastName,
           email,
           password,
           otp,
           otpExpiry
        })
     
             sendOTPEmail(email , otp);
     
        res.render("backend/admin-otp-verify" , {email : email ,  message : `An OTP is sent to your registered email : ${email} . Plese enter Otp for verify.`});
        return;
        }else{
            res.redirect("/admin")  ;  
        }
    }catch( err ){
        console.log(err) ;
        res.status(500).render( "frontend/404" ) ;      
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
           admin.verified = true; 
           admin.save();
           res.redirect("/admin")  ; 
           return;
         }else{
           const otp = Crypto.randomBytes(3).toString('hex');
           const otpExpiry = Date.now() + 30000; // OTP valid for 30 sec 
           admin.otp = otp;
           admin.otpExpiry = otpExpiry;
           admin.save(); 
           sendOTPEmail(email , otp); 
           res.render( "backend/admin-otp-verify" , { email : email ,  message : `Invalid Otp : ${email} . A New otp will be send.`}) ; 
           return;
         }
        }else{
           res.render("backend/admin-signup.ejs", { message: 'Try Again.' }) ;  
           return;
        } 
    }catch(err){
        console.log(err) ;
        res.status(500).render( "frontend/404" ) ;
    }
}




//POST RESEND OTP
const  resendEmailOtp  =  async  ( req , res ) =>{
    try{
        let {email } = req.body; 
        email=email.trim();
        const admin = await Admin.findOne({email});
        const otp = Crypto.randomBytes(3).toString('hex');
        const otpExpiry = Date.now() + 30000; // OTP valid for 30 sec 
     
        admin.otp = otp;
        admin.otpExpiry = otpExpiry;
        admin.save() ; 
     
        sendOTPEmail(email , otp);
        
        res.render("backend/admin-otp-verify" , {email : email ,  message : `A new OTP is sent to your registered email : ${email} . Plese enter new Otp for verify.`});  
              
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;
    }
}




//GET FORGOT PASSWORD
const forgotPassword = (req ,res) =>{
    try{
        res.render("backend/admin-forgot-password", {message : 'Enter your email for Password Reset Link '} );
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;
    }
  
  }



//POST FORGOT PASSWORD
const  forgotPasswordPost   =  async  ( req , res ) =>{
    try{
        let email = req.body.email ;
        email = email.trim();  

         const admin = await Admin.findOne({ email }); 
         if (!admin) {
           return res.render('backend/admin-forgot-password', { message: 'Email does not exist.' });
         }
        
         // Generate a token
         const token =Crypto.randomBytes(20).toString('hex');
         admin.resetPasswordToken =  token;
     
         admin.resetPasswordExpires = Date.now() + 600000; // 1 min
         await admin.save();
     
         await sendPasswordResetEmail(admin.email , token , req.headers.host);  
     
         res.render('backend/admin-forgot-password', { message: 'An email has been sent to ' + admin.email + ' with further instructions.' });
    }catch(err){
         console.log(err) ;
         res.status(500).render("frontend/404" ) ; 
    }
}





//GET RESET PASSWORRD PAGE THROUGH EMAIL LINK
const  resetPassword   =  async  ( req , res ) =>{
    try{
        const admin = await Admin.findOne({
            resetPasswordToken : req.params.token
          });
          if (!admin) {
            return res.render( 'backend/admin-reset-password', { message : 'Password reset token is invalid or has expired.' , token : "" });
          }
          res.render('backend/admin-reset-password', { token: req.params.token , message : "create new password" });
    }catch(err){
         console.log(err) ;
         res.status(500).render("frontend/404" ) ;     
    }
}





//RESET PASSWORD
const  resetPasswordPost  =  async  ( req , res ) =>{
    try{
        const admin = await Admin.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } 
          });

          if (!admin) {
            return res.render('backend/admin-reset-password', { message : 'Password reset token is invalid or has expired.' }) ;
          }
      
          if (req.body.password === req.body.confirm) { 
            admin.password = await Bcrypt.hash(req.body.password, 10);
            admin.resetPasswordToken = undefined;
            admin.resetPasswordExpires = undefined; 
            await admin.save();
             
           res.render("backend/admin-login.ejs",{message : "Password creat Success! Please Login"});
          } else {
            res.render('backend/admin-reset-password', { message: 'Passwords do not match.',token :"" });
          }

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404" ) ;          
    }
}

    



//ADMIN LOGOUT
const adminLogout  = async ( req , res )  =>{
    try{
        req.session.adminId = null ;
        res.redirect("/admin") ;
    }catch( err ){
        console.log(err) ;
        res.status(500).render("frontend/404") ;        
    }
}

 







module.exports  =  { adminLogin  , loginPost , adminSignup , 
    adminSignupPost , adminVerifyOtp , adminLogout ,
    resendEmailOtp  , forgotPassword , forgotPasswordPost ,
    resetPassword , resetPasswordPost
  }  ; 
