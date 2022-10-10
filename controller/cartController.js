var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userSchema");
var categoryModel = require("../model/categorySchema")
const productModel = require('../model/productSchema');
var cartModel = require("../model/cartSchema");
const addressModel = require('../model/addressSchema');
const wishlistModel = require('../model/wishlistSchema');
const couponModel=require('../model/couponSchema')

const orderModel = require('../model/orderSchema');
const razorpay=require('./razorpayController')
const cartFunctions = require('./cartFunctions');
const { findOne } = require("../model/userSchema");
const { couponData } = require("./adminController");





module.exports = {
    cart: async (req, res, next) => {
        console.log('ethiiiiiiii');
       const productId = req.body.product;
        let userId = req.session.userId;
        console.log(userId);
        
        console.log(productId,userId._id);
        cart = await cartModel.findOne({ userId: userId._id }).lean();
        stock = await productModel.findOne({ _id: productId }, { _id: 0, stock: 1 }).lean();
        console.log(stock);
        if (stock.stock<=0) 
         return res.json({message:'sorry the product is out of stock click the link below to move back to home'})            
           
            
       
            if (cart) {
                productexist = await cartModel.findOne({ userId: userId._id, "products.productId": productId });
                if (productexist) {
                    await cartModel.updateOne({ userId: userId._id, "products.productId": productId }, { $inc: { "products.$.quantity": 1 } });
                }
                else {
                    await cartModel.findOneAndUpdate({ userId: userId._id }, { $push: { products: { productId: productId, quantity: 1 } } });
                }
            }
            else
            {
                await cartModel.create({ userId: userId._id, products: { productId: productId, quantity: 1 } });
        }
        if (req.body.wishlist) {
            await wishlistModel.updateOne({ userId: userId._id }, { $pull: { products: { productId: req.body.product } } });  
        }
        
       return res.json({message:'success'})
        
    },
    increment: async (req, res, next) => {
        stock = await productModel.findOne({ _id: req.body.product}, { _id: 0, stock: 1 }).lean();
        if (stock.stock<=0) {
         return res.json({message:'sorry the product is out of stock click the link below to move back to cart'})            
        }
        const quantities = parseInt(req.body.quantity)
       
        userId = req.session.userId;
         await cartModel.updateOne({ userId: userId._id, "products.productId": req.body.product },  { "products.$.quantity": quantities });
         cartData = await cartModel.findOne(
            { userId: userId._id, "products.productId": req.body.product}
        ).populate("products.productId").lean();
        price = (cartData.products[req.body.index].productId.amount - cartData.products[req.body.index].productId.discount) * cartData.products[req.body.index].quantity
        quantity = cartData.products[req.body.index].quantity;
        
        totalAmount = await cartFunctions.totalAmount(cartData);
        return res.json({ message: "the product is incremented",quantity,price, totalAmount })
        
    },
    cartData: async (req, res, next) => {
        userId = req.session.userId;
        cartData = await cartModel.findOne(
            { userId: userId._id }
        ).populate("products.productId").lean();
        
        var totalAmount;
        console.log(cartData);
        if(cartData){
        // To check whether a cart is emypty-------------------------------------------------------------------
        if (cartData.products[0]) {
            totalAmount = await cartFunctions.totalAmount(cartData);
            totalAmount = totalAmount - cartData.couponDiscount;
            
            // if (couponData.minAmount >= totalAmount  )

            res.render('user/cart', { userheader: true, cartData, totalAmount })
        }
    }
        else {
            res.render('user/emptycart', { userheader: true });
        }
    } ,
    




    delete: async (req, res, next) => {
        productId = req.body.product
       
        userId = req.session.userId
        console.log(req.body.product)
       
       
        
        deletes = await cartModel.updateOne({ userId: userId._id }, { $pull: { products: { productId: req.body.product } } })
        cartData = await cartModel.find({ userId: userId._id }).lean();
        console.log(deletes);
        console.log('delete lorum lipdjsakljflkajkldfjljadflkjlkjklsdfkalfjkljklfjkljklds');
            return res.status(200).json({ message: "the product is successfully deleted" });
        
    },
    renderCheckout: async(req, res, next) => {
        userId = req.session.userId;
        address = await addressModel.find({ userId: userId._id }).lean();
      
        cartData = await cartModel.findOne({ userId: userId._id }).populate("products.productId").lean();
        
       
        productData = cartData.products;
        totalAmount = await cartFunctions.totalAmount(cartData);
        totalAmount = totalAmount - cartData.couponDiscount;
        res.render('user/checkout',{userheader: true,address,productData,totalAmount,cartData});   
    },
    checkoutAddressChange: async(req, res, next) => {
       
        userId = req.session.userId;
        address = await addressModel.find({ userId: userId._id, _id: req.body.address }).lean();
        console.log(address);
        if (address[0].alternatePhoneNumber) {
            console.log('the value null is considered');
        }
        else {
            console.log('the value is not considered');
        }
        res.json({message:"this is succesfully", address });
    },
    renderConfirmation: async (req, res, next) => {
        console.log('something wrong is happening');
        console.log("hik", req.params.id);
        console.log(req.params.id, "qwertyuiopqwertyuioqwertyui");
        req.body.userId = req.session.userId._id;
        cartData = await cartModel.findOne({ userId: req.body.userId }, { _id: 0, products: 1 }).populate("products.productId").lean();
        totalAmount = await cartFunctions.totalAmount(cartData);
        totalAmount = totalAmount - cartData.couponDiscount;
        req.body.totalAmount = totalAmount;
        req.body.products = cartData.products;
        req.body.paymentType = "C.O.D";
      
        orderData = await orderModel.create(req.body)
        
        await cartModel.findOneAndDelete({ userId: req.body.userId });
        orderDataPopulated = await orderModel.findOne({ _id: orderData._id }).populate("products.productId").lean();
        console.log(orderDataPopulated);
        req.session.confirmationData = { orderDataPopulated, totalAmount };
        // res.render('user/order_confirmation', { userheader: true, orderDataPopulated, totalAmount });
        // console.log('data is here');
        res.json({ message: "sucessfull" });
    },
    intiatePay: async (req, res, next) => {
        console.log('arrivedqwertyuioprtyuihyghjuijuhghjihbj');
        console.log(req.body);
        req.body.userId = req.session.userId._id;
        cartData = await cartModel.findOne({ userId: req.body.userId }, { _id: 0, products: 1 }).populate("products.productId").lean();
        console.log(cartData);
        totalAmount = await cartFunctions.totalAmount(cartData);
        req.body.products = cartData.products;
        req.body.paymentType = "Online Payment";
        orderData = await orderModel.create(req.body)
        
        await cartModel.findOneAndDelete({ userId: req.body.userId });
        orderDataPopulated = await orderModel.findOne({ _id: orderData._id }).populate("products.productId").lean();
        console.log(req.body);
        console.log('stopped here', orderData._id, totalAmount);
        totalAmounts = totalAmount * 100;
        razorData = await razorpay.intiateRazorpay(orderData._id, totalAmounts);
        console.log('continuing')
        await orderModel.findOneAndUpdate({ _id: orderData._id }, { orderId: razorData.id });
        console.log(razorData);
        razorId = process.env.RAZOR_PAY_ID;
        
        req.session.confirmationData = { orderDataPopulated, totalAmount };
        
        res.json({ message: 'success',totalAmounts,razorData,orderData});

    },
    confirmationPage: (req, res, next) => {
        console.log(req.session.confirmationData);
        orderDataPopulated = req.session.confirmationData.orderDataPopulated
        totalAmount = req.session.confirmationData.totalAmount; 
        req.session.confirmationData = null;
        res.render('user/order_confirmation',{ userheader: true, orderDataPopulated, totalAmount });
    },
    verifyPay: async (req, res, next) => {
        console.log(req.body, "hihihihihihhhihhihh");
        success= await razorpay.validate(req.body);
        if (success)
        {
           await orderModel.findOneAndUpdate({ orderId: req.body['razorData[id]'] },{paymentStatus:"success"});
           return res.json({ status: "true" });
        }
        else
        {
            await orderModel.findOneAndUpdate({ orderId: req.body['razorData[id]'] }, { paymentStatus: "failed" });
            return res.json({ status: "failed" });
            }
    },
    validateCoupon: async (req, res, next) => {
        userId = req.session.userId;
        console.log(req.body);
        couponExist = await couponModel.findOne({couponCode:req.body.couponId,"users.userId": userId }).lean();
        console.log(couponExist);
        coupons = await couponModel.findOne({ couponCode: req.body.couponId }).lean();
        console.log(coupons);
        currentDate = new Date();
        console.log(coupons, 'hihihihihihihihih');
        if (coupons) {
        if(couponExist){
         if (couponExist.users.couponStatus == 'invalid')
            return res.json({ message: 'the coupon is used already' });    
        }
        if (currentDate > coupons.expiryDate) 
        return res.json({ message: "sorry the coupon has expired" });   
        
         
         console.log(req.body.total);
         if (req.body.total > coupons.minAmount)
         return res.json({ message: "please add items to cart" });
         if (!couponExist) {
                await couponModel.find({ couponCode: req.body.couponId }, { users: { userId: userId } });
            }
            await couponModel.findOneAndUpdate({ couponCode: req.body.couponId }, { couponStatus: "invalid" });
            total = total - coupons.discountAmount;
           await cartModel.findOneAndUpdate({ userId: userId }, { couponDiscount: coupons.discountAmount });
           return res.json({ message: "succesfull" ,total});
            
    
        }
        return res.json({ message: "invalid coupon" });
      }
     
   
 }