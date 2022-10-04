var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var adminModel = require('../model/adminschema');
var addressModel = require('../model/addressSchema');
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
    }



}
