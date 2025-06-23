// routes/shortUrlRoutes.js

const express = require('express');
const router = express.Router();

const urlStore = {};
const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return [...Array(6)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

// Create short URL
router.post('/shorturls', (req, res) => {
    const { url, validity, shortcode } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    let shortCodeToUse = shortcode || generateShortCode();

    if (urlStore[shortCodeToUse]) {
        return res.status(409).json({ error: 'Shortcode already exists' });
    }

    const validityMinutes = validity ? parseInt(validity) : 30;
    const expiry = new Date(Date.now() + validityMinutes * 60 * 1000);

    urlStore[shortCodeToUse] = {
        url,
        createdAt: new Date(),
        expiry,
        clicks: []
    };

    return res.status(201).json({
        shortLink: `${req.protocol}://${req.get('host')}/${shortCodeToUse}`,
        expiry: expiry.toISOString()
    });
});

// Redirect
router.get('/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    const entry = urlStore[shortcode];

    if (!entry) {
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    if (new Date() > entry.expiry) {
        return res.status(410).json({ error: 'Short link expired' });
    }

    entry.clicks.push({
        timestamp: new Date(),
        referrer: req.get('referer') || null,
        userAgent: req.get('user-agent') || null,
        ip: req.ip
    });

    res.redirect(entry.url);
});

// Statistics
router.get('/shorturls/:shortcode', (req, res) => {
    const { shortcode } = req.params;
    const entry = urlStore[shortcode];

    if (!entry) {
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    res.json({
        totalClicks: entry.clicks.length,
        originalUrl: entry.url,
        createdAt: entry.createdAt,
        expiry: entry.expiry,
        clickDetails: entry.clicks
    });
});

module.exports = router;
