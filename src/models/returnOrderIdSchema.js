const mongoose = require('mongoose');


const returnCounterSchema = new mongoose.Schema({
  currentReturnOrderID: {
    type: Number,
    required: true,
    default: 1000, // Start with 1000
},
});



const returnCounter = mongoose.model( 'ReturnCounter' , returnCounterSchema ) ;  
  
module.exports = returnCounter ;

