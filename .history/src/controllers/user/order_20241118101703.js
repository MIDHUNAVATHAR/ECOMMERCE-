

//import modules
const PDFDocument        =  require('pdfkit');
const axios              =  require("axios");


//import schemas
const Product            =  require("../../models/product")  ;
const Logo               =  require("../../models/logoSchema") ;
const GenderCategory     =  require("../../models/genderCategory") ;
const User               =  require("../../models/userSchema") ;
const Cart               =  require("../../models/cartSchema") ;
const Order              =  require("../../models/orderSchema") ;
const Review             =  require("../../models/reviewSchema") ;
const WalletTransaction  =  require("../../models/walletTransaction") ;
const Address            =  require("../../models/addressSchema") ;




//POST PLACE-ORDER - CASH-ON-DELIVERY
const  placeorder  =  async  ( req , res )  =>{
    try{
      
        const {userId , cartId , addressId ,paymentMethod ,deliveryCharge , amount  } = req.body ; 
        const cart = await Cart.findById(cartId);
        
        const cartItems = await Promise.all(cart.items 
        .filter( item => item.status === "Available") // filter items by status
        .map( async  (item )=>{
         
          const itemDiscount = (item.price * item.quantity) - (item.discountedPrice * item.quantity);
          

          // Fetch the product using the product ID (item.product)
    const product = await Product.findById(item.product).exec();

    // Check if the product was found
    if (!product) {
      console.error(`Product with ID ${item.product} not found`);
      return null;  // If product is not found, return null or handle it as needed
    }

    // Get the first image URL from the product's images array
    let imageUrl = product.images[0];  // You can customize this to pick the image you want
    let title    = product.title ;

     // Check if it's a relative URL and prepend the base URL dynamically
     if (!imageUrl.startsWith('http')) {
      const baseUrl = req.protocol + '://' + req.get('host');  // Dynamically get base URL
      imageUrl = baseUrl + imageUrl;  // Prepend the base URL if relative
    }

    // Initialize bufferImage to store the image buffer
    let bufferImage = null;

    try {
      // Fetch the image and convert it to a buffer
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      bufferImage = Buffer.from(response.data, 'binary');
    } catch (error) {
      console.error("Error downloading image:", error);
    }


      
          return {
          product : item.product._id ,
          title , 
          size : item.size ,
          price : item.discountedPrice ,
          quantity : item.quantity ,
          totalPrice : item.discountedPrice * item.quantity ,
          discount :itemDiscount ,  
          image :  bufferImage 
        }
        })

        )

    
        
      
      
        // Calculate total price
        const productsPrice = cartItems.reduce((total, item) => {
          return total + (item.price * item.quantity) ;
        }, 0);
      
      
        //calculate total discount
        const totalDiscount = cartItems.reduce((total, item) => {
          return total + (item.discount) ;
        }, 0); 
        console.log(totalDiscount)
        const address = await Address.findById(addressId)
        
       
        const newOrder = new Order({
          userId,
          shippingAddress : addressId,
          address,
          items : cartItems , 
          paymentMethod,
         // totalPrice : (productsPrice + parseFloat(deliveryCharge) ) - (cart.walletBalance + cart.couponBalance ) , 
          totalPrice : parseInt(amount) ,
          appliedWallet : cart.walletBalance ,
          appliedCoupon : cart.couponBalance , 
          totalDiscount ,
          deliveryCharge : parseFloat(deliveryCharge),
        })
      

        const savedOrder = await newOrder.save() ; 
      
       

        // wallet transaction
        if ( cart.walletBalance > 0 ) {
          const user = await User.findById(userId);
          
            // Create wallet transaction record for the order placement
            const walletTransaction = new WalletTransaction({
                userId ,
                amount: cart.walletBalance ,
                type: 'debit' ,
                description: `Payment for placed order ${savedOrder._id}` ,
                balanceAfterTransaction : user.walletBalance  
            });

            await walletTransaction.save() ; 
        }
        

        await User.findByIdAndUpdate( userId , { coupon : null } ) ; 
        //delete the existing cart after the successfull order place 
        await Cart.findByIdAndDelete( cartId ) ; 
      


        //decrease the quantity of products in the database 
        for(let i=0 ; i<savedOrder.items.length ; i++){
          let productId  = savedOrder.items[i].product ; 
          let size = savedOrder.items[i].size ;
          let orderQuantity = savedOrder.items[i].quantity ; 
      
          // Find the product by its ID
        let product = await Product.findById(productId);
      
        if (product) {
          // Find the item in the product.items array with the matching size
          let itemToUpdate =  product.sizes.find(item => item.size === size) ;  
      
          if (itemToUpdate) {
            // Decrease the quantity by the order's quantity
            itemToUpdate.quantity -= orderQuantity ;
      
            // Ensure quantity doesn't go below 0
            if (itemToUpdate.quantity < 0) {
              itemToUpdate.quantity = 0;
            }
      
            // Save the updated product back to the database
            await product.save();
        }}}
      
        
      
          res.status(200).json({ status : true , orderId : savedOrder._id}) ; 
    }catch(err){
        console.error(err);
        res.status(500).render("frontend/404");  
    }
}




