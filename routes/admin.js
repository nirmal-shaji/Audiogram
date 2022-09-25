var express = require('express');
const multer = require('multer');
var router = express.Router();
const admin = require('../controller/admin_controller');
const session = require('../middlewares/session_middleware')
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
router.get('/deleteProduct/:id',session.adminSession , admin.deleteProduct);

module.exports = router;
