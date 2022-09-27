var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var cartModel = require("../model/cartschema");
const product = require("../model/productschema");

module.exports = {
    totalAmount: (cartdata) => {
        total = cartdata.products.reduce((acc, curr) => {
            acc += (curr.productId.amount - curr.productId.discount) * curr.quantity;
            return acc;
        }, 0);
        return total;
    }
}