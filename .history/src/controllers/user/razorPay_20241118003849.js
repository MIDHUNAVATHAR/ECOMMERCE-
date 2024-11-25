

//IMPORT MODULES
const Razorpay             = require('razorpay');
const crypto               = require('crypto');
const AsyncLock            = require('async-lock');
const axios                = require("axios")




const mongoose             = require("mongoose");


 
//IMPORT SCHEMAS
const Order                = require("../../models/orderSchema") ;
const Cart                 = require("../../models/cartSchema")   ;
const Product              = require("../../models/product")   ;
const User                 = require("../../models/userSchema")   ; 
const  WalletTransaction   = require("../../models/walletTransaction") ;
const Address = require('../../models/addressSchema');


const lock = new AsyncLock();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID ,
    key_secret: process.env.RAZOR_SECRET_ID , 
});



// create an order
const createOrder =  async (req, res) => {
    const { amount, currency  } = req.body;
  
    // Create an order with Razorpay
    const options = {
        amount: amount * 100,  // Amount in paise (smallest unit of currency)
        currency: currency,
        receipt: `receipt_order_${Math.floor(Math.random() * 1000)}` 
    };

  

    try {
        const order = await razorpayInstance.orders.create(options) ; 
       
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId : process.env.RAZOR_KEY_ID , 
        });
        
    } catch (error) {
        res.status(500).send('Something went wrong with order creation');
    }


   
} ;





// Endpoint to verify payment
const verifyPayment =  async (req, res) => {
   
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ;
   
    const secret = process.env.RAZOR_SECRET_ID;   

    const hash = crypto.createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)  
        .digest('hex');

    if (hash === razorpay_signature) {
       // res.send('Payment verified successfully');
       try{
        const {userId , cartId , addressId ,paymentMethod , deliveryCharge } = req.body ;
        const cart = await Cart.findById(cartId) ; 
        const cartItems = await Promise.all(cart.items
          .filter(item => item.status === "Available") // Filter items by status
          .map(async (item) => {
              const itemDiscount = (item.price * item.quantity) - (item.discountedPrice * item.quantity);

              // Fetch the product using the product ID (item.product)
              const product = await Product.findById(item.product).exec();

              // Check if the product was found
              if (!product) {
                  console.error(`Product with ID ${item.product} not found`);
                  return null; // If product is not found, return null or handle it as needed
              }

              // Get the first image URL from the product's images array
              let imageUrl = product.images[0]; // You can customize this to pick the image you want
              let title = product.title;

              // Check if it's a relative URL and prepend the base URL dynamically
              if (!imageUrl.startsWith('http')) {
                  const baseUrl = req.protocol + '://' + req.get('host'); // Dynamically get base URL
                  imageUrl = baseUrl + imageUrl; // Prepend the base URL if relative
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
                  product: item.product._id,
                  title,
                  size: item.size,
                  price: item.discountedPrice,
                  quantity: item.quantity,
                  totalPrice: item.discountedPrice * item.quantity,
                  discount: itemDiscount,
                  image: bufferImage
              };
          })
      );


        const address = await Address.findById(addressId) ; 
      
        // Calculate total price
        const totalProductPrice = cartItems.reduce((total, item) => {
          return total + (item.price * item.quantity) ;
        }, 0);
       
        const newOrder = new Order({
          userId,
          shippingAddress : addressId, 
          address,
          items : cartItems , 
          paymentMethod,
          totalPrice : ((totalProductPrice + parseFloat(deliveryCharge) ) - ( cart.walletBalance + cart.couponBalance)).toFixed(2) ,             
          appliedWallet : cart.walletBalance ,
          appliedCoupon : cart.couponBalance , 
          paymentStatus : "completed" , 
          razorpayOrderId : razorpay_order_id ,                                          
          razorpayPaymentId : razorpay_payment_id ,
          deliveryCharge,
        })
       
        const savedOrder = await newOrder.save() ; 
       
        const  savedUser = await User.findByIdAndUpdate(userId , { coupon : null }) ;



        //WALLET TRANSACTION RECORD
        if( savedOrder.appliedWallet  > 0  ){
    
          // Create wallet transaction record for the order placement
          const walletTransaction = new WalletTransaction({
            userId,
            amount: savedOrder.appliedWallet  ,  
            type: 'debit',
            description: ` Payment for place  order ${savedOrder._id}`,
            balanceAfterTransaction: savedUser.walletBalance 
          });


           await walletTransaction.save() ;  
       
        } ; 


        //delete the existing cart after the successfull order place
        await Cart.findByIdAndDelete( cartId ) ; 
 
 //decrease the quantity of products in the database . 
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
      itemToUpdate.quantity -= orderQuantity;

      // Ensure quantity doesn't go below 0
      if (itemToUpdate.quantity < 0) {
        itemToUpdate.quantity = 0 ;  
      }

      // Save the updated product back to the database
      await product.save();
  }}}


      res.status(200).json({ status : true , orderId : savedOrder._id}) ; 
     }catch(err){
      console.log(err)
        res.status(500).json({ status : false }) ; 
     }
 } else {                                                 
    // res.status(400).send( 'Payment verification failed' ) ;  
    res.status(500).json({ status : false , message : "Payment Verification Failed" }) ;       
 }
} ;








