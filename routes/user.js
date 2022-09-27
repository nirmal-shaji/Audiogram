var express = require('express');
var router = express.Router();
const userControl=require('../controller/user_controller')
const app = express();
const cartControl = require('../controller/cart_controller')
const wishlistControl = require('../controller/wishlist_controller')
const session = require('../middlewares/session_middleware')


/* GET home page. */
router.get('/', userControl.home);
//login page
router.get('/login', userControl.loginpage);

router.post('/login', userControl.userLogin);

router.get('/signup', userControl.signuppage)
router.post('/signup/', userControl.signup);
//  router.get('/otpverify',userControl.otp)
router.post('/otpverify/:id', userControl.otpVerify);
router.post('/cart',session.userSession, cartControl.cart)
router.post('/incrementQuantity', session.userSession,cartControl.increment);
 router.post('/deleteProduct',session.userSession, cartControl.delete);
router.get('/cartData',session.userSession, cartControl.cartData);
router.post('/wishlist',session.userSession,wishlistControl.addWishlist)
router.get('/wishlistData',session.userSession, wishlistControl.wishlistData);
router.post('/deletewishlist',session.userSession, wishlistControl.delete);



  module.exports = router;