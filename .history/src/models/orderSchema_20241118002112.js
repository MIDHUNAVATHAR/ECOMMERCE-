const mongoose = require('mongoose') ; 
const Schema = mongoose.Schema;

// Order Schema
const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId , 
    ref: 'User',
    required: true
  },
  shippingAddress: {
   type: Schema.Types.ObjectId , 
   ref : "Address" ,
   required : true , 
  },
  address : {
    name : { type : String },
    phone : { type : Number },
    address :{type : String  },
    city : { type : String },
    state : { type : String } ,
    picode : {type :Number },
    landmark : {type : String } ,
    alternatePhone : { type : Number },
    addresstype : { type : String },
  },
  items : [{
      product: {
        type: Schema.Types.ObjectId ,
        ref: 'Product' , 
        required: true ,
      },
      title : { }
      size: {
        type: String,
        required: true  
      },
      price: { 
        type: Number,
        required: true,
      },
      totalPrice:{
        type : Number,
        required : true
      },
      quantity: {
        type: Number,
        required: true,
      }, 
      image: { type: Buffer }  
  }],
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: [ 'pending' , 'completed' , 'failed' ] ,
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  appliedWallet:{ type : Number , default : 0 } ,
  appliedCoupon:{ type : Number , default : 0 } ,
  totalDiscount  : { type : Number , default : 0 } ,
  orderStatus: {
    type: String, 
    enum: [ 'pending' , 'shipped' , 'delivered' , 'cancelled' ] , 
    default: 'pending'
  },
  deliveryDate: {
    type: Date , 
  },
  razorpayOrderId: {
    type: String,  // Stores only the Razorpay Order ID
  },
  razorpayPaymentId :{
    type : String ,
  },
  deliveryCharge : {
    type : Number , default : 0,
  },
  returnRequested :{ type : Boolean , default : false }
} , { timestamps : true } ) ;  


module.exports = mongoose.model( 'Order' , orderSchema ) ;
 