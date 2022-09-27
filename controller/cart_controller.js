var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var cartModel = require("../model/cartschema");
const product = require("../model/productschema");
const cartFunctions = require('../controller/cart_functions');


module.exports = {
    cart: async(req, res, next) => {
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
            else { await cartModel.create({ userId: userId._id, products: { productId: productId, quantity: 1 } }); }
        //     cartData = await cartModel.findOne(
        //         { userId: userId._id }
        //     ).populate("products.productId").lean();
        //     price = (cartData.products[0].productId.amount - cartData.products[0].productId.discount) * cartData.products[0].quantity
        // console.log(price);
        // await cartModel.updateOne({ userId: userId._id, "products.productId": productId },  { "products.$.price": price })
        //     totalAmount = await cartFunctions.totalAmount(cartData)
        //     console.log(totalAmount);

        //     console.log(cartData.products[0]);
        //     res.render('user/cart', { userheader: true, cartData, totalAmount,price })
        //     console.log(cartData.products[0].quantity)
        
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
        if(cartData)
        totalAmount = await cartFunctions.totalAmount(cartData);
        res.render('user/cart', { userheader: true, cartData, totalAmount}) 
    } ,
    




    delete: async (req, res, next) => {
        productId = req.body.product
       
        userId = req.session.userId
        console.log(req.body.product)
       
        cartData = await cartModel.find({ userId: userId._id })
        console.log(cartData);
       deletes = await cartModel.updateOne({ userId: userId._id }, { $pull: { products: { productId: req.body.product } } })
        console.log(deletes);
    console.log('delete lorum lipdjsakljflkajkldfjljadflkjlkjklsdfkalfjkljklfjkljklds');
        res.status(200).json({ message: "the product is successfully deleted" });
    }
    
   
 }