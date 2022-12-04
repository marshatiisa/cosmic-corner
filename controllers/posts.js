const mongoose = require('mongoose');
const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
//const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");


module.exports = {
  getProfile: async (req, res) => {
    try {
      const products = await Product.find();
      const cartItems = await CartItem.find({user: req.user.id})
      // do a map reduce to count the number of items in the cart
      //const totalItems = cartItems.reduce((acc, cartItem) => acc + cartItem.products, 0);
      res.render("profile.ejs", { products: products, user: req.user, cartSize: cartItems.length, }); // totalItems: totalItems.length });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  
  
  getProducts: async (req, res) => {
    try {
       const products = await Product.find();
       console.log(products)
      res.render("products.ejs", { user: req.user, products: products });
    } catch (err) {
      console.log(err);
    }
  },
  getCart: async (req, res) => {
    try {
      const cart = await CartItem.find({user: req.user.id});
      console.log('cart',cart)
      res.render("cart.ejs", { cart: cart, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  //fix the checkout asap
  getCheckout: async (req, res) => {
    try {
      const cart = await CartItem.find({user : req.user._id});
     // console.log(cart, 'is this cart showing up')
      let totalPrice = 0
          for(let i=0;i<cart.length; i++){
            totalPrice += cart[i].price
          }
          let totalCount = 0
          for(let i=0;i<cart.length;i++){
            totalCount= cart[i].count
          }
      console.log('cart testing',cart)
      res.render("checkout.ejs", {user: req.user, cart: cart, totalPrice: totalPrice, count: totalCount});
    } catch (err) {
      console.log(err);
    }
  },
  // if there isn't a cart that exists, we need to create one
  // if the cart exists but doesn't have any of this item, we need to add an entry with this item and a count of 1
  //if the cart already exists and has this item in it, increment the count
  //upsert, addtoset operator
//   addToCart: async (req, res) => {
//     try {
//       const product = await Product.findById({_id: req.body.productId});
//       const cart = await Cart.findOne({user: req.user.id});
// // at this point, we dont know the contents of the cart.. we cant tell if it will empty, have one or two etc products
//       console.log(product)
//       const query = {user: req.user.id}
//       const update = {$addToSet: {products: {product: product._id, title: product.title, image: product.image, cloudinaryId: product.cloudinaryId, price: product.price, count: 1}}, user: req.user.id} // from the cart schema
//       const options = {upsert: true}

//       await Cart.updateOne(query, update, options)
      
//       console.log("Item has been added!");
//       res.redirect("/cart");
//     } catch (err) {
//       console.log(err);
//     }
//   },
  addToCart: async (req, res) => {
    try {
      const product = await Product.findById({_id: req.body.productId});
      await CartItem.findOneAndUpdate({user: req.user.id, product: product._id}, //first arg is the filter
         {title: product.title, image: product.image, cloudinaryId: product.CloudinaryId, price: product.price,
          $inc: {count: 1, extension: product.price} // adding 1 to count and adding product.price to extension
        }, {upsert: true} //if it doesnt exist create it, if it does hand back it to me
        )
      console.log("Item has been added!");
      res.redirect("/cart");
    } catch (err) {
      console.log(err);
    }
  },
  
  deleteFromCart: async (req, res) => {
    try {
      // Find product by id
      // let cart = await Cart.findOne({ user: req.user._id});
      // Delete image from cloudinary
      // await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete product from the array - use a loop
      //break stops the for loop
      // const productId = req.params.productId
      // for(let i=0; i<cart.products.length; i++){
      //   if(productId === cart.products[i].product.toString()){
      //     cart.products.splice(i,1)
      //     break
      //   }
      // }
        // cart.save()

        const product = await Product.findById({_id: req.params.productId});
        const deletedProduct = await CartItem.findOneAndUpdate({user: req.user.id, product: req.params.productId }, 
         {$inc: {count: -1, extension: -product.price}} ,
          {returnOriginal: false} //gives you the doc after the changes have been applied 
        )
      console.log("Deleted product from cart",product._id);
      console.log(deletedProduct.count, 'count check')

      if(deletedProduct.count < 1){
        await CartItem.deleteOne({_id: deletedProduct._id})
        console.log('deleted from database')
      }
      res.redirect("/cart");
    } catch (err) {
      console.log('checking error', err)
      res.redirect("/profile");
    }
  },

  // add search keywords to a database and have an image returned for certain keywords otw return a string that says nothing found for your search
};
