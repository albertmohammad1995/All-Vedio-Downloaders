const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: true,
        message: 'API is Running!'
    });
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing URL parameter'
        });
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(videoUrl);
    } catch (e) {
        return res.status(400).json({
            success: false,
            error: 'Invalid URL'
        });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({
            success: false,
            error: 'Only HTTP and HTTPS URLs are accepted'
        });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(
            'https://co.vosh.lol/api/json',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: videoUrl,
                    vQuality: '720'
                }),
                signal: controller.signal
            }
        );

        const responseText = await response.text();

        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return res.status(502).json({
                success: false,
                error: 'Upstream service returned invalid JSON',
                upstream_status: response.status
            });
        }

        if (!response.ok) {
            return res.status(502).json({
                success: false,
                error: 'Upstream service request failed',
                upstream_status: response.status
            });
        }

        let directLink = null;

        if (typeof data.url === 'string') {
            directLink = data.url;
        } else if (
            Array.isArray(data.picker) &&
            data.picker.length > 0
        ) {
            directLink = data.picker[0].url;
        } else if (typeof data.tunnel === 'string') {
            directLink = data.tunnel;
        }

        if (directLink) {
            let linkUrl;

            try {
                linkUrl = new URL(directLink);
            } catch (e) {
                linkUrl = null;
            }

            if (
                linkUrl &&
                ['http:', 'https:'].includes(linkUrl.protocol)
            ) {
                return res.json({
                    success: true,
                    download_url: directLink
                });
            }
        }

        return res.status(502).json({
            success: false,
            error: 'Upstream service did not return a valid direct URL'
        });

    } catch (e) {
        const timedOut = e.name === 'AbortError';

        console.error('Upstream request failed:', e.message);

        return res.status(502).json({
            success: false,
            error: timedOut
                ? 'Upstream service timed out'
                : 'Could not contact upstream service'
        });

    } finally {
        clearTimeout(timeout);
    }
});

module.exports = app;
