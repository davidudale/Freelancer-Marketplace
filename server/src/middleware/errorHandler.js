const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(err.message);
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};

export { notFoundHandler, errorHandler };
