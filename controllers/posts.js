const mongoose = require('mongoose');
const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
//const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY);

module.exports = {
  getProfile: async (req, res) => {
    console.log('mode:', req.mode)
    try {
      let products = await Product.find();
      if(req.query.search){
        products = products.filter(product => product.title.toLowerCase().includes(req.query.search.toLowerCase()))
      }
      const cart = await CartItem.find();
      //const cartItems = await CartItem.find({user: req.user.id})
      // do a map reduce to count the number of items in the cart
      //const totalItems = cartItems.reduce((acc, cartItem) => acc + cartItem.products, 0);
      let totalCount = 0
          for(let i=0;i<cart.length;i++){
            totalCount += cart[i].count
          }
      res.render("profile.ejs", { products: products, user: req.user, cartSize: totalCount, search: req.query.search}); //cartSize: cartItems.length
    } catch (err) {
      console.log(err);
    }
  },
  changeMode: async (req, res) => {
    req.mode = req.params.mode
    res.send(req.mode)
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
    let products = await Product.find();
    if (req.query.search) {
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(req.query.search.toLowerCase())
      );
    }
    const cart = await CartItem.find({ user: req.user.id }); // Filter cart items for the logged-in user
    let totalCount = 0;
    for (let i = 0; i < cart.length; i++) {
      totalCount += cart[i].count;
    }
    console.log(products);
    res.render("products.ejs", {
      user: req.user,
      products: products,
      search: req.query.search,
      cartSize: totalCount,
    });
  } catch (err) {
    console.log(err);
  }
},

  getCart: async (req, res) => {
    try {
      // throw(new Error('Cart not available'))
      const cart = await CartItem.find({user: req.user.id});
      let totalCount = 0
      let totalPrice = 0
          for(let i=0;i<cart.length;i++){
            totalCount += cart[i].count
            totalPrice += cart[i].extension
          }
      console.log('cart',cart)
      res.render("cart.ejs", { cart: cart, user: req.user, totalPrice: totalPrice, cartSize: totalCount});
    } catch (err) {
      console.log('error trying to get cart', err);
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
      res.redirect("/cart");
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
      res.redirect("/products");
    } catch (err) {
      console.log(err);
      res.redirect("/products");
    }
  },
  addFromCart: async (req, res) => {
    try {
      const product = await Product.findById({ _id: req.params.productId });
      const existingCartItem = await CartItem.findOneAndUpdate(
        { user: req.user.id, product: req.params.productId },
        { $inc: { count: 1, extension: product.price } },
        { upsert: true, returnOriginal: false }
      );

      console.log("Added product to cart", product._id);
      console.log(existingCartItem.count, "count check");

      res.redirect("/cart");
    } catch (err) {
      console.log("checking error", err);
      res.redirect("/cart");
    }
  },
  deleteFromCart: async (req, res) => {
    try {
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
      res.redirect("/cart");
    }
  },
  emptyCart: async (req, res) => {
    try {
      // Delete all items in the user's cart
      await CartItem.deleteMany({ user: req.user.id });

      res.redirect("/cart");
    } catch (err) {
      console.log('checking error', err);
      res.redirect("/cart");
    }
  },

  createCheckoutSession: async (req, res) => {
    // console.log(stripe, 'checking what this contains')
    const cart = await CartItem.find({user : req.user._id});
    try {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
      res.setHeader("Access-Control-Allow-Credentials", true);
  console.log(cart, 'will this cart execute?')
      let stripeProduct = [];
      const lineItems = [];

      for (let i = 0; i < cart.length; i++) {
        let product = await stripe.products.create({ name: `${cart[i].title}` });
        let price = await stripe.prices.create({
          product: product.id,
          unit_amount: cart[i].price * 100,
          currency: "usd"
        })
        lineItems.push({
          price: price.id,
          quantity: cart[i].count
        })
      }
      console.log(lineItems, 'line items')

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ["card"],
        mode: "payment",
        // change url when you host your site
        success_url: process.env.successurl,
        cancel_url: process.env.cancel
      });

      res.redirect(session.url);
    } catch (err) {
      res.send(err);
    }
  },
  getCanceled: (req, res) => {
    res.render("canceled.ejs");
  },
  getThankyou: (req, res) => {
    res.render("thankyou.ejs");
  },
 // add search keywords to a database and have an image returned for certain keywords otw return a string that says nothing found for your search

};
