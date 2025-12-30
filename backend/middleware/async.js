// This middleware handles async/await errors by wrapping async route handlers
// and passing any errors to the Express error handling middleware

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