//GET ORDERS PAGE
const  myOrders  =  async  ( req , res ) => {
  try{
    const logo = await Logo.findOne().sort({ updatedAt : -1 }) ; 
    const genderCategory = await GenderCategory.find({ softDelete : false }) ;  

    const userId = req.session.user ? req.session.user.id  : "" || req.session.passport ? req.session.passport.user : "" ; 
      const user = await User.findById( userId ) ; // assuming user is authenticated and stored in session

    let cartTotal ; 
         if(user){
         const cart = await Cart.findOne({user : user._id});
         if(cart){
          cartTotal = cart.items.reduce((total, item) => total + item.quantity, 0 ) ; 
         }
         }else{ 
         cartTotal = 0 ; 
         }

    //const orderStatus = req.query.orderStatus || "" ;  

 
    const currentYear = new Date().getFullYear();
    const years = [];
     for (let i = 0; i <= 3; i++) {
         years.push(currentYear - i);
     } 


  

    const orderTime = req.query.orderTime || "";
    const orderStatus = req.query.orderStatus || "";
        
    const currentDate = new Date();
    let startDate;
    let endDate;

    // Determine the start and end dates based on orderTime parameter
    if (orderTime === "30day") {
        startDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
        endDate = new Date();
    } else if (orderTime === "older") {
        startDate = new Date(0); // Beginning of time
        endDate = currentDate; // Current date
    } else if (!isNaN(orderTime) && Number(orderTime) > 1900) { // Check if orderTime is a valid year
        const year = Number(orderTime);
        startDate = new Date(`${year}-01-01`); // Start of the year
        endDate = new Date(`${year + 1}-01-01`); // Start of the next year (exclusive)
    }


     // Fetch orders based on orderTime filtering
     let orders ;
     let query = { userId : user._id } ;

     // Apply order status filter if provided
     if (orderStatus) {
         query.orderStatus = orderStatus;
     }

     // Apply date filtering if startDate and endDate are set
     if (startDate && endDate) {
         query.createdAt = { $gte: startDate, $lt: endDate }; // MongoDB query for date range
     }



    if (!orderStatus) {
     orders = await Order.find(query).sort({ createdAt: -1 }).populate("items.product");
    } else {
     orders = await Order.find(query).sort({ createdAt: -1 }).populate("items.product");
    } 

 
    res.render("frontend/orders" , { orders  , logo , genderCategory ,user , userId , years , orderStatus , orderTime : "" , cartTotal } );  
  }catch(err){
    console.error(err);
    res.status(500).render("frontend/404");  
  }
}



//GET  VIEW ORDER
const viewOrder  =  async  ( req , res ) => {
  try{
    const logo = await Logo.findOne().sort({ updatedAt : -1 }) ; 
    const genderCategory = await GenderCategory.find({ softDelete : false});
    const order = await Order.findById(req.params.orderId).populate("shippingAddress").populate("items.product");
  
    // Format order date
    const orderDate = new Date(order.createdAt).toLocaleString() ; 
  
    let user ;   
    if(req.session.userId){
      user = await User.findById(req.session.userId) ;  
    }else if(req.user){
      user = await User.findById( req.user._id ) ;  
    }else{
      return res.redirect("/userLogin") ;   
    }
  
    let cartTotal ; 
       if(user){
       const cart = await Cart.findOne({user : user._id});
       if(cart){
        cartTotal = cart.items.reduce((total, item) => total + item.quantity , 0); 
       } 
       }else{
       cartTotal = 0 ;
       }
    
    res.render("frontend/viewOrder.ejs" , { logo , genderCategory , user ,u :user._id , order , orderDate , cartTotal }) ; 
  }catch(err){
    console.error(err);
    res.status(500).render("frontend/404");  
  }
}




//CANCEL ORDER
const  cancelOrder  =  async  ( req , res ) =>{
  try{

       const orderId = req.body.id ;
    
       const savedOrder = await Order.findByIdAndUpdate(orderId, {
          orderStatus: "cancelled",
       });


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
         const userId = req.session.userId ||  req.user._id ; 
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
 
         res.status(200).json({ status : true , wallet  });  

  }catch(err){
    console.error(err);
    res.status(500).render("frontend/404");  
  }
  
} 




