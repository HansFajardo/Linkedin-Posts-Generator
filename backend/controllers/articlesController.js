const Parser = require('rss-parser');
const OpenAI = require('openai');
const parser = new Parser();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const fetchTodaysItems = async (rssUrls) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    let allItems = [];

    for (const url of rssUrls) {
        try {
            const feed = await parser.parseURL(url);
            const todaysItems = feed.items.filter(item => {
                let pubDate;
                
                try {
                    // Attempt to parse the publication date
                    pubDate = new Date(item.pubDate);
                    if (isNaN(pubDate)) {
                        // If parsing fails, try a fallback
                        pubDate = new Date(Date.parse(item.pubDate));
                    }
                } catch (error) {
                    console.error(`Error parsing date for item in feed ${url}: ${error.message}`);
                    return false; // Skip this item if date parsing fails
                }

                if (!pubDate || isNaN(pubDate.getTime())) {
                    console.warn(`Invalid date found in feed ${url}: ${item.pubDate}`);
                    return false; // Skip this item if date is invalid
                }

                const formattedPubDate = pubDate.toISOString().split('T')[0];
                return formattedPubDate === today;
            });
            allItems.push(...todaysItems);
        } catch (err) {
            console.error(`Error fetching RSS feed ${url}: ${err.message}`);
        }
    }
    return allItems;
};

const createOpenAiPrompt = (articles, context) => {
    let promptText = `You act as an editor of the newsfeed. Your job is to pick the top articles based on the following previews and provide a LinkedIn post for each, considering the audience might include executives at the C-level and VP of organizations. However, if the content doesn't match, summarize it in a professional manner.\n\n`;
    articles.forEach((article, index) => {
        promptText += `***ID ${index + 1}: \n${article.description}\n`;
    });
    return promptText;
};

const getTopArticles = async (articles, context) => {
    const promptText = createOpenAiPrompt(articles, context);
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: promptText }
        ],
        max_tokens: 50,  // Adjust as necessary
    });
    const result = response.choices[0].message.content.trim();
    const topArticleIds = result.split(',').map(id => parseInt(id.trim()));
    return topArticleIds.map(id => articles[id - 1]);
};

const createLinkedInPrompt = (articles, context) => {
    let promptText = `You act as an editor of the newsfeed. Based on the articles provided, create LinkedIn posts. If the content is not relevant to the provided context ("${context}"), summarize the content professionally for a general audience.\n\n`;
    articles.forEach(article => {
        if (article && article.link) {
            promptText += `${article.link}\n`;
        } else {
            console.warn("Skipping article due to missing link:", article);
        }
    });
    return promptText;
};

const generateLinkedInPosts = async (articles, context) => {
    const promptText = createLinkedInPrompt(articles, context);
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: promptText }
        ],
        max_tokens: 1500,  // Increase token limit to ensure the full response is captured
    });
    
    const result = response.choices[0].message.content.trim();
    
    // Refine the split logic to correctly handle multiple posts
    const posts = result.split(/\d+\.\sLinkedIn Post/g).filter(post => post.trim().length > 0).map(post => post.trim());

    return posts;
};


const processArticles = async (rssUrls, context) => {
    try {
        const articles = await fetchTodaysItems(rssUrls);
        if (articles.length === 0) {
            throw new Error('No articles found for today.');
        }

        const topArticles = await getTopArticles(articles, context);
        const linkedInPosts = await generateLinkedInPosts(topArticles, context);
        
        return linkedInPosts;
    } catch (err) {
        console.error('Error processing articles:', err.message);
        throw err;
    }
};

module.exports = {
    processArticles,
};
