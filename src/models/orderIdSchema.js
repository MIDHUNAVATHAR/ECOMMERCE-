const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, required: true  },
});


// `pre-save` hook to ensure initialization
// `pre-save` hook to ensure initialization of sequence_value
counterSchema.pre('save', async function(next) {
    // Check if it's a new document and the _id is 'order'
    if (this.isNew && this._id === 'order') {
      // Set the sequence_value to 1000 if it hasn't been initialized yet
      if (this.sequence_value === undefined || this.sequence_value === null) {
        this.sequence_value = 1000;  // Initialize with 1000
      }
    }
    next();  // Continue with the save operation
  });
  


  const Counter = mongoose.model('Counter', counterSchema ) ;  
  
  module.exports = Counter;
  