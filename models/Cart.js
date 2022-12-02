const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    //id of the user who put it in the cart and the id of the product
 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // the type of schema should be an array
  // an array with a product id and a number
  products: {
    type: [{product: mongoose.Schema.Types.ObjectId, count: Number, title:String, image: String, cloudinaryId: String, price: Number }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
