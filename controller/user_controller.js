var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
const bcrypt = require("bcrypt");
const otp=require('./otp');
const { VerificationAttemptContext } = require("twilio/lib/rest/verify/v2/verificationAttempt");
const { productData } = require("./admin_controller");

module.exports = {
  home: async (req, res, next) => {
    productDatas = await productModel.find().lean();
    if (req.session.userLogin) 
    return res.render('user/index',{userheader:true,productDatas});
    
    res.render('user/index',{guestheader:true,productDatas});
  },
  

  signup: async (request, response) => {
    let emailnotexist = await usersModel.findOne({ email: request.body.email });
    if(emailnotexist) {
      console.log('user already exists');
     return response.send('user already exist');
    }
    request.body.block = false;
    const newuser = await usersModel.create(request.body);
    console.log(newuser);
    otp.doSms(newuser);
      
    //   .then((data) => {
       
    //   if (data) {  
        
    //     response.render('user/otp',{id});
    //   } else {    
    //     res.redirect('/signup')
    //     }
    // });
    const id = newuser._id;
    console.log(id,"hihihihihi");
    console.log(newuser, "user ethi");
    //  response.redirect('/otpverify')
    response.render('user/otp',{id});

  },


  loginpage: (req, res, next) => {
    if (req.session.userLogin)
    return res.redirect('/',{questheader:true})
    res.render('user/login');
  },
  

  userLogin: async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ msg: "name or pass empty" });
    const user = await usersModel.findOne({ email: email });

    try {
      var correct = await bcrypt.compare(password, user.password);
    }
    catch (error) {
      return res.json({ msg: "invalid user", error });
    }

    console.log("error bypassed");
    if (!user || !correct) return res.json({ msg: "name or pass invalid" });
    block = await usersModel.findOne({ email: email }, { _id: 0, block: 1 })
    console.log(block.block);
    if(block.block) return res.json({ msg: "sorry user is blocked try contacting customer helpline number" });
    console.log("teststar", correct, "testend");
    req.session.userLogin = true;
    req.session.userId = await usersModel.findOne({ email: email }, { _id: 1 }).lean();
    res.redirect("/");
  },
  signuppage: (req, res, next) => {
    
    res.render('user/signup');
  
  },
  // otp: (req, res, next) => {
  //   res.render('user/otp', { id });
  // },

  otpVerify: async(req, res, next) => {
    console.log('ethiii');
    console.log(req.params.id);
    const userdata = await usersModel.findOne({ _id: req.params.id }).lean();
    console.log(userdata);
    console.log(req.body.otp);
    otps = req.body.otp;
    verification=await otp.otpVerify(otps, userdata);
    if (verification) {
      req.session.userLogin = true;
      res.redirect('/');
    }
    else {
      res.redirect('/')
    }
  },
 
};
