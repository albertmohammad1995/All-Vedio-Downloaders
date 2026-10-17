const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: true, message: "Production Video Downloader API is Running!" });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.json({ success: false, error: "Missing URL parameter" });
    }

    try {
        // Primary Request to Cobalt API
        const response = await fetch('https://co.vosh.lol/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',
                filenamePattern: 'classic'
            })
        });

        const data = await response.json();
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
        }

        // Secondary Backup Public Instance
        const responseBackup = await fetch('https://api.cobalt.tools/api/json', {
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

        const dataBackup = await responseBackup.json();
        if (dataBackup) {
            if (dataBackup.url) directLink = dataBackup.url;
            else if (dataBackup.picker && dataBackup.picker.length > 0) directLink = dataBackup.picker[0].url;
            else if (dataBackup.tunnel) directLink = dataBackup.tunnel;
        }

        if (directLink) {
            return res.json({
                success: true,
                download_url: directLink
            });
        }

        return res.json({
            success: false,
            error: "Could not extract direct stream link from this URL."
        });

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
