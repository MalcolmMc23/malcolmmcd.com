/**
 * Middleware to capture request metadata for logging
 */
function requestLogger(req, res, next) {
  // Extract IP address (handles Railway's proxy headers)
  const getClientIP = (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.headers['x-client-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  };

  // Attach request metadata to req object for use in routes
  req.requestMetadata = {
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'] || 'unknown',
    referrer: req.headers['referer'] || req.headers['referrer'] || 'direct',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      'accept': req.headers['accept'],
      'accept-language': req.headers['accept-language'],
      'accept-encoding': req.headers['accept-encoding'],
    },
  };

  // Log all requests to Railway logs with IP address
  const userAgentShort = req.requestMetadata.userAgent.substring(0, 60);
  console.log(`[${req.requestMetadata.method}] ${req.requestMetadata.path} | IP: ${req.requestMetadata.ip} | UA: ${userAgentShort}${req.requestMetadata.userAgent.length > 60 ? '...' : ''}`);

  next();
}

module.exports = requestLogger;

