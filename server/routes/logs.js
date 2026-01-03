const express = require('express');
const rateLimit = require('express-rate-limit');
const logStorage = require('../utils/logStorage');

const router = express.Router();

// Rate limiting for log endpoints
const logRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many log requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/log/request
 * Log a page view or general request
 */
router.post('/log/request', logRateLimiter, async (req, res) => {
    try {
        const { fingerprint, path: clientPath, type = 'page_view' } = req.body;
        const metadata = req.requestMetadata || {};

        const logEntry = {
            timestamp: metadata.timestamp || new Date().toISOString(),
            type,
            ip: metadata.ip,
            userAgent: metadata.userAgent,
            referrer: metadata.referrer,
            path: clientPath || metadata.path,
            fingerprint: fingerprint || 'unknown',
            headers: metadata.headers,
        };

        const storedLog = await logStorage.storeLog(logEntry);

        res.status(200).json({
            success: true,
            suspicious: storedLog.suspicious,
            reasons: storedLog.reasons,
        });
    } catch (error) {
        console.error('Error logging request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log request',
        });
    }
});

/**
 * POST /api/log/form
 * Log a form submission
 */
router.post('/log/form', logRateLimiter, async (req, res) => {
    try {
        const { fingerprint, formName, formData } = req.body;
        const metadata = req.requestMetadata || {};

        const logEntry = {
            timestamp: metadata.timestamp || new Date().toISOString(),
            type: 'form_submission',
            ip: metadata.ip,
            userAgent: metadata.userAgent,
            referrer: metadata.referrer,
            path: metadata.path,
            fingerprint: fingerprint || 'unknown',
            headers: metadata.headers,
            formName: formName || 'unknown',
            formData: formData ? {
                // Only log form field names, not values (for privacy)
                fields: Object.keys(formData),
                fieldCount: Object.keys(formData).length,
            } : null,
        };

        const storedLog = await logStorage.storeLog(logEntry);

        res.status(200).json({
            success: true,
            suspicious: storedLog.suspicious,
            reasons: storedLog.reasons,
        });
    } catch (error) {
        console.error('Error logging form submission:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log form submission',
        });
    }
});

/**
 * GET /api/logs
 * Retrieve logs (for debugging/viewing)
 * Note: In production, this should be protected with authentication
 */
router.get('/logs', logRateLimiter, (req, res) => {
    try {
        const limit = parseInt(req.query.limit || '100', 10);
        const filterSuspicious = req.query.suspicious === 'true';
        const ip = req.query.ip;

        let logs;
        if (ip) {
            logs = logStorage.getLogsByIP(ip);
        } else {
            logs = logStorage.getLogs(limit, filterSuspicious);
        }

        res.status(200).json({
            success: true,
            count: logs.length,
            logs,
        });
    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve logs',
        });
    }
});

/**
 * GET /api/attack-analysis
 * Analyze logs to identify DDoS patterns and top attacking IPs
 */
router.get('/attack-analysis', logRateLimiter, (req, res) => {
    try {
        const logs = logStorage.getLogs(10000); // Get more logs for analysis

        // Count requests per IP
        const ipCounts = new Map();
        const ipDetails = new Map();

        logs.forEach(log => {
            const ip = log.ip;
            if (ip && ip !== 'unknown') {
                ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);

                if (!ipDetails.has(ip)) {
                    ipDetails.set(ip, {
                        ip,
                        count: 0,
                        userAgents: new Set(),
                        paths: new Set(),
                        firstSeen: log.timestamp,
                        lastSeen: log.timestamp,
                        suspicious: log.suspicious,
                    });
                }

                const details = ipDetails.get(ip);
                details.count++;
                if (log.userAgent) details.userAgents.add(log.userAgent);
                if (log.path) details.paths.add(log.path);
                if (log.timestamp < details.firstSeen) details.firstSeen = log.timestamp;
                if (log.timestamp > details.lastSeen) details.lastSeen = log.timestamp;
                if (log.suspicious) details.suspicious = true;
            }
        });

        // Sort by request count (descending)
        const topIPs = Array.from(ipDetails.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 50)
            .map(details => ({
                ...details,
                userAgents: Array.from(details.userAgents),
                paths: Array.from(details.paths),
            }));

        // Calculate statistics
        const totalRequests = logs.length;
        const uniqueIPs = ipCounts.size;
        const suspiciousIPs = topIPs.filter(ip => ip.suspicious).length;

        res.status(200).json({
            success: true,
            analysis: {
                totalRequests,
                uniqueIPs,
                suspiciousIPs,
                topAttackingIPs: topIPs,
                timeRange: {
                    start: logs[0]?.timestamp,
                    end: logs[logs.length - 1]?.timestamp,
                },
            },
        });
    } catch (error) {
        console.error('Error analyzing attacks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze attacks',
        });
    }
});

module.exports = router;

