
// Import required modules
const passport = require('passport');                                          // Passport.js for authentication
const GoogleStrategy = require('passport-google-oauth20').Strategy ;           // Google OAuth 2.0 strategy
const User = require('../models/userSchema');                                  // User model for database operations
require('dotenv').config();                                                    // Load environment variables from .env file





// Google Strategy for User Authentication
passport.use( 'google-user' , new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID ,                                   // Google OAuth Client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ,                           // Google OAuth Client Secret
    callbackURL : process.env.GOOGLE_CLIENT_CALLBACK_URL ,                     // URL to handle Google OAuth callback
    passReqToCallback: true                                                    // Enables passing the request object to the callback function
}, async (req, accessToken, refreshToken, profile, done) => { 

    let adminStatus  = req.session.admin ;                                     // Retrieve admin status from session (if available)
   

    // Extract referral code from the `state` parameter in the query
    const referralCode = JSON.parse(req.query.state).referralCode ;  


    // Check if a user exists with the given Google ID
    let user = await User.findOne({ googleId: profile.id }); 

    // Check if a user exists with the same email (not yet linked to Google)
    let existingUser = await User.findOne({email : profile.emails[0].value } ) ;


    if (!user) {                                                              // If no user with the given Google ID is found
        if( existingUser ){
            // Link Google account to an existing user
            existingUser.googleId = profile.id ; 
            existingUser.verified = true;
            await existingUser.save(); 

            // Store user data in the session
             req.session.user = {
                id: existingUser._id,
                email: existingUser.email,
                role: "user",
            };

          
            req.session.admin = adminStatus ;
    

            // Save the session
            await req.session.save();
            // Set the session cookie's maximum age (in milliseconds)
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;               // Set session expiration to 7 days
          
            return done(null, existingUser);
        }


        // Handle referral logic if a referral code is provided
        let referredByUser = null;
        if (referralCode) { 
            referredByUser = await User.findOne({ referralCode: referralCode }); 

            if (!referredByUser) {
                return done(null, false, { message: 'Invalid referral code' });
            }
        }



        // Create a new user account
        user = await User.create({
            googleId: profile.id ,    
            email: profile.emails[0].value , 
            firstName : profile.name.givenName , 
            lastName : profile.name.familyName , 
            verified : true ,
            referralCode: referralCode || null ,                                 // Save referral code if provided
            referredBy: referredByUser ? referredByUser._id : null               // Link to referring user if applicable
        });  


          // Store user data in the session
          req.session.user = {
            id: user._id,
            email: user.email,
            role: "user",
        };

  
        req.session.admin = adminStatus ;
        await req.session.save();
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;                     // Set session expiration to 7 days


     // Update referral rewards if the user was referred
     if (referredByUser) {
        referredByUser.referralCount += 1;                                       // Increment referral count
        referredByUser.rewardsBalance += 19;                                     // Example reward for a successful referral   
        await referredByUser.save();
    }

        done(null, user);

    }else{
        // If the user with the given Google ID exists
        req.session.user = {
            id: user._id,
            email: user.email,
            role: "user",
        };
        req.session.admin = adminStatus ; 
        await req.session.save();
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;                     // Set session expiration to 7 days

    done(null, user);
    }
})); 





// Serialize the user into the session
passport.serializeUser((user, done) => {
   
    done(null, user.id);                                                         // Store only the user ID in the session
});





// Deserialize the user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);                                   // Retrieve the user by ID from the database
        if (user) {
            done(null, user);                                                   // Pass the user object to the request
        } else {
            done(null, false, { message: 'User not found' }) ;                  // Handle case where user is not found
        }
    } catch (err) {
        done(err, null);                                                        // Handle errors during deserialization
       
    }
});

 

