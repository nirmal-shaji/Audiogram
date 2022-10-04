var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var cartModel = require("../model/cartschema");
const addressModel = require('../model/addressSchema');
const wishlistModel = require('../model/wishlistschema');
const product = require("../model/productschema");
const orderModel = require('../model/orderSchema');
const razorpay=require('../controller/razorpay_controller')
const cartFunctions = require('../controller/cart_functions');
const { findOne } = require("../model/userschema");


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
        console.log(address);
        cartData = await cartModel.findOne({ userId: userId._id }).populate("products.productId").lean();
        console.log(cartData);
        productData = cartData.products;
        totalAmount = await cartFunctions.totalAmount(cartData);
        res.render('user/checkout',{userheader: true,address,productData,totalAmount,cartData});   
    },
    checkoutAddressChange: async(req, res, next) => {
       
        userId = req.session.userId;
        address = await addressModel.find({ userId: userId._id, _id: req.body.address }).lean();
        console.log(address);
        res.json({message:"this is succesfully", address });
    },
    renderConfirmation: async(req, res, next) => {
        console.log("hik", req.params.id);
        req.body.userId = req.session.userId._id;
        cartData = await cartModel.findOne({ userId: req.body.userId }, { _id: 0, products: 1 }).populate("products.productId").lean();
        totalAmount = await cartFunctions.totalAmount(cartData);
        req.body.products = cartData.products;
        console.log(req.body);
        orderData = await orderModel.create(req.body)
        
        await cartModel.findOneAndDelete({ userId: req.body.userId });
        orderDataPopulated = await orderModel.findOne({ _id: orderData._id }).populate("products.productId").lean();;
        console.log(orderDataPopulated);
        res.render('user/order_confirmation',{userheader:true,orderDataPopulated,totalAmount});
    },
    intiatePay: (req, res, next) => {
        console.log(req.body);
    }
  
   
 }