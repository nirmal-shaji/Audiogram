var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var wishlistModel = require('../model/wishlistschema');
const product = require("../model/productschema");
const cartFunctions = require('../controller/cart_functions');


module.exports = {
    addWishlist: async(req, res, next) => {
        const productId = req.body.product;
        let userId = req.session.userId;
        wishlist = await wishlistModel.findOne({ userId: userId._id }).lean();
        if (wishlist) {
            productexist = await wishlistModel.findOne({ userId: userId._id, "products.productId": productId });
            if (productexist) 
               return res.json({message:"product already added to wishlist"})
                await wishlistModel.findOneAndUpdate({ userId: userId._id }, { $push: { products: { productId: productId } } });
        
        }
        else { await wishlistModel.create({ userId: userId._id, products: { productId: productId } }); }
        wishlistData = await wishlistModel.findOne(
            { userId: userId._id }
        ).populate("products.productId").lean();
        price = (wishlistData.products[0].productId.amount - wishlistData.products[0].productId.discount);
        console.log(price);
        await wishlistModel.updateOne({ userId: userId._id, "products.productId": productId },  { "products.$.price": price })
    },
    wishlistData: async (req, res, next) => {
        userId = req.session.userId;
        
        wishlistDatas = await wishlistModel.findOne(
            { userId: userId._id }
        ).populate("products.productId").lean();
        console.log(wishlistDatas);
        
        stocks = await Promise.all(wishlistDatas.products.map( async(i) => {
            console.log(i.productId._id);
            stock = await productModel.findOne({ _id: i.productId._id }, { _id: 0, stock: 1 }).lean();
            
            return stock;
        }));
       
        console.log(stocks);
        // totalAmount = await cartFunctions.totalAmount(cartData);
        if (wishlistDatas.products[0]) {
            res.render('user/wishlist', { userheader: true, wishlistDatas,stocks })
        }
        else {
            res.render('user/emptywishlist')
        }
    },
    delete: async (req, res, next) => {
        productId = req.body.product
       
        userId = req.session.userId
        console.log(req.body.product)
       deletes = await wishlistModel.updateOne({ userId: userId._id }, { $pull: { products: { productId: req.body.product } } })  
    }
    


}