//POST  SUBMIT REVIEW
const submitReview  =  async  ( req , res ) =>{
  try{
    const { productId , rating , comment } = req.body;
  
    // Assuming user is authenticated, get user ID
    const userId =  req.session.userId || req.user.id ;

    // Create a new review
    const newReview = new Review({
      user: userId,
      product: productId,
      rating,
      comment
    });

    // Save the review
    const savedReview = await newReview.save();

    // Update the product with the new review
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: savedReview._id }
    });

    res.status(200).json({ success: true, message: 'Review added successfully!' });  
  }catch(err){
    console.error(err);
    res.status(500).render("frontend/404");  
  }
}






//INVOICE
const generateOrderPDF = async (req, res) => {
  try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId).populate('items.product').populate("shippingAddress");
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=order-${orderId}.pdf`);

      doc.pipe(res);

      // Header
      doc
          .fontSize(26)
          .fillColor('#1F618D')
          .text('Order Summary', { align: 'center', underline: true })
          .moveDown(1.5);

      // Order Details
      doc
          .fontSize(14)
          .fillColor('black')
          .text(`Order ID: ${order._id}`)
          .moveDown(0.5)
          .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
          .moveDown(0.5)
          .text(`Order Status: ${order.orderStatus}`)
          .moveDown(0.5)
          .text(`Payment Method: ${order.paymentMethod}`)
          .moveDown(0.5)
          .text(`Payment Status: ${order.paymentStatus}`)
          .moveDown(1.5);

      // Shipping Address
      doc
          .fontSize(18)
          .fillColor('#1F618D')
          .text('Shipping Address', { underline: true })
          .moveDown(1)
          .fontSize(14)
          .fillColor('black')
          .text(order.shippingAddress.address)
          .moveDown(0.5)
          .text(order.shippingAddress.landmark || '')
          .moveDown(0.5)
          .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`)
          .moveDown(0.5)
          .text(`Phone: ${order.shippingAddress.phone}`)
          .moveDown(0.5)
          .text(`Address Type: ${order.shippingAddress.addresstype}`)
          .moveDown(1.5);

      // Items Table
      doc
          .fontSize(18)
          .fillColor('#1F618D')
          .text('Items Purchased', { underline: true })
          .moveDown(1);

      // Table headers
      const tableTop = doc.y;
      const itemX = 50;
      const sizeX = 200;
      const qtyX = 280;
      const priceX = 350;
      const totalX = 450;

      doc
          .fontSize(12)
          .fillColor('black')
          .text('Product', itemX, tableTop)
          .text('Size', sizeX, tableTop)
          .text('Qty', qtyX, tableTop)
          .text('Price', priceX, tableTop)
          .text('Total', totalX, tableTop)
          .moveTo(50, tableTop + 15)
          .lineTo(550, tableTop + 15)
          .stroke();

      // Table rows
      let yPosition = tableTop + 25;
      order.items.forEach(item => {
          if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
          }

          doc
              .fontSize(12)
              .text(item.product.title, itemX, yPosition)
              .text(item.size, sizeX, yPosition)
              .text(item.quantity.toString(), qtyX, yPosition)
              .text(`₹${item.price}`, priceX, yPosition)
              .text(`₹${item.totalPrice}`, totalX, yPosition)
              .moveTo(50, yPosition + 15)
              .lineTo(550, yPosition + 15)
              .stroke();

          yPosition += 25;
      });

      // Coupon and Wallet Deductions
      if (order.appliedCoupon > 0) {
          doc
              .fontSize(14)
              .fillColor('black')
              .text(`Coupon Deduction: ₹${order.appliedCoupon}`, 50, yPosition + 10)
              .moveDown(0.5);
          yPosition += 20; // Adjust for next item
      }

      if (order.appliedWallet > 0) {
          doc
              .fontSize(14)
              .fillColor('black')
              .text(`Wallet Deduction: ₹${order.appliedWallet}`, 50, yPosition + 10)
              .moveDown(0.5);
          yPosition += 20; // Adjust for next item
      }

      // Total amount after deductions
      const finalAmount = order.totalPrice ;
      doc
          .fontSize(16)
          .fillColor('black')
          .text(`Total Amount: ₹${finalAmount}`, 50, yPosition + 30, { align: 'right' })
          .moveDown(2);

      // Footer
      doc
          .fontSize(12)
          .fillColor('gray')
          .text('Thank you for your order!', { align: 'center' })
          .moveDown(1)
          .fontSize(10)
          .fillColor('gray')
          .text('This invoice was generated automatically.', { align: 'center' });

      doc.end();
  } catch (error) {
      console.error('Error generating PDF:', error);
  }
}





module.exports  =  {
   placeorder ,
   myOrders ,
   viewOrder ,
   cancelOrder , 
   submitReview ,
   generateOrderPDF , 
} ; 