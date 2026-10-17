const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: "Multi-Source Video Downloader API is Running!" });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.json({ success: false, error: "Missing URL parameter" });
    }

    // Method 1: Cobalt Engine (vosh.lol)
    try {
        const cobaltRes = await fetch('https://co.vosh.lol/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720'
            })
        });

        const data = await cobaltRes.json();
        let directLink = null;

        if (data) {
            if (data.url) directLink = data.url;
            else if (data.picker && data.picker.length > 0) directLink = data.picker[0].url;
            else if (data.tunnel) directLink = data.tunnel;
        }

        if (directLink) {
            return res.json({ success: true, download_url: directLink, source: "Cobalt Primary" });
        }
    } catch (e) {
        console.log("Method 1 Failed, trying Method 2...");
    }

    // Method 2: Cobalt Public Instances Fallback
    try {
        const cobaltRes2 = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720'
            })
        });

        const data2 = await cobaltRes2.json();
        let directLink2 = null;

        if (data2) {
            if (data2.url) directLink2 = data2.url;
            else if (data2.picker && data2.picker.length > 0) directLink2 = data2.picker[0].url;
            else if (data2.tunnel) directLink2 = data2.tunnel;
        }

        if (directLink2) {
            return res.json({ success: true, download_url: directLink2, source: "Cobalt Secondary" });
        }
    } catch (e) {
