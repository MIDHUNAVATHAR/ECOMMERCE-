



//import schemas
const Orders             =  require("../../models/orderSchema") ;
const User               =  require("../../models/userSchema") ; 
const WalletTransaction  =  require("../../models/walletTransaction") ;
const Product            =  require("../../models/product") ;






//GET ORDERS
const  orders   =   async  ( req , res ) => {
    try{
        
        if(!req.session.adminId){ 
            return res.redirect("/admin");
        }

        const page = parseInt(req.query.page) || 1 ;
        const limit = 10 ;
        
        const totalOrders = await Orders.countDocuments() ;
        const skip = ( page-1 ) * limit ; 
        
        const orders = await Orders.find().skip(skip).limit(limit).populate("userId") ; 
        const totalPages = Math.ceil( totalOrders/limit ) ;  

        res.render("backend/admin-dashboard.ejs" ,{ message : '', admin : req.session.adminEmail , 
        partial : "partials/orders" , orders ,  currentPage : page  , totalPages , 
        searchKeyword :"" 
    } ) ; 

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;  
    }
}

 


//ORDER VIEW
const  viewOrder  =  async ( req , res )  =>{
    try{
        if(!req.session.adminId){
            res.redirect("/admin");
        } 
        
        const order = await Orders.findById(req.params.orderId).populate("items.product").populate("shippingAddress") ;
        // Format order date
        const orderDate = new Date(order.createdAt).toLocaleString();
        res.render("backend/admin-dashboard.ejs" ,{message : '',admin : req.session.adminEmail , partial : "partials/viewOrder" , order ,orderDate } ) ; 
        
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;         
    }
}




//UPDATE ORDER STATUS
const  updateOrderStatus  =  async  ( req , res ) =>{
    try{
        const { orderStatus , orderId } = req.body ;
        const savedOrder = await Orders.findByIdAndUpdate( orderId , { orderStatus  });
    
        if(orderStatus == 'cancelled' ){
            //increase the quantity of products in the database . 
       for(let i=0 ; i<savedOrder.items.length ; i++){
        let productId  = savedOrder.items[i].product ; 
        let size = savedOrder.items[i].size ;
        let orderQuantity = savedOrder.items[i].quantity ; 

        // Find the product by its ID
        let product = await Product.findById(productId);

        if (product) {
           // Find the item in the product.items array with the matching size
           let itemToUpdate =  product.sizes.find(item => item.size === size);
  
           if (itemToUpdate) {
              // Decrease the quantity by the order's quantity
              itemToUpdate.quantity += orderQuantity;
  
              // Save the updated product back to the database
              await product.save();
           }
         }
        }

        //add to wallet
        const userId = savedOrder.userId ;
      
        const user = await User.findById(userId) ;  
      
  
        let amountPayable = (savedOrder.paymentMethod != "cash-on-delivery" && savedOrder.paymentStatus === "completed" ) ? savedOrder.totalPrice : 0 ;
        user.walletBalance += (savedOrder.appliedWallet +  amountPayable); 

        let wallet = savedOrder.appliedWallet > 0 ? savedOrder.appliedWallet+amountPayable : false ;  

        const savedUser  =  await user.save();

        //wallet transaction 
        if( (savedOrder.appliedWallet + amountPayable) > 0  ){
   
                 // Create wallet transaction record for the order placement
                 const walletTransaction = new WalletTransaction({
                   userId,
                   amount: savedOrder.appliedWallet + amountPayable , 
                   type: 'credit',
                   description: `Refund for cancel  order ${savedOrder._id}`,
                   balanceAfterTransaction: savedUser.walletBalance 
               });

               await walletTransaction.save() ;  
              
        }
        }
     
        if(savedOrder){
            res.status(200).json({success : true })
        }else{
            res.status(404).json({message : "order not found" })
        }  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;          
    }

}






module.exports  =  { orders , viewOrder , updateOrderStatus  }