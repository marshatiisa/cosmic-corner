const mongoose = require('mongoose');
const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
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
  
  // need to define products, see if it appears in database, maybe make an array of products to display.. the pics are in the public folder and use the drinks code to see how to position code
  getProducts: async (req, res) => {
    //add products to database
    try {
      // let products = [
      //   {src:"imgs/birds.jpeg", name:'Birds Poster', price:50},
      //   {src:"imgs/coat.jpeg", name:'Coat with everything', price:50},
      //   {src:"imgs/djparty.jpeg", name:'Party', price:40},
      //   {src:"imgs/fishing.jpeg", name:'Fishing', price:50},
      //   {src:"imgs/hand.jpeg", name:'Hand', price:100},
      //   {src:"imgs/painting.jpeg",name:'Painting', price:45},
      //   {src:"imgs/retro.jpeg", name:'Retro', price:45},
      //   {src:"imgs/supernova.jpeg", name:'Supernova', price:35},
        
      // ]
       const products = await Product.find();
       console.log(products)
      res.render("products.ejs", { user: req.user, products: products });
    } catch (err) {
      console.log(err);
    }
  },
  getCart: async (req, res) => {
    try {
      const cart = await Cart.findOne({user: req.user.id});
      console.log('cart',cart)
      res.render("cart.ejs", { cart: cart, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getCheckout: async (req, res) => {
    try {
      const cart = await Cart.findOne({user : req.user._id});
      let totalPrice = 0
          for(let i=0;i<cart.products.length; i++){
            totalPrice += cart.products[i].price
          }
      console.log('cart testing',cart)
      res.render("checkout.ejs", {user: req.user, cart: cart, totalPrice: totalPrice});
    } catch (err) {
      console.log(err);
    }
  },
  // if there isn't a cart that exists, we need to create one
  // if the cart exists but doesn't have any of this item, we need to add an entry with this item and a count of 1
  //if the cart already exists and has this item in it, increment the count
  //upsert, addtoset operator
  addToCart: async (req, res) => {
    try {
      const product = await Product.findById({_id: req.body.productId});
      const cart = await Cart.findOne({user: req.user.id});
// at this point, we dont know the contents of the cart.. we cant tell if it will empty, have one or two etc products
      console.log(product)
      const query = {user: req.user.id}
  //
  //input - product and cart
  //output - the cart with an update which will go back to be saved in the database (modified version)
  //there is always an update in the collection
 // update should happen only if the cart needs a count increment otw count will stay 1
      const update = {$addToSet: {products: {product: product._id, title: product.title, image: product.image, cloudinaryId: product.cloudinaryId, price: product.price, count: 1}}, user: req.user.id} // from the cart schema
      const options = {upsert: true}

      await Cart.updateOne(query, update, options)
      
      console.log("Item has been added!");
      res.redirect("/cart");
    } catch (err) {
      console.log(err);
    }
  },
  
  deleteFromCart: async (req, res) => {
    try {
      // Find product by id
      let cart = await Cart.findOne({ user: req.user._id});
      // Delete image from cloudinary
      // await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete product from the array - use a loop
      //break stops the for loop
      const productId = req.params.productId
      for(let i=0; i<cart.products.length; i++){
        if(productId === cart.products[i].product.toString()){
          cart.products.splice(i,1)
          break
        }
      }
        cart.save()
      console.log('checking this',cart)
      console.log("Deleted product from cart", productId);
      res.redirect("/cart");
    } catch (err) {
      console.log('checking error', err)
      res.redirect("/profile");
    }
  },

  // add search keywords to a database and have an image returned for certain keywords otw return a string that says nothing found for your search
};
