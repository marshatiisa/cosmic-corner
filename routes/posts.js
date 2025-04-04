const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
// const productsController = require("../controllers/products");

const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get("/cart", ensureAuth, postsController.getCart);
router.post("/addToCart", ensureAuth, postsController.addToCart);
router.post("/emptyCart", ensureAuth, postsController.emptyCart);
router.post("/addFromCart/:productId", postsController.addFromCart);
router.delete("/deleteFromCart/:productId", postsController.deleteFromCart);

module.exports = router;