const paymentFailed = async (req, res) => {
    const {
      error_code, error_description, error_source, error_reason,
      razorpay_order_id, razorpay_payment_id, userId, cartId, addressId, paymentMethod
    } = req.body;
  
    lock.acquire(razorpay_order_id, async (done) => {

    try {      

      const cart = await Cart.findById(cartId);  

  
      // Check if cart exists
      if (!cart) { 
        return res.status(404).json({ status: false, error: 'Cart not found' });
      }
  
      const cartItems = await Promise.all(cart.items
        .filter(item => item.status === "Available")   // Filter available items
        .map(async (item) => {
            const itemDiscount = (item.price * item.quantity) - (item.discountedPrice * item.quantity);

            // Fetch the product using the product ID (item.product)
            const product = await Product.findById(item.product).exec();

            // Check if the product was found
            if (!product) {
                console.error(`Product with ID ${item.product} not found`);
                return null; // If product is not found, return null
            }

            // Get the first image URL from the product's images array
            let imageUrl = product.images[0]; // You can customize this to pick the image you want
            let title = product.title;

            // Check if it's a relative URL and prepend the base URL dynamically
            if (!imageUrl.startsWith('http')) {
                const baseUrl = req.protocol + '://' + req.get('host'); // Dynamically get base URL
                imageUrl = baseUrl + imageUrl; // Prepend the base URL if relative
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
                product: item.product._id,
                title,
                size: item.size,
                price: item.discountedPrice,
                quantity: item.quantity,
                totalPrice: item.discountedPrice * item.quantity,
                discount: itemDiscount,
                image: bufferImage
            };
        })
    );

      // Calculate total price
      const totalProductPrice = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const address = 
  
      // Create the order with paymentStatus: "failed"
      const newOrder = new Order({
        userId,
        shippingAddress: addressId,
        items: cartItems,
        paymentMethod,
        totalPrice: totalProductPrice - cart.walletBalance - cart.couponBalance,
        appliedWallet: cart.walletBalance,
        appliedCoupon: cart.couponBalance,
        paymentStatus: "failed",  // Mark the payment status as failed
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,  
      });
  
      // Save the order
      let savedOrder = await newOrder.save();
  
      // DElETE THE CART
      await Cart.findByIdAndDelete(cartId); 
  
      // Decrease the quantity of products in the database
      for (let i = 0; i < savedOrder.items.length; i++) {
        let productId = savedOrder.items[i].product ;
        let size = savedOrder.items[i].size;
        let orderQuantity = savedOrder.items[i].quantity;
  
        // Find the product by its ID
        let product = await Product.findById(productId) ;  
  
        if (product) {
          // Find the item in the product.sizes array with the matching size
          let itemToUpdate = product.sizes.find(item => item.size === size);
  
          if (itemToUpdate) {
            // Decrease the quantity by the order's quantity
            itemToUpdate.quantity -= orderQuantity;
  
            // Ensure quantity doesn't go below 0
            if (itemToUpdate.quantity < 0) {
              itemToUpdate.quantity = 0;
            }
  
            // Save the updated product back to the database
            await product.save() ;      
          }
        }
      } 
  

      // All operations succeeded, send the response
      res.status(200).json({ status: true, orderId : savedOrder._id }) ; 
    
  
    } catch (err) {
      console.error('Error creating order after payment failure:', err ) ;  
       // Ensure that only one response is sent
       res.status(500).json({ status: false, error: 'Order creation failed after payment failure' });
     }
    
    })

  };
  








const continuePayment = async (req, res) => {
  const { amount, currency  } = req.body;

 
  
  // Create an order with Razorpay
  const options = {
      amount: amount * 100,  // Amount in paise (smallest unit of currency)
      currency: currency,
      receipt: `receipt_order_${Math.floor(Math.random() * 1000)}` 
  };

  try {
      const order = await razorpayInstance.orders.create(options);
     
      res.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId : process.env.RAZOR_KEY_ID
      });
      
  } catch (error) {
      res.status(500).send('Something went wrong with order creation') ; 
  }


};




const continueVerifyPayment = async ( req ,res ) =>{ 
 
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature ,orderid , userId } = req.body ;
   
  const secret = process.env.RAZOR_SECRET_ID;   

  const hash = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)  
      .digest('hex');
     
  if (hash === razorpay_signature) {
        
     try{
     
      const order = await Order.findById( orderid ) ; 
    
      order.razorpayOrderId = razorpay_order_id    ; 
      order.razorpayPaymentId =  razorpay_payment_id ;  
      order.paymentStatus = "completed" ;               
     
      const savedOrder = await order.save() ; 
      
      const user       = await User.findById(savedOrder.userId)
      
    
     // wallet transaction
      if( savedOrder.appliedWallet  > 0  ){
    
        // Create wallet transaction record for the order placement
        const walletTransaction = new WalletTransaction({
          userId : savedOrder.userId ,
          amount: savedOrder.appliedWallet  ,  
          type: 'debit',
          description: ` Payment for place  order ${savedOrder._id}`,
          balanceAfterTransaction: user.walletBalance  
        });


         await walletTransaction.save() ;  
     
      } ;  

    
     
      res.status(200).json({ status : true , orderId : savedOrder._id}) ; 
    }catch(err){
      res.status(500).json({ status : false }) ; 
    } 
  
     

}else{
  res.status(400).send( 'Payment verification failed' ) ; 
}
}










module.exports = { createOrder , verifyPayment , paymentFailed , continuePayment , continueVerifyPayment  } ; 
