const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.status) {
    filter = { status: req.query.status };
  }
  if (req.query.user) {
    filter = { ...filter, user: req.query.user };
  }
  const orderList = await Order.find(filter)
    .populate({ path: "orderItems", populate: { path: "product" } })
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }

  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name ")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem,
      });
      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    user: req.body.user,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) {
    return res.status(404).send("The order cannot be created");
  }
  res.send(order);
});

router.put("/:id", async (req, res) => {
  try {
    // const orderInsert = await Order.insertOne({
    //   tracking:[{Transfer:{Transfer:false},Current}]
    // })
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).send("The order cannot be found");
    }
    res.send(order);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!order) {
      return res.status(404).send("The order cannot be found");
    }
    res.send(order);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.patch("/:id/tracking", async (req, res) => {
  try {
    var order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        "tracking.Transfer": {
          Transfer: req.body.transfer,
          date: Date.now(),
        },

        "tracking.Current": { Current: req.body.current, date: Date.now() },
        "tracking.Arrived": { Arrived: req.body.arrived, date: Date.now() },
      },

      { new: true }
    );
    if (!order) {
      return res.status(404).send("The order cannot be found");
    }
    res.send(order);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (deletedOrder) => {
      if (deletedOrder) {
        await deletedOrder.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });

        return res
          .status(200)
          .json({ success: true, message: "The Order has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Order couldn't be found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalSales: totalSales.pop().totalsales });
});

router.get(`/get/userorders/:userId`, async (req, res) => {
  const userOdersList = await Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOdersList) {
    res.status(500).json({ success: false });
  }

  res.send(userOdersList);
});

module.exports = router;
