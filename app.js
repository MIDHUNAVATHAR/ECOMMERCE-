

const  express  =  require("express")  ; 
const  mongoose =  require("mongoose")  ; 
const  app      =  express()  ;
const  winston  =  require("winston")  ;
const  path     =  require("path")  ; 
const  session  =  require('express-session');   
const  passport = require('passport'); 






//loads env variables from .env file   
require("dotenv").config()  ; 


require("./src/configs/passport-config") ;


const PORT      =  process.env.PORT  ||  8002  ;


 


const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI) ;
        winston.log("info" , "MongoDB Connected") ;
    }catch(err){ 
        winston.error(err.message) ; 
    }
}
connectDB() ; 



app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(session({
    secret: process.env.secretKey,
    resave: false, 
    saveUninitialized: true ,   
    cookie: {  
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds 
  }
})); 



app.use(passport.initialize());  
app.use(passport.session());

 
//serve uploads folder as static  
app.use('/uploads', express.static('uploads')) ;

//serve public folder as static
app.use('/public', express.static('public'));


//set view engine and path 
app.set("view engine" , "ejs" ) ;
app.set("views" , path.join(__dirname , "views") )  ;



//import routes
const userRoute   =  require("./src/routes/user-route")  ; 
const adminRoute  =  require("./src/routes/admin-route") ;


app.use( "/" , userRoute ) ;
app.use("/admin" , adminRoute ) ;  
 
  

app.listen( PORT , ( err ) => err  ?  winston.error( err ) : winston.log(  "info" , `Server Started on the Port : ${PORT} `) )  ;