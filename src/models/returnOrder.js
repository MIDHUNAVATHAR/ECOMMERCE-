

const mongoose  =  require('mongoose');
const Schema    =  mongoose.Schema;

const returnOrderSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    returnOrderId : {
        type : Number ,
        default : 1000
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        }
    }],
    reason: {
        type: String,
        required: true,
        enum: ['wrong_size', 'defective', 'not_as_described', 'changed_mind']
    },
    totalRefundAmount: {
        type: Number,
        required: true
    },
    returnStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending' 
    },
    adminNote: {
        type: String
    },
    refundId: {
        type: String 
    },
    refundStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    pickupDate: {
        type: Date
    },
    pickupAddress: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    }
}, { timestamps: true });



//enable indexing
returnOrderSchema.index({ orderId: 1 });
returnOrderSchema.index({ userId: 1 });
returnOrderSchema.index({ returnStatus: 1 }); 




const ReturnOrder = mongoose.model('ReturnOrder', returnOrderSchema);
module.exports = ReturnOrder ;