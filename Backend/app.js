const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const connectDB = require("./db/connect");
const productsRouter = require("./routers/products");
const categoriesRoutes = require("./routers/categories");
const usersRoutes = require("./routers/users");
const ordersRoutes = require("./routers/orders");
const addressRoutes = require("./routers/address");
const cors = require("cors");
// const authJwt = require("./helpers/jwt");
var { expressjwt: jwt } = require("express-jwt");
const errorHandler = require("./helpers/error-handler");
async function isRevokedHandler(req, token) {
  if (!token.payload.isAdmin) {
    return true;
  }

  return false;
}
require("dotenv/config");

app.use(cors());
app.options("*", cors());

//middleware

//this one is make our backend server understand/recognize the JSON
app.use(bodyParser.json());
//this one is see the requests that are coming from the frontend
app.use(morgan("tiny"));
const secret = process.env.secret;
app.use(
  jwt({
    secret: secret,
    algorithms: ["HS256"],
    // isRevoked: isRevokedHandler,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },

      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `/api/v1/users/login`,
      `/api/v1/users/register`,
    ],
  })
);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

const api = process.env.API_URL;

//routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/address`, addressRoutes);

const start = async () => {
  try {
    //connectDB
    await connectDB(process.env.MONGO_URI);
    app.listen(2000, console.log(`Server is listening to port 2000}`));
  } catch (error) {
    console.log(error);
  }
};

start();
