


//import  schemas
const  ReturnOrder        =    require("../../models/returnOrder") ;
const  Product            =    require("../../models/product")  ;
const  User               =    require("../../models/userSchema") ;
const  WalletTransaction  =    require("../../models/walletTransaction") ;
const  Address            =    require('../../models/addressSchema');







//GET  RETURN ORDERS
const  returnOrders  =  async  ( req , res )  => {
    try{

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalOrders = await ReturnOrder.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit) ; 

        const returnOrders = await ReturnOrder.find()
            .populate('orderId')
            .populate('userId')
            .populate('pickupAddress')
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit) ;

        res.render("backend/admin-dashboard.ejs" , { message : '', admin : req.session.adminEmail , partial : "partials/returnOrders" ,
            returnOrders, currentPage: page , totalPages ,  totalOrders
        })
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;      
    }

}




//UPDATE STATUS
const   updateStatus   =  async  ( req , res )  =>{
    try{
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const returnOrder = await ReturnOrder.findById(id);

        if (!returnOrder) {
            return res.status(404).json({ message: 'Return order not found' });
        }

        // Check if order is already completed
        if (returnOrder.returnStatus === 'completed') {
            return res.status(400).json({ 
                message: 'Cannot modify completed return orders' 
            });
        }

        returnOrder.returnStatus = status;
        if (adminNote) {
            returnOrder.adminNote = adminNote;
        }



          //update the product quantity to database 
          if (status === 'completed') {
            // Update product quantities
            for (const item of returnOrder.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    const sizeObj = product.sizes.find(size => size.size === item.size);
                    if (sizeObj) {
                        sizeObj.quantity += item.quantity;
                    }
                    await product.save();
                }
            }

            // Add refund amount to user's wallet
            const user = await User.findById(returnOrder.userId);
            if (user) {
                user.walletBalance += returnOrder.totalRefundAmount;

                // Create wallet transaction record
                const walletTransaction = new WalletTransaction({
                    userId: user._id,
                    amount: returnOrder.totalRefundAmount,
                    type: 'credit',
                    description: `Refund for returned order ${returnOrder._id}`,
                    balanceAfterTransaction: user.walletBalance 
                });

                await walletTransaction.save();

                await user.save() ; 
            }
        }

         await returnOrder.save() ;
        res.redirect('/admin/returnOrders'); 
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;  
     }
}
  



  
//VIEW RETURN ORDER
const  getReturnOrderDetails  =  async  ( req , res ) => {
    
    try{
        const returnOrderId = req.params.id;
        const returnOrder = await ReturnOrder.findById(returnOrderId)
            .populate('orderId')
            .populate('userId')
            .populate({
                path: 'items.product' , 
                model: 'Product'
            })
            .populate('pickupAddress') ;

        if (!returnOrder) {
            return res.status(404).json({ message: 'Return order not found' }) ; 
        }

        res.render("backend/admin-dashboard.ejs" , { message : '', admin : req.session.adminEmail , 
            partial : "partials/returnOrderView" , returnOrder } );

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;         
    }
}




 
module.exports   =  { returnOrders , updateStatus  , getReturnOrderDetails  } ;    