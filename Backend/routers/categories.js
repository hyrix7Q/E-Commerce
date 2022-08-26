const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category couldn't be found" });
    }
    res.status(201).send(category);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) {
    return res.status(404).send("The category cannot be created");
  }
  res.send(category);
});

router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((deletedCategory) => {
      if (deletedCategory) {
        return res
          .status(200)
          .json({ success: true, message: "The category has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category couldn't be found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );
    if (!category) {
      return res.status(404).send("The category cannot be found");
    }
    res.send(category);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

module.exports = router;
