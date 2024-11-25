

//import schemas
const  Order          =  require("../../models/orderSchema")  ; 
const  ReturnOrder    =  require("../../models/returnOrder")  ; 
const  Logo           =  require("../../models/logoSchema") ;
const  GenderCategory =  require("../../models/genderCategory") ;
const  User           =  require("../../models/userSchema") ;
const  Cart           =  require("../../models/cartSchema" ) ;






//GET RETURN ORDER PAGE
const  returnOrder  =  async  ( req ,res ) => {
    try{
       
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
    
         const user = await User.findById( userId ) ; // assuming user is authenticated and stored in session
      
        const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
        const genderCategory = await GenderCategory.find({ softDelete : false }) ; 


        
         let cartTotal ; 
         if(user){
         const cart = await Cart.findOne({user : userId});
         if(cart && cart.items > 0){
            console.log(cart.items);
          cartTotal = cart.items.reduce((total, item) => {
            return item.status === "Available" ? total + item.quantity : total ;
          }, 0); 
         }
         }else{
         cartTotal = 0 ; 
         } 

        const order = await Order.findById(req.params.id)
        .populate('items.product');
    
        res.render('frontend/orderReturn', { order  , logo , genderCategory , user : userId , userId , cartTotal  });
     
    }catch(err){
        console.log(err.message); 
        res.status(500).render("frontend/404") ;  
    }
}

 

//POST RETURN ORDER
const  postReturnOrder  =  async ( req ,res ) => {


    try{
        const { orderId, items, reason } = req.body;
       
        // Fetch original order
        const originalOrder = await Order.findById(orderId)
            .populate('items.product') 
            .populate('shippingAddress');

        if (!originalOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
      

        // Validate return eligibility (e.g., within return window)
        const orderDate      = new Date(originalOrder.deliveryDate);
        const currentDate    = new Date();
        const daysDifference = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 7) { // 7 days return window
            return res.status(400).json({ message: 'Return window has expired' });
        }

        // Validate items and calculate refund amount
        let totalProductValue = 0 ;
        const returnItems = [];
      
        for (const returnItem of items) {
            const originalItem = originalOrder.items.find(
                item => item.product._id.toString() === returnItem.productId
            );

            if (!originalItem) {
                return res.status(400).json({ 
                    message: `Product ${returnItem.productId} not found in original order` 
                });
            }

          //  Check if return quantity is valid
            if (returnItem.quantity > originalItem.quantity) {
                return res.status(400).json({ 
                    message: `Return quantity cannot exceed ordered quantity for ${originalItem.product.name}` 
                });
            }

           // Calculate refund amount for this item
            const itemRefund = originalItem.price * returnItem.quantity;
            totalProductValue += itemRefund;

            returnItems.push({
                product: originalItem.product._id,
                quantity: returnItem.quantity,
                price: originalItem.price,
                size: originalItem.size,
            });
        }




       // proportional discount 
       const totalOrderValue       =   originalOrder.totalPrice   ;
       const totalDiscountApplied  =   originalOrder.appliedCoupon + originalOrder.appliedWallet  ;

       const proportionalDiscount  =   (totalProductValue / totalOrderValue)*totalDiscountApplied ;

       const refundAmount          =   totalProductValue - proportionalDiscount ;
        

        // Create return order
        const returnOrder = new ReturnOrder({
            orderId: orderId,
            userId : originalOrder.userId ,
            items: returnItems,
            reason: reason,
            totalRefundAmount : refundAmount   ,
            pickupAddress: originalOrder.shippingAddress
        });
        

        await returnOrder.save().catch((err) => console.log(err) )
        

        // Update original order status
        await Order.findByIdAndUpdate(orderId, {
            $set: { returnRequested: true }
        });

        res.status(201).json({
            message: 'Return request created successfully',
            returnOrder
        });
    }catch(err){
        console.log(err.message); 
        res.status(500).render("frontend/404") ;          
    }
}





//GET ORDER RETURNS PAGE
const  orderReturn  =  async  ( req , res ) => { 
    try{
        
        const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
        const user   = await User.findById( userId ) ; 
        const logo = await Logo.findOne().sort({ updatedAt: -1 }); 
        const genderCategory = await GenderCategory.find({ softDelete : false }) ; 

        let cartTotal ; 
        if(userId){
        const cart = await Cart.findOne({user : userId});
        if(cart && cart.items > 0){
           console.log(cart.items);
         cartTotal = cart.items.reduce((total, item) => {
           return item.status === "Available" ? total + item.quantity : total ;
         }, 0); 
        }
        }else{
        cartTotal = 0 ; 
        } 


        const currentPage = parseInt(req.query.page) || 1 ;
        const limit = 2 ; 
        
        const totalReturnOrders = await ReturnOrder.countDocuments({}) ;
        const skip = ( currentPage-1 ) * limit ; 
        
       
        const totalPages = Math.ceil( totalReturnOrders/limit ) ;  


        // Fetch return orders for the logged-in user, and populate the necessary fields
        const returnOrders = await ReturnOrder.find({ userId })
            .populate('items.product') // Populating product details
            .populate('pickupAddress')  // Populating pickup address details
            .skip(skip).limit(limit) ; 
        
        // Render the return orders page with the fetched return orders
        res.render('frontend/returnOrders', { returnOrders , logo , genderCategory , user , userId , currentPage ,
            totalPages , searchKeyword :"" , cartTotal
         });       

    }catch(err){
        console.log(err.message); 
        res.status(500).render("frontend/404") ;          
    }
}







module.exports  =  { returnOrder , postReturnOrder , orderReturn }  ; 