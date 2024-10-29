

//import schemas 
const User               =  require("../../models/userSchema") ;
const Cart               =  require("../../models/cartSchema") ;
const WalletTransaction  =  require("../../models/walletTransaction") ;
const Logo               =    require("../../models/logoSchema") ;
const GenderCategory     =    require("../../models/genderCategory") ;




//POST  ADD WALLET
const  walletAddCart  =  async  ( req , res ) =>{
    try{
        const userId =  req.session.userId || req.user.id ;
        const user  =  await User.findById(userId); 
        const cart = await Cart.findOne( {user : userId} );
        let cartTotal = cart.items.reduce((total , item ) => total + item.quantity * item.discountedPrice , 0); 
        let walletAmount = user.walletBalance;
    
        if(cartTotal >= walletAmount){
            cart.walletBalance = walletAmount;
            user.walletBalance = 0;
           
        }else{
            cart.walletBalance = cartTotal ;
            user.walletBalance = walletAmount - cartTotal ;
        }
        cart.save()
        user.save()
        res.redirect("/cart");
    }catch(err){
        console.log(err.message);
        res.status(500).render("frontend/404");  
    }
}



//POST REMOVE WALLET
const walletRemoveCart  =  async  ( req , res  )=>{
    try{
        const userId =  req.session.userId || req.user.id ;
        const user  =  await User.findById(userId);
        const cart = await Cart.findOne( {user : userId} );
       
        let walletApplied = cart.walletBalance ;

        // Restore the wallet balance and reset the applied wallet amount in cart
        user.walletBalance += walletApplied ;
        cart.walletBalance = 0;

        cart.save()
        user.save()
        res.redirect("/cart");
    }catch(err){
        console.log(err.message); 
        res.status(500).render("frontend/404");  
    }
}



//GET WALLET HISTORY PAGE
const getWalletHistory = async (req, res) => {
    try {
        const userId = req.user._id || req.session.userId ; // Assuming you have user ID in the request
        const logo = await Logo.findOne().sort({ updatedAt: -1 });
        const genderCategory = await GenderCategory.find({softDelete : false}); 
        const user = await User.findById( userId ) ; 

        const { page = 1, limit = 10 } = req.query;
      
        const walletTransactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit)
        .limit(limit);

        const totalWalletTransactions = await WalletTransaction.countDocuments();
        const totalPages = Math.ceil( totalWalletTransactions / limit);



        res.render('frontend/walletHistory', { walletTransactions , logo ,genderCategory , user ,
            currentPage : page , totalPages
         });
    } catch (error) {
        console.error('Error fetching wallet history:', error);
        res.status(500).render('frontend/404');
    }
};

 
 


module.exports = { walletAddCart , walletRemoveCart , getWalletHistory  } ; 