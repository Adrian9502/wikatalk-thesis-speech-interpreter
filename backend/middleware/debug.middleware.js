const debugMiddleware = (req, res, next) => {
  console.log(`[DEBUG] Request: ${req.method} ${req.originalUrl}`);
  console.log(`[DEBUG] Headers: ${JSON.stringify(req.headers)}`);
  console.log(`[DEBUG] Params: ${JSON.stringify(req.params)}`);
  console.log(`[DEBUG] Body: ${JSON.stringify(req.body)}`);
  
  // Store original send method
  const originalSend = res.send;
  
  // Override send method to log responses
  res.send = function(body) {
    console.log(`[DEBUG] Response ${res.statusCode}: ${typeof body === 'object' ? JSON.stringify(body) : body.substring(0, 100)}`);
    return originalSend.apply(this, arguments);
  };
  
  next();
};

module.exports = debugMiddleware;