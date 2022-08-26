const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  let result = Product.find(filter).populate("category");
  let lengthSearch = Product.find(filter);
  const length = (await lengthSearch).length;

  if (!result) {
    res.status(500).json({ success: false });
  }

  const limit = Number(req.query.limit) || 5;

  if (req.query.viewmore) {
    const viewMore = Number(req.query.viewmore) - 1;
    const skip = limit * viewMore;
    console.log(limit, skip, req.query.viewmore);
    result = result.skip(skip).limit(limit);
  } else {
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
  }

  const productList = await result;
  res.send({ length, products: productList });
});

router.get("/searching", async (req, res) => {
  let name = req.query.name;
  if (!name) {
    var result = Product.find({});
    var lengthSearch = Product.find({});
  } else {
    let newReg = new RegExp(`${name}`, "i");
    var result = Product.find({ name: { $regex: newReg } });
    var lengthSearch = Product.find({ name: { $regex: newReg } });
  }
  let length = (await lengthSearch).length;
  if (!result) {
    res.status(500).json({ success: false });
  }

  const limit = Number(req.query.limit) || 5;

  if (req.query.viewmore) {
    const viewMore = Number(req.query.viewmore) - 1;
    const skip = limit * viewMore;
    console.log(limit, skip, req.query.viewmore);
    result = result.skip(skip).limit(limit);
  } else {
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
  }

  const productList = await result;
  res.send({ length: length, products: productList });
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      res.status(400).json({ success: false });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

router.post(`/`, upload.single("image"), async (req, res) => {
  try {
    const category = await Category.find({ name: req.body.category });
    if (!category) {
      return res.status(400).send("Invalid Category");
    }
    const file = req.file;
    if (!file) {
      return res.status(400).send("No image in the request");
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads`;

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: category[0]._id.toString(),
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviewers: req.body.numReviewers,
      isFeatured: req.body.isFeatured,
    });
    product = await product.save();
    if (!product) {
      return res.status(500).send("The product cannot be created");
    }
    res.send(product);
  } catch (err) {
    res.status(500).send({ success: false, err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid product ID");
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).send("Invalid Category");
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviewers: req.body.numReviewers,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).send("The category cannot be found");
    }
    res.send(product);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviewers: req.body.numReviewers,
      isFeatured: req.body.isFeatured,
    });
    if (!product) {
      return res.status(404).send("The product cannot be found");
    }
    res.send(product);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.delete("/:id", async (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((deletedProduct) => {
      if (deletedProduct) {
        return res
          .status(200)
          .json({ success: true, message: "The product has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product couldn't be found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ count: productCount });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

router.get("/get/featured/:count", async (req, res) => {
  try {
    const count = req.params.count ? req.body.params : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

router.put("/gallery-images/:id", upload.array("images"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid product ID");
  }
  let imagesPaths = [];
  const files = req.files;

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  if (files) {
    files.map((file) => {
      imagesPaths.push(`${basePath}${file.filename}`);
    });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      images: imagesPaths,
    },
    { new: true }
  );

  if (!product) {
    return res.status(404).send("The product cannot be updated");
  }
  res.send(product);
});
module.exports = router;
