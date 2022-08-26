function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(500).json({ message: "the user is Unauthorized" });
  }
  if (err.name === "ValidationError") {
    return res.status(500).json({ message: err });
  }

  return res.status(500).json(err);
}

module.exports = errorHandler;
