const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: "API is Running!" });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'Missing URL parameter' });
    }

    let directLink = null;

    // Cobalt ba onno free api diye try kora
    try {
        const response = await fetch('https://co.vosh.lol/api/json', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl, vQuality: '720' })
        });
        const data = await response.json();
        if (data) {
            if (data.url) directLink = data.url;
            else if (data.picker && data.picker.length > 0) directLink = data.picker[0].url;
            else if (data.tunnel) directLink = data.tunnel;
        }
    } catch (e) {}

    // Jodi API theke link na paoa jay, tobe faka ba bhul link pathaben na, ebong error return korbe jate 31B file name na
    if (directLink) {
        return res.json({
            success: true,
            download_url: directLink
        });
    } else {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch direct video stream.'
        });
    }
});

module.exports = app;
