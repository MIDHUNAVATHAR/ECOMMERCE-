

//import schemas
const   User   =  require("../../models/userSchema") ;





const  withDrawBalance  =  async  ( req , res )  => {
    try{
        const { amount , userId } = req.body ; 
       
        const user  =  await User.findById(userId) ;

        user.walletBalance +=   user.rewardsBalance  ;
        user.rewardsBalance  = 0; 

        user.save();

        return res.status(200).json({ status : true });


    }catch(err){
        console.error('Error withdraw referral balance :', err);
        res.status(500).render('frontend/404');        
    }
}





module.exports  =  { withDrawBalance }  ; 