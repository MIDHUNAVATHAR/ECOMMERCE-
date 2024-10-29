
const User = require("../models/userSchema");





const checkAuthentication = async (req, res ,next) =>{
    
    try{
        const userId = req.session.userId  || (req.user ? req.user.id : null);

        if(userId){
        const user = await User.findById( userId ) ; 
        if(user && user.status == "block"){
           return  res.render("frontend/blocked-page.ejs") ;
        }
        next(); 
       }else{
        return  res.render("frontend/user-login" , { message : '' } ) ;  
       } 
  
       
 
    }catch(err){ 
        console.log(" Error checking user status " , err ) ;
        res.status(500).json({ message : "An error occurred while loading profile page." }) ;
        res.render("frontend/404" )  ;              
    } 
   
} 

             





module.exports = checkAuthentication ;  