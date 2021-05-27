const express = require('express');
const router = express.Router();
const { Product } = require("../models/Product")
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {CLOUD_NAME, API_KEY, API_SECRET} = require("../config/dev")


const { auth } = require("../middleware/auth");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' || ext !== '.png') {
            return cb(res.status(400).end('only jpg, png are allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key:API_KEY,
    api_secret: API_SECRET
})


//=================================
//             Product
//=================================

router.post("/uploadImage", upload, auth, async(req, res) => {

    // upload(req, res, err => {
    //     if (err) {
    //         return res.json({ success: false, err })
    //     }

    //     const result = cloudinary.uploader.upload(req.file.path, (result) => {
    //         resolve({
    //             url: result.url,
    //             id: result.public_id
    //         })
    //     });
    //     return res.json({success: true, image: result.url});
    //     //return res.json({ success: true, image: res.req.file.path, fileName: res.req.file.filename })
    // })
    const result = await cloudinary.uploader.upload(req.file.path);
    
    return res.json({success: true, image: result.url});

});

router.post("/uploadProduct", auth, (req, res) => {

    const product = new Product(req.body)

    product.save((err) => {
        if (err) {
            return res.status(400).json({ success: false, err })
        }
        return res.status(200).json({ success: true })
    })

});

router.post("/getProducts", (req, res) => {

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key]
            }
        }
    }

    if (term) {
        Product.find(findArgs)
            .find({ $text: { $search: term } })
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    }


});

//?id=${productId}&type=single
router.get("/products_by_id", (req, res) => {
    
    let type = req.query.type
    let productIds = req.query.id

    if(type === "array"){
        let ids = req.query.id.split(',');
        productIds = [];
        productIds = ids.map(item => {
            return item
        })
    }

    //we need to find the product information that belongs to the product Id

    Product.find({ '_id': {$in: productIds}})
        .populate('writer')
        .exec((err, product) => {
            if(err) return req.status(400).send(err)
            return res.status(200).send(product)
        })
    

});

module.exports = router;
