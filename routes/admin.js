var express = require('express');
const multer = require('multer');
var router = express.Router();
const admin = require('../controller/adminController');
const session = require('../middlewares/sessionMiddleware')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/product_uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        ;
        cb(null,uniqueSuffix + '-' +file.originalname   )
    }
});



const upload = multer({ storage: storage });

// --------------------------------------------------------------------------------------------------------------------------
const storages = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/bannerImages');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        ;
        cb(null,uniqueSuffix + '-' +file.originalname   )
    }
});
const uploads = multer({ storage: storages });



/* GET users listing. */
router.get('/', admin.loginPage);
router.post('/adminpage', admin.login);
router.get('/dashboard', session.adminSession, admin.dashboard);
router.get('/table', session.adminSession, admin.userdata);
router.get('/edit/:id',session.adminSession ,admin.editblock)
router.get('/block/:id',session.adminSession , admin.userblock);
router.get('/active/:id', session.adminSession ,admin.useractive);
router.get('/addcategories', session.adminSession ,admin.renderaddcategory);
router.post('/createcategory',session.adminSession , admin.createcategory);
router.get('/categorytable', session.adminSession ,admin.categorydata);
router.get('/editcategory/:id', session.adminSession ,admin.rendereditcategory);
router.post('/editcategory/:id', session.adminSession ,admin.editcategory);
router.get('/delete-category/:id',session.adminSession , admin.deletecategory);
router.get('/addproduct',session.adminSession , admin.renderaddproduct);
router.post('/addproduct',session.adminSession , upload.array('photos', 5), admin.addproduct);
router.get('/productTable',session.adminSession , admin.productData);
router.get('/editProduct/:id',session.adminSession , admin.rendereditProduct);
router.post('/editProduct/:id',session.adminSession ,upload.array('photos', 5), admin.editProduct);
router.get('/deleteProduct/:id', session.adminSession, admin.deleteProduct);
router.get('/orders', session.adminSession, admin.orderData);
router.get('/addCoupon', session.adminSession, admin.renderaddCoupon);
router.post('/addCoupon', session.adminSession, admin.addCoupon);
router.get('/couponData', session.adminSession, admin.couponData);
router.get('/editCoupon/:id', session.adminSession, admin.renderEditCoupon);
router.post('/editCoupon/:id', session.adminSession, admin.editCoupon);
router.get('/deleteCoupon/:id', session.adminSession, admin.deleteCoupon);
router.get('/renderChangeOrderStatus/:id', session.adminSession, admin.renderChangeOrderStatus);
router.post('/changeOrderStatus/:id', session.adminSession, admin.editOrderStatus);
router.get('/addBanner', session.adminSession, admin.renderAddBanner);
router.post('/addBanner', session.adminSession, uploads.single('image'), admin.addBanner);
router.get('/bannerData', session.adminSession, admin.bannerData);
router.get('/editBanner', session.adminSession,admin.renderEditBanner);
router.post('/editBanner',session.adminSession,uploads.single('image'),admin.editBanner)
router.get('/deleteBanner')
module.exports = router;
