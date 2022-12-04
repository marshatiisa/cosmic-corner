const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    //id of the user who put it in the cart and the id of the product
 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
     count: Number,
      title:String, 
      image: String, 
      cloudinaryId: String, 
      price: Number,
     extension: Number //price * quantity
  
});

module.exports = mongoose.model("CartItem", CartItemSchema);
