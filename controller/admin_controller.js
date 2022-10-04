var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var usersModel = require("../model/userschema");
var categoryModel = require("../model/categoryschema")
var productModel = require('../model/productschema');
var adminModel = require('../model/adminschema');
const orderModel = require('../model/orderSchema');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var session = require('express-session');
const bcrypt = require("bcrypt");


module.exports = {


    loginPage: (req, res, next) => {
        if (req.session.adminLogin)
        return res.redirect('/admin/dashboard');
        res.render('admin/signin',{layout:"admin_layout"});
    },
    dashboard: (req, res, next) => {
        res.render('admin/admindashboard',{layout:"admin_layout"});
    },
    login: async (req, res, next) => {
        const { email, password } = req.body;
        console.log(email+password);
        const admin = await adminModel.findOne({ "email": email }).lean();
        console.log(admin.password);
        var correct = await bcrypt.compare(password, admin.password)
        if (email == 'admin@gmail.com' && correct) {
            console.log('ethi')
            req.session.adminLogin = true;
            console.log(req.session.adminLogin);
            res.redirect('/admin/dashboard');
        }
    },
    userdata: async(req,res,next) => {
        
        const userdetails = await usersModel.find().lean();
        res.render('admin/table',{layout:"admin_layout",userdetails})
        // console.log(userdetails);
    },
    userblock: async (req, res, next) => {
        // console.log('ethanilla');
        const userIds = req.params.id
        // console.log(userIds);
        await usersModel.updateOne({_id:userIds}, { block : true });
      
        res.redirect('/admin/table');
        
       
    },
    useractive:async (req, res, next) => {
        // console.log('ethanilla');
        const userIds = req.params.id
        // console.log(userIds);
        await usersModel.updateOne({_id:userIds}, { block : false });
      
        res.redirect('/admin/table');
        
       
    },

    editblock: async(req, res, next) =>{
     
        const userId = req.params.id
        const blocks = await usersModel.find({ _id: userId }).lean();
        console.log(blocks, "userdetails");
        // console.log("ethitooo", userId);
        // console.log({ userId:userId });
        res.render('admin/form', { layout:"admin_layout",blocks});
    },
      renderaddcategory: (req, res, next) =>{
        res.render('admin/addcategory');
    },
    createcategory: async (req, res, next) => {  
        let categorydata = await categoryModel.find().lean();
        categoryexist = categorydata.filter((i) => {
            if (i.category.toUpperCase() === req.body.category.toUpperCase())
                return true;
         })
        // let subcategoryexist = await categoryModel.findOne({ sub_category: req.body.sub_category }).lean();
        console.log('the category is ',categoryexist)
        if (categoryexist[0]) {
            return res.send('category already exist');
        }
        await categoryModel.create(req.body);
        res.redirect('/admin/categorytable');
    },
    categorydata: async (req, res, next) => {
        console.log('vilikanindto');
        let categorydata = await categoryModel.find().lean();
        console.log(categorydata,'hgjkhgjghjk');
        res.render('admin/table_category',{layout:"admin_layout",categorydata});
    },
    rendereditcategory: (req, res, next) => {
        const categoryId = req.params.id;
        console.log(categoryId);
        res.render('admin/editcategory', {layout:"admin_layout",categoryId})
    },
    editcategory: async (req, res, next) => {
        // const categoryIds = req.params.id;
        // console.log("cataegory id is",categoryIds);
        await categoryModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "category": req.body.category  } });
        res.redirect('/admin/categorytable');
    },
    deletecategory: async (req, res, next) => {
        // const categoryIds = req.params.id;
        await categoryModel.deleteOne({ _id: req.params.id });
        res.redirect('/admin/categorytable');
        
    },
    renderaddproduct: async (req, res, next) => {
        const categorydata = await categoryModel.find().lean();
        console.log(categorydata);
        res.render('admin/addproduct',{layout:"admin_layout",categorydata});
    },
    addproduct: async (req, res, next) => {
        console.log(req.body);
        const productnames = await productModel.findOne({ name: req.body.name }).lean();
            console.log(productnames);
        if (productnames) 
            return res.send('product already exists');
        // const arrImages = [];
        // arrImages=map.
        // console.log(multer.files);
        console.log(req.files);
        const arrImages = req.files.map((value) => value.filename);
        console.log(arrImages);
        req.body.imagepath = arrImages;
        console.log(req.body);
        await productModel.create(req.body);
        res.redirect("/admin/productTable");

    },
    productData: async (req, res, next) => {
        const productData = await productModel.find().populate('category').lean();
        console.log(productData);
        res.render('admin/tableProduct',{layout:"admin_layout",productData});
    },
    // rendereditProduct: {
        
    // },
    rendereditProduct: async (req, res, next) => {
        editId = req.params.id;
        console.log(req.params.id);
        productData = await productModel.findOne({ _id: editId }).populate('category').lean();
         console.log("ethiloooooooooooooo", productData);
        const categoryData = await categoryModel.find().lean();
        console.log(categoryData);
        res.render('admin/editProduct',{layout:"admin_layout",productData ,categoryData});
    },
    editProduct: async (req, res, next) => {
        console.log('param');
        console.log(req.params.id); 
        console.log(req.body);
            let arrImages = req.files.map((value) => value.filename);
        // console.log(arrImages);
        if (arrImages[0]) {
            imagepat = await productModel.findOne({ "_id": req.params.id }, { imagepath: 1, _id: 0 }).lean();
            console.log(imagepat);
            imagepat.imagepath.map(( i) => fs.unlinkSync(path.join(__dirname, '..', 'public', 'product_uploads', i)))
            req.body.imagepath = arrImages;
            await productModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'amount':req.body.amount,'discount':req.body.discount,'imagepath':req.body.imagepath} });
        }
        else {
            await productModel.findOneAndUpdate({ "_id": req.params.id }, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'amount':req.body.amount,'discount':req.body.discount} });
        }
        res.redirect('/admin/productTable');      
    },
    deleteProduct: async (req, res, next) => {
        imagepat = await productModel.findOne({ "_id": req.params.id }, { imagepath: 1, _id: 0 });
        imagepat.imagepath.map((i) => fs.unlinkSync(path.join(__dirname, '..', 'public', 'product_uploads', i)));
        await productModel.findOneAndDelete({ "_id": req.params.id }, { $set: { "name": req.body.name , "brandName": req.body.brandName,'description':req.body.description,'category':req.body.category,'stock':req.body.stock,'amount':req.body.amount,'discount':req.body.discount,'imagepath':req.body.imagepath} });
        res.redirect('/admin/productTable'); 
    },
    orderData: async(req, res, next) => {
        orderData = await orderModel.find().populate("userId").lean(); 
        console.log(orderData);
        res.render('admin/tableorderData',{orderData})
    }
    

    
    

    
      
}