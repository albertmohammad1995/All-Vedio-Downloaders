
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: true,
        message: 'Video Downloader API is Running'
    });
});

app.get('/api/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing URL parameter'
        });
    }

    let parsed;

    try {
        parsed = new URL(videoUrl);
    } catch {
        return res.status(400).json({
            success: false,
            error: 'Invalid video URL'
        });
    }

    if (parsed.protocol !== 'https:') {
        return res.status(400).json({
            success: false,
            error: 'Only HTTPS URLs are accepted'
        });
    }

    const videoPattern = /\.(mp4|webm|mov|m4v)$/i;

    if (!videoPattern.test(parsed.pathname)) {
        return res.status(400).json({
            success: false,
            error: 'Use a direct video file URL'
        });
    }

    return res.json({
        success: true,
        download_url: parsed.href
    });
});

module.exports = app;
