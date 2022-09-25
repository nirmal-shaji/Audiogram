var express = require('express');
var router = express.Router();
const userControl=require('../controller/user_controller')
const app = express();
const cartControl=require('../controller/cart_controller')


/* GET home page. */
router.get('/', userControl.home);
//login page
router.get('/login', userControl.loginpage);

router.post('/login', userControl.userLogin);

router.get('/signup', userControl.signuppage)
router.post('/signup/', userControl.signup);
//  router.get('/otpverify',userControl.otp)
router.post('/otpverify/:id', userControl.otpVerify);
router.get('/cart/:id',cartControl.cart)



  module.exports = router;