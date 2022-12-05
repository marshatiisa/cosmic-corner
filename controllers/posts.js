const mongoose = require('mongoose');
const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
//const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51MBOVTGKbr0ibXoEiCA4hUTx8oQ7vvNRiDb1ue8lfKWiSGxkJO5YJIElzQph4Wo46RexGvhVRe1Y9MdOCtFuioaK00pq1cSC4d');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const products = await Product.find();
      const cart = await CartItem.find();
      //const cartItems = await CartItem.find({user: req.user.id})
      // do a map reduce to count the number of items in the cart
      //const totalItems = cartItems.reduce((acc, cartItem) => acc + cartItem.products, 0);
      let totalCount = 0
          for(let i=0;i<cart.length;i++){
            totalCount += cart[i].count
          }
      res.render("profile.ejs", { products: products, user: req.user, cartSize: totalCount }); //cartSize: cartItems.length
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
  getCheckout: async (req, res) => {
    try {
      const cart = await CartItem.find({user : req.user._id});
     // console.log(cart, 'is this cart showing up')
      let totalPrice = 0
          for(let i=0;i<cart.length; i++){
            totalPrice += cart[i].extension
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

  createCheckoutSession: async (req, res) => {
    // console.log(stripe, 'checking what this contains')
    const cart = await CartItem.find({user : req.user._id});
    try {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:9000");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", true);
  console.log(cart, 'will this cart execute?')
      let stripeProduct = [];
      for (let i = 0; i < cart.length; i++) {
        let product = await stripe.products.create({ name: `${cart[i].title}` });
        stripeProduct.push({
          product,
          quantity: cart[i].count,
          price: cart[i].price
        });
        console.log(stripeProduct, 'hows this array looking')
      }
      const lineItems = [];
      for (let j = 0; j < stripeProduct.length; j++) {
        let stripePrice = await stripe.prices.create({
          product: stripeProduct[j].product.id,
          unit_amount: stripeProduct[j].price,
          currency: "usd"
        });
        lineItems.push({
          price: stripePrice.id,
          quantity: stripeProduct[j].count
        });
        console.log(stripePrice, 'looking for price')
      }
  
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `http://localhost:9000/thankyou/`,
        cancel_url: `http://localhost:9000/nope/`
      });
  
      res.send(session.url);
    } catch (err) {
      res.send(err);
    }
  },


 // add search keywords to a database and have an image returned for certain keywords otw return a string that says nothing found for your search

};
