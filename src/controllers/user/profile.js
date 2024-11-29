


//import modules
const bcrypt           =  require("bcrypt") ;



//import schemas
const Logo             =   require("../../models/logoSchema") ; 
const GenderCategory   =   require("../../models/genderCategory") ; 
const User             =   require("../../models/userSchema") ;
const Cart             =   require("../../models/cartSchema") ; 
const Address          =   require("../../models/addressSchema") ;


  





//GET  PROFILE  PAGE
const showProfile = async ( req , res ) => { 
   try{
      const logo           = await Logo.findOne().sort({ updatedAt: -1 });
      const genderCategory = await GenderCategory.find({ softDelete : false }) ; 
      const userId         = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
      const user           = await User.findById( userId ) ; // assuming user is authenticated and stored in session
    
      let cartTotal ; 
         if(user){
         const cart = await Cart.findOne({user : user._id});
         if(cart){
          cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0 ); 
         }
         }else{
         cartTotal = 0 ;
         }
    
      res.render("frontend/userProfile" , { logo , genderCategory , user, userId, cartTotal }) ; 
   }catch(err){
      console.log(err);
      res.status(500).render("frontend/404");  
   }
 
  } 



//POST EDIT PROFILE PAGE
const  editProfilePost  =  async  ( req , res ) =>{
   try{
      let { firstName , lastName , mobile , gender , email } = req.body ;
      firstName =firstName.trim().toLowerCase();
      lastName =  lastName.trim().toLowerCase();
      mobile =  mobile.trim();  
      
      const user = await User.findOne( { email } ) ;  
    
      user.firstName = firstName;
      user.lastName  = lastName; 
      user.mobile    = mobile;
      user.gender    = gender;
       
      await user.save();
      res.redirect("/userProfile");
   }catch(err){
      console.log(err);
      res.status(500).render("frontend/404");  
   }
}




//GET PROFILE ADDRESS MANAGEMENT
const  userAdressMng  =  async  ( req , res )  =>{
   try{
      const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
      const genderCategory = await GenderCategory.find({ softDelete : false }) ; 
      const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
      const user = await User.findById( userId ) ; // assuming user is authenticated and stored in session
      let cartTotal ; 
      if(user){
      const cart = await Cart.findOne({user : user._id});
      if(cart){
        cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0); 
       }
      }else{
      cartTotal = 0 ;
      }
    
      const addresses = await Address.find({userId : user , softDelete : false }) ;
      res.render("frontend/userAdressManage.ejs" , { logo , genderCategory , user , userId ,  addresses , cartTotal  } ) ;

   }catch(err){
   
      console.log(err);
      res.status(500).render("frontend/404");  

   }
}



//POST EDIT PROFILE ADDRESS MANAGEMENT
const saveAddress = async ( req,res ) =>{
   let { userId , name , phone , alternatephone , address , landmark , city , state , pincode , addresstype , checkout } = req.body ; 
   name = name.trim();
   phone = phone.trim();
   alternatephone = alternatephone.trim();
   address = address.trim();
   landmark = landmark.trim();
   city = city.trim();
   state = state.trim();
   pincode = pincode.trim();
  
 try{
 const addresses = new Address({
   userId : userId,
   name : name,
   phone : phone,
   alternatePhone : alternatephone , 
   address : address, 
   landmark : landmark,
   city : city,
   state : state,
   pincode : pincode , 
   addresstype : addresstype,
 })

 await addresses.save();
 
 if( checkout == 1 ){
      return res.redirect( "/userAdressMang" ) ;
 }else{
   return res.redirect( "/checkout" ) ; 
 }


}catch(err){
 console.log(err.message);
 res.status(500).render("frontend/404");  
}

}




//GET DELETE ADDRESS
const deleteAddress = async ( req,res ) =>{
   try{
      await Address.findByIdAndUpdate(req.params.id, { softDelete: true });
      if(req.query.checkout){
        return res.redirect("/checkout");
      }else{
        return res.redirect( "/userAdressMang" ) ;
      }
   }catch(err){
      console.log(err.message);
      res.status(500).render("frontend/404");  
   }

 }
  
 



 //POST EDIT PROFILE ADDRESSES 
 const editAddress = async ( req,res ) =>{ 
 
   try{
 
   let { userId,name,phone,alternatephone,address,landmark,city,state,pincode,addresstype , checkout } = req.body ; 
   name = name.trim();
   phone = phone.trim();
   alternatephone = alternatephone.trim();
   address = address.trim();
   landmark = landmark.trim();
   city = city.trim();
   state = state.trim(); 
   pincode = pincode.trim();
 
   await Address.findByIdAndUpdate( req.params.id ,{
     name , 
     phone ,
     alternatePhone : alternatephone ,
     address ,
     landmark ,
     city ,
     state ,
     pincode ,
     addresstype ,
   });
 
 
   if( checkout == 1 ){
     return res.redirect('/checkout') ;
   }else{
     return res.redirect('/userAdressMang') ;
   }
 
 
   }catch(err){
      console.log(err.message);
      res.status(500).render("frontend/404");  
   }
   
 }





 //get change password page
 const  changePassword  =  async  ( req , res ) => { 
   try{
      const logo = await Logo.findOne().sort({ updatedAt: -1 });
      const genderCategory = await GenderCategory.find({ softDelete : false }) ; 
      const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
      const user = await User.findById( userId );

      let cartTotal ; 
      if(user){
      const cart = await Cart.findOne({user : userId});
      if(cart){
        cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0); 
       }
      }else{
      cartTotal = 0 ;
      }

     
      res.render("frontend/changePassword.ejs" , { logo  , genderCategory , user , userId , cartTotal  } ) ; 

   }catch(err){
      console.log(err.message) ;
      res.status(500).render("frontend/404") ;         
   }
 }





 //change password
 const  postChangePassword   =  async  ( req , res ) => {
   try{

      let { oldPassword, newPassword , confirmPassword } = req.body ;
       
      oldPassword.trim();      
      newPassword.trim();
      confirmPassword.trim();

      const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
    
      if( newPassword != confirmPassword ){
         return res.status(400).json({ message : "New Password and Confirm Password does not match" }) ;
      }
      else{
         const user = await User.findById( userId ); 
         
         // if(user.googleId){
         //    res.status(400).json({ message : "You are authenticated by google" }) ;
         //    return;
         // }else{
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
              return res.status(400).json({ message: 'Incorrect old password ', link :`/userForgotPassword` });
            }else{
               const hashedPassword = await bcrypt.hash(newPassword, 10);
               await User.findByIdAndUpdate(userId, { password: hashedPassword });

               res.status(200).json({ message: 'Password updated successfully' });
            }
         }
         
    //  }

    
        
     

   }catch(err){
      console.log(err.message) ;
      res.status(500).render("frontend/404") ;              
   }
 }






  module.exports = { 
   showProfile ,
   editProfilePost,
   userAdressMng,
   saveAddress,
   deleteAddress,
   editAddress,
   changePassword ,
   postChangePassword
} ; 