

// Import required modules
const nodemailer  = require('nodemailer');  // Module for sending emails
const dotenv      = require("dotenv");      // Module for loading environment variables from a .env file
 




// Load environment variables from the .env file
dotenv.config();                            // Reads the .env file and makes variables accessible via process.env





// Create a transporter for sending emails using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',                         // Specifies the email service provider (Gmail in this case)
  auth: {
    user: process.env.MAIL_ID,              // Email ID for authentication, fetched from environment variables
    pass: process.env.MAIL_PASS,            // Email password for authentication, fetched from environment variables
  },
  tls: {
   rejectUnauthorized: false                // Allows connections even if the certificate is self-signed
 }
});





// Export the transporter so it can be used in other parts of the application
module.exports   =   transporter ;   
