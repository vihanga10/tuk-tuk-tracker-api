const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  let status  = err.statusCode || 500;
  let message = err.message    || 'Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
    status  = 400;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    status  = 400;
  }
  res.status(status).json({ success: false, message });
};

export default errorHandler;