var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userSchema");
var categoryModel = require("../model/categorySchema")
var productModel = require('../model/productSchema');
var adminModel = require('../model/adminSchema');
var addressModel = require('../model/addressSchema');
const orderModel=require('../model/orderSchema')
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const otp=require('./otp');
var session = require('express-session');
const bcrypt = require("bcrypt");

module.exports = {
    editAddress: async (req, res, next) => {
        userId = req.session.userId._id
        console.log(userId)
        req.body.userId = userId;
        await addressModel.create(req.body);
        res.redirect('/');
        
    },
    deleteAddress: async (req, res, next) => {
        console.log(req.params.id);
        
    }, 
    editUserData: async(req, res, next) => {
        console.log(req.body);
        emailExists = await usersModel.findOne({ email: req.body.email }).lean();
        if (emailExists)
            return res.json({ message: "the email already exists please enter another one" });
        if (req.body.phone_number) {
            //need change to default value phone Number
            // otp.doSms(req.body); 
            // res.redirect('/otpverify')
        updateData = await usersModel.findOneAndUpdate({ _id: req.session.userId._id }, { $set: { first_name: req.body.first_name, last_name: req.body.last_name, phone_number: req.body.phone_number,email:req.body.email } });
        }
        else {
            updateData = await usersModel.findOneAndUpdate({ _id: req.session.userId._id }, { $set: { first_name: req.body.first_name, last_name: req.body.last_name,email:req.body.email } }); 
        }
        res.redirect('/user_profile');
    },
    deleteAddress: async (req, res, next) => {
        console.log(req.params.id);
        await addressModel.findOneAndDelete({ _id: req.params.id });
        res.redirect('/user_profile');
    },
    cancelOrder: async (req, res, next) => {
        await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { orderStatus: 'cancelled' });
        res.json({ message: 'successfull' });
    }



}
