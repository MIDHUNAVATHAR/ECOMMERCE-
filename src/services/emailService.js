

// Import the email configuration
const transporter      =     require("../configs/email-config");



// Send OTP Email function
const sendOTPEmail = async (email, otp) => {
    try{
        let mailOptions = {
            from: process.env.MAIL_ID,
            to: email,
            subject: 'Your OTP for User Verification',
            text: `Your OTP is: ${otp}`
          };
        
          await transporter.sendMail(mailOptions);
    }catch(err){
        console.log(err) ;
        res.status(500).json({ message : "An error occurred while sending email otp." }) ;
        res.render("frontend/404" )  ; 
    }

};
  

  

// Send Password Reset Email function  
const sendPasswordResetEmail = async (email, token, host) => {
    try{
        let mailOptions = {   
            to: email,
            from: process.env.MAIL_ID,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              http://${host}/userResetPassword/${token}\n\n 
              If you did not request this, please ignore this email and your password will remain unchanged.\n`
          };
        
          await transporter.sendMail(mailOptions);
    }catch(err){
        console.log(err) ;
        res.status(500).json({ message : "An error occurred while sending reset password link." }) ;
        res.render("frontend/404" )  ; 
    } 

};


// Send Password Reset Email function  
const sendPasswordResetEmailAdmin = async (email, token, host) => {
    try{
        let mailOptions = {   
            to: email,
            from: process.env.MAIL_ID,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              http://${host}/admin/adminResetPassword/${token}\n\n 
              If you did not request this, please ignore this email and your password will remain unchanged.\n`
          };
        
          await transporter.sendMail(mailOptions) ; 
    }catch(err){
        console.log(err) ;
        res.status(500).json({ message : "An error occurred while sending reset password link." }) ;
        res.render("frontend/404" )  ; 
    } 

};


    

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendPasswordResetEmailAdmin
};
