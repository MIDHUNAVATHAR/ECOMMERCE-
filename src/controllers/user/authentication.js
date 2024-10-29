


//import modules
const Bcrypt          = require("bcrypt");
const Crypto          = require("crypto");


//import schemas
const User            =   require("../../models/userSchema") ;


//import services
const { sendOTPEmail, sendPasswordResetEmail } = require("../../services/emailService");




//GET LOGIN 
const  userLogin  = async ( req,res ) =>{
    try{
        res.redirect("/");  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    }
}


//POST  LOGIN
const  userLoginPost = async ( req , res ) => {

  try{

    let {email , password , remember_me } = req.body ;
    email  = email.trim();
    password = password.trim(); 
    
    const user = await User.findOne({email });
 
    if(user){ 
       if(user.status == "block"){
          return res.render("frontend/blocked-page");
       }
 
       if(user.verified == false){
          return   res.render("frontend/user-otp-verify" , { timer : 0, email : email ,  message : ` Please click Resend Otp for verify .An OTP will sent to your registered email : ${email} `});

       }

       const passwordCompare = await Bcrypt.compare( password , user.password ) ;   
       if(user.googleId){ 
          res.render( "frontend/user-login" ,{message : "Please continue with gooogle"} );
          return;
       }else if(!passwordCompare){ 
          res.render( "frontend/user-login" ,{message : "Incorrect Password" } );  
          return
       }else{
          if(remember_me){
             req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
          } 
          req.session.userId = user._id ;
          res.redirect("/"); 
          return;
       }
       
    }else{
       res.render( "frontend/user-login" ,{ message : "Email can't exists. Please signup with Register"} );
       return;
    }

  }catch( err ){
    console.log(err) ;
    res.status(500).render("frontend/404");  
  }
 }





//GET  USER-SIGNUP
const  userSignup  =  async  ( req,res ) =>{
    try{
    res.render( "frontend/user-signup" , {message : ""}); 
    }catch(err){
     console.log(err);
     res.status(500).render("frontend/404");  
    }
}





//POST USER-SIGNUP
const  userSignupPost  =  async  ( req,res ) =>{
   try{
    let {firstName , lastName , email , password } = req.body ; 
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim();
    password = password.trim();
 
     // First find the referring user by their referral code
     const referringUser = await User.findOne({ 
       referralCode: req.query.referralCode 
     });
 
 
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email: email.trim() }) ;  
 
    if (existingUser) {
        res.render("frontend/user-signup.ejs", { message: 'Email already exists. Please login.' });
        return;
    }
 
    password = await Bcrypt.hash(password,10)  ;
    const otp = Crypto.randomBytes(3).toString('hex');
    const otpExpiry = Date.now() + 300000 ; // OTP valid for 5 minutes  
 
 
   const user = new User({
     firstName,
     lastName,
     email,
     password,
     otp,
     otpExpiry,
     referredBy: referringUser ? referringUser._id : null
   });
 
   
   await user.save();
 
   // If there was a referring user, update their referral count and maybe add rewards
   if (referringUser) {
     await User.findByIdAndUpdate(referringUser._id, {
       $inc: { 
         referralCount: 1 ,
         rewardsBalance: 19  
       }
     });
   }
  
 
    sendOTPEmail(email , otp);
 
 
    res.render("frontend/user-otp-verify" , { timer : 1, email : email ,  message : `An OTP is sent to your registered email : ${email} . Plese enter Otp for verify.`});
 

   }catch(err){
    console.log(err) ;
    res.status(500).render("frontend/404");  
   }
}




//POST 
const  resendEmailOtp  =  async  ( req , res )  =>{
    try{
        let { email } = req.body ; 
        email=email.trim();
        const user = await User.findOne({email});
        const otp = Crypto.randomBytes(3).toString('hex');
        const otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
     
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.save(); 
     
        sendOTPEmail( email , otp ) ; 
        
        res.render("frontend/user-otp-verify" , { timer: 1 , email : email ,  message : `A new OTP is sent to your registered email : ${email} . Plese enter new Otp for verify.`});  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404");  
    }
}




const checkOtp = async (req,res) =>{ 
    try{
        let { email , otp } = req.body;
        email = email.trim(); 
        otp = otp.trim();
     
        const user = await User.findOne({email});
        if(user){
         if(user.otp == otp && user.otpExpiry > Date.now()){
           user.otp = null;
           user.otpExpiry = null;
           user.verified = true; 
           user.save();
           res.redirect("/");
           return;
         }else{
           res.render("frontend/user-otp-verify" , {timer : 0,email : email ,  message : `Invalid Otp : ${email} . `}); 
           return;
         }
        }else{
           res.render("frontend/user-signup.ejs", { message: 'Try Again.' }); 
           return;
        } 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
    }
   
 }





 const forgotPassword  = async ( req,res ) => {
    try{
        res.render("frontend/user-forgot-password" , { message : ''} );
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
    }
 }




 const forgotPasswordPost  = async ( req,res ) => {
  
    try{
        let email = req.body.email ;
        email = email.trim();  
        const user = await User.findOne({ email });
        if (!user) {
          return res.render('frontend/user-forgot-password', { message: 'Email does not exist.' });
        }
       
        // Generate a token
        const token =Crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken =  token;
     
        user.resetPasswordExpires = Date.now() + 600000; // 1 min
        await user.save();
    
        await sendPasswordResetEmail(user.email , token , req.headers.host);
    
        res.render('frontend/user-forgot-password', { message: 'An email has been sent to ' + user.email + ' with further instructions.' });
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
    }
 }

 

 const resetPassword    =  async  ( req,res )  =>  {
     try{
        const user = await User.findOne({
            resetPasswordToken : req.params.token  
          });
          if (!user) {
            return res.render('frontend/user-reset-password', { message: 'Password reset token is invalid or has expired.',token:"" });
          }
          res.render('frontend/user-reset-password', { token: req.params.token , message : "create new password" });
       
     }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
     }
 }




 const  resetPasswordPost   =  async  ( req,res )  => {
  
    try{
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() } 
          });
          if (!user) {
            return res.render('frontend/user-reset-password', { message: 'Password reset token is invalid or has expired.' });
          }
      
          if (req.body.password === req.body.confirm) {
            user.password = await Bcrypt.hash(req.body.password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined; 
            await user.save();
    
           res.render("frontend/user-login.ejs",{message : "Password creat Success! Please Login"});
          } else {
            res.render('frontend/user-reset-password', { message: 'Passwords do not match.',token :"" });
          }
    }catch(err){ 
        console.log(err);
        res.status(500).render("frontend/404");  
    }
 }



 const userLogout = (req,res) =>{
    try{
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Failed to log out.');
            }
            res.redirect('/userlogin'); // Redirect to login
        }); 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
    }
 }
   
      



const blocked = ( req,res )  => {
    try{
        res.render("frontend/blocked-page.ejs");
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404");  
    }
}
 

 





 module.exports  =  { 
    userLogin,
     userLoginPost,
      userSignupPost ,
       userSignup ,
       resendEmailOtp,
       checkOtp,
       forgotPassword ,
       forgotPasswordPost ,
       resetPassword,
       resetPasswordPost ,
       userLogout,
       blocked
} 
 