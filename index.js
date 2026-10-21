const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: "Downloader API is Running!" });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'Missing URL parameter' });
    }

    let directLink = null;

    // চেষ্টা ১: Cobalt API দিয়ে রিয়েল লিংক বের করা
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

    // চেষ্টা ২: যদি Cobalt কাজ না করে, তবে মূল লিংকটিকেই ফলব্যাক হিসেবে রিটার্ন করা যাতে অ্যাপ ডিরেক্ট ক্যাচ করতে পারে
    if (!directLink) {
        directLink = videoUrl;
    }

    return res.json({
        success: true,
        download_url: directLink
    });
});

module.exports = app;
