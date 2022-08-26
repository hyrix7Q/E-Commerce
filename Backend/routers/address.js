const { Address } = require("../models/address");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  let result = await Address.find({});
  if (!result) {
    return res.status(500).json({ success: false });
  }
  res.status(200).json(result);
});

router.post("/", async (req, res) => {
  let address = new Address({
    shippingAddress1: req.body.shippingAddress1,
    city: req.body.city,
    country: req.body.country,
    phone: req.body.phone,
    zip: req.body.zip,
  });
  address = await address.save();
  if (!address) {
    return res
      .status(500)
      .json({ success: false, error: "address cannot be created" });
  }
  res.status(200).json(address);
});

router.delete("/:id", async (req, res) => {
  Address.findByIdAndRemove(req.params.id)
    .then((deletedAddress) => {
      if (deletedAddress) {
        return res
          .status(200)
          .json({ success: true, message: "Address has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Address has not been deleted!" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: err });
    });
});
module.exports = router;
