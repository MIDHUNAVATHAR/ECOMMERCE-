const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = new Schema({
  title: { type: String, required: true },
  titleDescription: { type: String, required: true },         
  sizes: { type: [
    { 
      size : { type : String , required: true },
      price : { type : Number , required : true },
      quantity : { type : Number , required : true },
      discountedPrice : {type : Number  ,default: function() {
        return this.price; // Sets discountedPrice to the same value as price by default 
      } },
      discountedPercentage : {type : Number , default : 0 } 
    }
  ], required: true }, 
  productDescription: { type: String, required: true },
  highlights: { type: String },
  details: { type: String },
  genderCategory: { type: Schema.Types.ObjectId, ref: 'GenderCategory', required : true },
  productCategory: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required : true } ,   
  images: { type: [String] } ,  
  offer : { type : Number , default : 0  },
  offerExpiry : { type : Date  } , 
  softDelete : {type : Boolean , default : false } , 
  status :{ type : String , default : "avalable" },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'  // Referencing the Review model
  }] 
},{ timestamps : true } ) ;   



// Enable indexing on commonly searched fields
productSchema.index({ title: 1 });
productSchema.index({ genderCategory: 1 });
productSchema.index({ productCategory: 1 });
productSchema.index({ productSubCategory: 1 });


 
module.exports = mongoose.model( 'Product' , productSchema ) ;  