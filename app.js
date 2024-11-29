
// Import necessary modules
const  express  =  require("express")  ;         // Web framework for Node.js
const  mongoose =  require("mongoose")  ;        // MongoDB object modeling tool
const  app      =  express()  ;                  // Initialize Express application
const  winston  =  require("winston")  ;         // Logging library
const  cors     =  require("cors")               // Middleware to enable Cross-Origin Resource Sharing
const  path     =  require("path")  ;            // Utility for working with file and directory paths
const  session  =  require('express-session');   // Middleware for handling sessions
const  passport = require('passport');           // Authentication middleware


require('dotenv').config();                      // Load environment variables from .env file


app.use(cors());                                 // Enable CORS to allow requests from other origins


// Passport configuration (assumes the config file sets up strategies)
require("./src/configs/passport-config") ;


// Set up server port, defaulting to 8001 if not specified in environment variables
const PORT      =  process.env.PORT  ||  8001  ;


// Function to connect to MongoDB
const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI) ;
        winston.log("info" , "MongoDB Connected") ;
    }catch(err){ 
        winston.error(err.message) ; 
    }
}
connectDB() ; // Invoke the connection function



// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded payloads
app.use(express.json());                        // Parse JSON payloads


// Session middleware configuration
app.use(session({
    secret: process.env.secretKey,// Secret key from environment for session encryption
    resave: false, // Prevents saving session back to the store if unmodified
    saveUninitialized: true , // Allows saving uninitialized sessions  
    cookie: {
        httpOnly: true,// Prevents client-side JavaScript access to cookies
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  }
})); 



// Initialize Passport for authentication
app.use(passport.initialize());  
app.use(passport.session());

 
// Serve static files
app.use('/uploads', express.static('uploads')) ;
app.use('/public', express.static('public'));


// Set the template engine and views directory
app.set("view engine" , "ejs" ) ;          // Set EJS as the view engine
app.set("views" , path.join(__dirname , "views") )  ;// Define views directory



//import routes
const userRoute   =  require("./src/routes/user-route")  ;// User-related routes
const adminRoute  =  require("./src/routes/admin-route") ;// Admin-related routes



app.use( "/" , userRoute ) ;// Mount user routes
app.use("/admin" , adminRoute ) ; // Mount admin routes


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error
    res.render( "frontend/404" ) ; // Render 404 error page
});
  
 
// Catch-all route for undefined routes
app.use( (req , res ) =>{
    res.render( "frontend/404" ) ; // Render 404 error page
} )
  

// Start the server and log success or errors
app.listen( PORT , ( err ) => err  ?  winston.error( err ) : winston.log(  "info" , `Server Started on the Port : ${PORT} `) )  ;