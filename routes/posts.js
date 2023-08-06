const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
// const productsController = require("../controllers/products");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
// router.get("/:id", ensureAuth, postsController.getPost);

// router.post("/createPost", upload.single("file"), postsController.createPost);

// router.put("/likePost/:id", postsController.likePost);

// router.delete("/deletePost/:id", postsController.deletePost);

// routes for e-commerce site
router.get("/cart", ensureAuth, postsController.getCart);
router.post("/addToCart", ensureAuth, postsController.addToCart);

//router.get("/product/:id", ensureAuth, postsController.getProduct);

 router.delete("/deleteFromCart/:productId", postsController.deleteFromCart);


module.exports = router;
