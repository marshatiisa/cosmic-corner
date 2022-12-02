const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
// const productsController = require("../controllers/products");

const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/products", ensureAuth, postsController.getProducts);
router.get("/cart", ensureAuth, postsController.getCart);
router.get("/checkout", ensureAuth, postsController.getCheckout);

router.get("/test", function (req,res){
    console.log('test')
})
//  router.post("/addToCart/:productId", postsController.addToCart);

 //add an event listener that sends the product id to the server- fetch/addtocart/idoftheproduct
//adding new routes
// router.get("/products", ensureAuth, postsController.getProducts);
// router.get("/cart", ensureAuth, postsController.getCart);
// router.get("/checkout", ensureAuth, postsController.getCheckout);
// router.get("/payment", ensureAuth, postsController.getPayment);


module.exports = router;
