var express = require('express');
var router = express.Router();
const userControl=require('../controller/userController')
const app = express();
const cartControl = require('../controller/cartController')
const wishlistControl = require('../controller/wishlistController')
const session = require('../middlewares/sessionMiddleware')
const profileControl = require('../controller/profileController')

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
router.post('/deletewishlist', session.userSession, wishlistControl.delete);
router.get('/user_profile', session.userSession, userControl.renderProfile);
router.post('/new_address', session.userSession, profileControl.editAddress);
router.get('/checkout', session.userSession, cartControl.renderCheckout);
router.post('/address_fetching', session.userSession, cartControl.checkoutAddressChange);
router.post('/order_confirmed', session.userSession, cartControl.renderConfirmation);
router.get('/delete_address/:id', session.userSession, profileControl.deleteAddress);
// router.get('/order_confirmation', session.userSession, cartControl.renderConfirmations);
// router.post('/manage_address',session.userSession,cartControl.addressData)
router.post('/edit_userdata', session.userSession, profileControl.editUserData);
router.post('/intiate_razorpay', session.userSession, cartControl.intiatePay);
router.get('/renderConfirmation', session.userSession, cartControl.confirmationPage) 
router.post('/verifyRazorpay', session.userSession, cartControl.verifyPay);
// router.get('/addCoupon/:id', session.userSession, userControl.addCoupon);
router.post('/couponValidation', session.userSession, cartControl.validateCoupon);
router.post('/cancelOrder', session.userSession, profileControl.cancelOrder);


  module.exports = router;