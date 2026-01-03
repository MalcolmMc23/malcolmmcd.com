const fs = require('fs');
const path = require('path');

class LogStorage {
  constructor() {
    this.logs = [];
    this.ipRequestCounts = new Map(); // Track requests per IP
    this.fingerprintCounts = new Map(); // Track requests per fingerprint
    this.storageType = process.env.LOG_STORAGE_TYPE || 'memory';
    this.externalApiUrl = process.env.EXTERNAL_LOG_API_URL;
    this.rateLimitThreshold = parseInt(process.env.RATE_LIMIT_THRESHOLD || '10', 10);
    this.rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute default
    
    // File storage path
    this.logFilePath = path.join(__dirname, '../../logs/security.log');
    
    // Initialize log directory if using file storage
    if (this.storageType === 'file') {
      const logDir = path.dirname(this.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Detect suspicious patterns in a log entry
   */
  detectSuspiciousPatterns(logEntry) {
    const reasons = [];
    const suspicious = false;

    // Check for missing user agent
    if (!logEntry.userAgent || logEntry.userAgent === 'unknown') {
      reasons.push('missing_user_agent');
    }

    // Check for known bot user agents
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /go-http-client/i,
      /java/i,
    ];

    if (logEntry.userAgent && botPatterns.some(pattern => pattern.test(logEntry.userAgent))) {
      reasons.push('bot_user_agent');
    }

    // Check rate limiting per IP
    const ipCount = this.getIPRequestCount(logEntry.ip);
    if (ipCount >= this.rateLimitThreshold) {
      reasons.push(`rate_limit_exceeded_${ipCount}_requests`);
    }

    // Check for duplicate fingerprints from different IPs (bot farm)
    if (logEntry.fingerprint) {
      const fingerprintCount = this.getFingerprintCount(logEntry.fingerprint);
      if (fingerprintCount > 1 && logEntry.fingerprint !== 'unknown') {
        reasons.push(`duplicate_fingerprint_${fingerprintCount}_occurrences`);
      }
    }

    // Check for suspicious referrer patterns
    if (logEntry.referrer && logEntry.referrer !== 'direct') {
      const suspiciousReferrers = [
        /spam/i,
        /bot/i,
        /crawler/i,
        /\.tk$/i,
        /\.ml$/i,
        /\.ga$/i,
      ];
      if (suspiciousReferrers.some(pattern => pattern.test(logEntry.referrer))) {
        reasons.push('suspicious_referrer');
      }
    }

    // Check for missing or suspicious headers
    if (!logEntry.headers || !logEntry.headers['accept']) {
      reasons.push('missing_headers');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Get request count for an IP address within the rate limit window
   */
  getIPRequestCount(ip) {
    const now = Date.now();
    const ipLogs = this.ipRequestCounts.get(ip) || [];
    
    // Filter logs within the rate limit window
    const recentLogs = ipLogs.filter(timestamp => now - timestamp < this.rateLimitWindow);
    this.ipRequestCounts.set(ip, recentLogs);
    
    return recentLogs.length;
  }

  /**
   * Get fingerprint occurrence count
   */
  getFingerprintCount(fingerprint) {
    return this.fingerprintCounts.get(fingerprint) || 0;
  }

  /**
   * Store a log entry
   */
  async storeLog(logEntry) {
    // Add detection results
    const detection = this.detectSuspiciousPatterns(logEntry);
    logEntry.suspicious = detection.suspicious;
    logEntry.reasons = detection.reasons;

    // Update IP request count
    const ipLogs = this.ipRequestCounts.get(logEntry.ip) || [];
    ipLogs.push(Date.now());
    this.ipRequestCounts.set(logEntry.ip, ipLogs);

    // Update fingerprint count
    if (logEntry.fingerprint) {
      const currentCount = this.fingerprintCounts.get(logEntry.fingerprint) || 0;
      this.fingerprintCounts.set(logEntry.fingerprint, currentCount + 1);
    }

    // Store based on storage type
    switch (this.storageType) {
      case 'file':
        await this.storeToFile(logEntry);
        break;
      case 'api':
        await this.storeToAPI(logEntry);
        break;
      case 'memory':
      default:
        this.storeToMemory(logEntry);
        break;
    }

    // Log suspicious activity to console
    if (logEntry.suspicious) {
      console.warn('⚠️  Suspicious activity detected:', {
        ip: logEntry.ip,
        path: logEntry.path,
        reasons: logEntry.reasons,
        timestamp: logEntry.timestamp,
      });
    }

    return logEntry;
  }

  /**
   * Store log in memory
   */
  storeToMemory(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs in memory to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  /**
   * Store log to file
   */
  async storeToFile(logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';
    try {
      await fs.promises.appendFile(this.logFilePath, logLine);
    } catch (error) {
      console.error('Error writing to log file:', error);
      // Fallback to memory storage
      this.storeToMemory(logEntry);
    }
  }

  /**
   * Store log to external API
   */
  async storeToAPI(logEntry) {
    if (!this.externalApiUrl) {
      console.warn('External API URL not configured, falling back to memory storage');
      this.storeToMemory(logEntry);
      return;
    }

    try {
      const fetch = (await import('node-fetch')).default;
      await fetch(this.externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Error sending log to external API:', error);
      // Fallback to memory storage
      this.storeToMemory(logEntry);
    }
  }

  /**
   * Get logs (for viewing/debugging)
   */
  getLogs(limit = 100, filterSuspicious = false) {
    let logs = this.logs;
    
    if (filterSuspicious) {
      logs = logs.filter(log => log.suspicious);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Get logs by IP
   */
  getLogsByIP(ip) {
    return this.logs.filter(log => log.ip === ip);
  }
}

// Export singleton instance
module.exports = new LogStorage();

