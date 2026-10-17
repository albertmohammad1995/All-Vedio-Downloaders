const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: "Video Downloader API is Running!" });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.json({ success: false, error: "Missing URL parameter" });
    }

    try {
        const apiRes = await fetch('https://co.vosh.lol/api/json', {
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

        const data = await apiRes.json();
        let directLink = null;

        if (data) {
            if (data.url) {
                directLink = data.url;
            } else if (data.picker && data.picker.length > 0) {
                directLink = data.picker[0].url;
            } else if (data.tunnel) {
                directLink = data.tunnel;
            }
        }

        if (directLink) {
            return res.json({
                success: true,
                download_url: directLink
            });
        } else {
            return res.json({
                success: false,
                error: "Could not extract link",
                details: data
            });
        }

    } catch (err) {
        return res.json({
            success: false,
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
