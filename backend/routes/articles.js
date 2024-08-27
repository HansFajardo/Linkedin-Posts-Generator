const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const { processArticles } = require('../controllers/articlesController');

const openaiService = require('../services/openaiService');

router.get('/validate-feed', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url);
        await xml2js.parseStringPromise(response.data);
        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(400).json({ valid: false, error: 'Invalid RSS feed' });
    }
});

router.post('/generate', async (req, res) => {
    const { rssUrls, context } = req.body;
    try {
        const posts = await processArticles(rssUrls, context);
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/fetch', async (req, res) => {
    const { feeds } = req.body;

    if (!feeds || feeds.length === 0) {
        return res.status(400).json({ success: false, message: 'No RSS feeds provided' });
    }

    try {
        const articles = [];
        for (const feed of feeds) {
            const response = await fetch(feed);
            const xml = await response.text();
            const result = await xml2js.parseStringPromise(xml);

            console.log('Parsed XML result:', result);

            if (result.rss && result.rss.channel) {
                // Handling RSS 2.0 format
                const items = result.rss.channel[0].item || [];
                const parsedArticles = items.map(item => ({
                    title: item.title ? item.title[0] : 'No title',
                    description: item.description ? item.description[0] : 'No description',
                    link: item.link ? item.link[0] : 'No link'
                }));
                articles.push(...parsedArticles);
            } else if (result.feed && result.feed.entry) {
                // Handling Atom format
                const items = result.feed.entry || [];
                const parsedArticles = items.map(entry => ({
                    title: entry.title ? entry.title[0] : 'No title',
                    description: entry.summary ? entry.summary[0] : 'No description',
                    link: entry.link && entry.link[0] && entry.link[0].$.href ? entry.link[0].$.href : 'No link'
                }));
                articles.push(...parsedArticles);
            } else {
                console.error('Unexpected XML structure:', result);
            }
        }
        res.json({ articles });
    } catch (error) {
        console.error('Error fetching or parsing RSS feeds:', error);
        res.status(500).json({ success: false, message: 'Error fetching or parsing RSS feeds' });
    }
});

router.post('/generate-posts', async (req, res) => {
    const { previews, context } = req.body;

    if (!previews || !previews.length) {
        return res.status(400).json({ success: false, message: 'No previews provided' });
    }

    try {
        const posts = await openaiService.generatePosts(previews, context);
        res.json({ success: true, posts });
    } catch (error) {
        console.error('Error generating posts:', error);
        res.status(500).json({ success: false, message: 'Error generating posts' });
    }
});

module.exports = router;
