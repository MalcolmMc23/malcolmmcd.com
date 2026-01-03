/**
 * Middleware to capture request metadata for logging
 */

const logStorage = require('../utils/logStorage');

// Validate if IP is a real, routable IP address
function isValidIP(ip) {
  if (!ip || ip === 'unknown') return false;
  
  // Filter out invalid IP ranges
  const invalidRanges = [
    /^0\./,           // 0.0.0.0/8
    /^127\./,         // 127.0.0.0/8 (localhost)
    /^169\.254\./,    // 169.254.0.0/16 (link-local)
    /^224\./,         // 224.0.0.0/4 (multicast)
    /^240\./,         // 240.0.0.0/4 (reserved)
    /^::1$/,          // IPv6 localhost
    /^fe80:/,         // IPv6 link-local
    /^ff00:/,         // IPv6 multicast
  ];
  
  return !invalidRanges.some(range => range.test(ip));
}

// Extract real client IP from Railway proxy headers
function getClientIP(req) {
  // Railway-specific headers (check these first)
  const railwayIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
  if (railwayIP && isValidIP(railwayIP)) {
    return railwayIP;
  }
  
  // Try other common proxy headers
  const headers = [
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'true-client-ip',
    'x-forwarded',
  ];
  
  for (const header of headers) {
    const ip = req.headers[header]?.split(',')[0]?.trim();
    if (ip && isValidIP(ip)) {
      return ip;
    }
  }
  
  // Fallback to connection IP (might be Railway's internal IP)
  const connIP = req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip;
  if (connIP && isValidIP(connIP)) {
    return connIP;
  }
  
  return 'unknown';
}

function requestLogger(req, res, next) {
  const clientIP = getClientIP(req);
  
  // Attach request metadata to req object for use in routes
  req.requestMetadata = {
    ip: clientIP,
    userAgent: req.headers['user-agent'] || 'unknown',
    referrer: req.headers['referer'] || req.headers['referrer'] || 'direct',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      'accept': req.headers['accept'],
      'accept-language': req.headers['accept-language'],
      'accept-encoding': req.headers['accept-encoding'],
      // Log all IP-related headers for debugging
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'x-client-ip': req.headers['x-client-ip'],
      'cf-connecting-ip': req.headers['cf-connecting-ip'],
    },
    // Raw connection info for debugging
    connectionIP: req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown',
  };

  // Enhanced logging with all IP sources for DDoS analysis
  const userAgentShort = req.requestMetadata.userAgent.substring(0, 50);
  const allIPs = [
    `Real IP: ${clientIP}`,
    `X-Forwarded-For: ${req.headers['x-forwarded-for'] || 'none'}`,
    `X-Real-IP: ${req.headers['x-real-ip'] || 'none'}`,
    `Connection IP: ${req.requestMetadata.connectionIP}`,
  ].join(' | ');
  
  console.log(`[${req.requestMetadata.method}] ${req.requestMetadata.path} | ${allIPs} | UA: ${userAgentShort}${req.requestMetadata.userAgent.length > 50 ? '...' : ''}`);

  // Automatically store request for attack analysis (skip static assets)
  if (!req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$/)) {
    const logEntry = {
      timestamp: req.requestMetadata.timestamp,
      type: 'page_view',
      ip: req.requestMetadata.ip,
      userAgent: req.requestMetadata.userAgent,
      referrer: req.requestMetadata.referrer,
      path: req.requestMetadata.path,
      fingerprint: 'unknown', // Will be set if client sends it
      headers: req.requestMetadata.headers,
    };
    
    // Store asynchronously to not block the request
    logStorage.storeLog(logEntry).catch(err => {
      console.error('Error storing request log:', err);
    });
  }

  next();
}

module.exports = requestLogger;

