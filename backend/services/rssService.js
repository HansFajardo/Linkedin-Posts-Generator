const RSSParser = require('rss-parser');
const parser = new RSSParser();

async function fetchRSSFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items;
  } catch (err) {
    throw new Error(`Failed to fetch RSS feed: ${err.message}`);
  }
}

module.exports = fetchRSSFeed;
