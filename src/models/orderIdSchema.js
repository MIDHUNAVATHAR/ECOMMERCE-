const mongoose = require('mongoose');


const counterSchema = new mongoose.Schema({
  currentOrderID: {
    type: Number,
    required: true,
    default: 1000, // Start with 1000
},
});



const Counter = mongoose.model('Counter', counterSchema ) ;  
  
module.exports = Counter;
   