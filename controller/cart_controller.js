var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var cartModel = require("../model/cartschema");
const product = require("../model/productschema");



module.exports = {
    cart: async(req, res, next) => {
       const productId = req.params.id;
        let userId = req.session.userId;
        console.log(userId);
        
        console.log(productId,userId._id);
        cart = await cartModel.findOne({ userId : userId._id }).lean();
        if (cart) {
            productexist = await cartModel.findOne({ userId: userId._id, "products.productId": productId });
            if (productexist) {
                await cartModel.updateOne({ userId: userId._id, "products.productId": productId }, { $inc: { "products.$.quantity": 1 } });
            }
            else {
                await cartModel.findOneAndUpdate({ userId: userId._id }, {$push:{products:{productId:productId,quantity:1}}});
            }
        }
        else { await cartModel.create({ userId: userId._id , products:{productId:productId,quantity:1}} ); }
        cartData = await cartModel.findOne(
            {userId:userId._id}
        ).populate("products.productId").lean();
       
       console.log(cartData.products[0]);
        res.render('user/cart',{userheader:true,cartData})
      }
}