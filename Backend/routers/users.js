const { User } = require("../models/user");
const { Notification } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Product } = require("../models/product");
const { mongo } = require("mongoose");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

router.get("/:id/notifications/length", async (req, res) => {
  try {
    const userList = await User.findOne({
      _id: req.params.id,
    });

    if (!userList) {
      return res.status(500).json({ success: false });
    }

    let notifications = [];

    userList.notifications.map((item) => {
      if (!item.seen) {
        notifications.push(item);
      }
    });

    return res.status(200).send(notifications.length.toString());
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get(`/:id/notifications/notSeen`, async (req, res) => {
  const userList = await User.findOne({
    _id: req.params.id,
  }).populate({
    path: "notifications",
    populate: {
      path: "order",
      populate: {
        path: "orderItems",
        populate: "product",
      },
    },
  });

  if (!userList) {
    return res.status(500).json({ success: false });
  }
  let notifications = [];

  userList.notifications.map((item) => {
    if (!item.seen) {
      notifications.push(item);
    }
  });
  return res.send(notifications);
});

router.get(`/:id/notifications`, async (req, res) => {
  const userList = await User.findOne({
    _id: req.params.id,
  }).populate("order");

  if (!userList) {
    return res.status(500).json({ success: false });
  }

  return res.send(userList.notifications);
});

router.get(`/:id/products`, async (req, res) => {
  let result = Product.find({
    user: mongo.ObjectId(req.params.id),
  }).populate("user");

  let lengthSearch = Product.find({
    user: mongo.ObjectId(req.params.id),
  }).populate("user");

  const length = (await lengthSearch).length;

  const limit = Number(req.query.limit) || 5;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  if (!result) {
    res.status(500).json({ success: false });
  }
  const productList = await result;

  res.send({ length, products: productList });
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user couldn't be found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) {
    return res.status(400).send("the user cannot be created!");
  }

  res.send(user);
});

// router.post("/", async (req, res) => {
//   let user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     passwordHash: bcrypt.hashSync(req.body.password, 10),
//     phone: req.body.phone,
//     isAdmin: req.body.isAdmin,
//     street: req.body.street,
//     apartment: req.body.apartment,
//     zip: req.body.zip,
//     city: req.body.city,
//     country: req.body.country,
//   });
//   user = await user.save();
//   if (!user) {
//     return res.status(404).send("The user cannot be created");
//   }
//   res.send(user);
// });

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  console.log(secret);

  if (!user) {
    return res.status(400).send("The user was not found");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    console.log(token);
    res.status(200).send({ user: user.email, token });
  } else {
    res.status(400).send("Password is wrong");
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
      return res.status(500).json({ success: false });
    }
    res.status(200).json({ count: userCount });
  } catch (err) {
    res.status(500).json({ success: false, err });
  }
});

router.patch("/:id/:notifId", async (req, res) => {
  try {
    if (!req.body.seen) {
      var user = await User.findByIdAndUpdate(req.params.id, {
        $push: {
          notifications: {
            notificationType: req.body.orderType,
            message: req.body.orderMessage,
            order: req.body.order,
          },
        },
      });
    } else {
      var user = await User.updateMany(
        { "notifications._id": req.params.notifId },
        {
          $set: {
            "notifications.$.seen": true,
          },
        }
      );
    }
    if (!user) {
      return res.status(404).send("The user cannot be found");
    }

    res.send(user);
  } catch (error) {
    return res.status(400).json({ success: false, error });
  }
});

router.patch("/:userId/notifications/:orderId", async (req, res) => {
  try {
    var user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("The user cannot be found");
    }
    // console.log(notifications[0]._id);

    // console.log(user, req.params.orderId);
    var notifications = user.notifications.filter(
      (not) => not.order.toString() === req.params.orderId
    );
    var userNotification = await User.updateMany(
      { "notifications._id": notifications[0]._id },
      {
        $set: {
          "notifications.$.seen": false,
          "notifications.$.message":
            "Your tracking has been updated ! Check it out",
          "notifications.$.notificationType": "TrackingUpdate",
          "notifications.$.date": Date.now(),
        },
      }
    );
    res.send(userNotification);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((deletedUser) => {
      if (deletedUser) {
        return res
          .status(200)
          .json({ success: true, message: "The user has been deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user couldn't be found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.delete("/notifications/delete/order/:id", async (req, res) => {
  try {
    const user = await User.updateMany(
      {
        "notifications.order": req.params.id,
      },
      {
        $pull: {
          notifications: { order: req.params.id },
        },
      }
    );
    console.log("hhh");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User was not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
});

module.exports = router;
