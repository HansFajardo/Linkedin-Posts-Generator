import React, { useState } from 'react';

function DashboardPage() {
    const [rssFeeds, setRssFeeds] = useState([]);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null); // To display errors

    const handleFetchFeeds = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/articles/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feeds: rssFeeds }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched articles:', data);
            if (data.articles && data.articles.length > 0) {
                const previews = data.articles.map(article => ({
                    title: article.title,
                    description: article.description,
                    link: article.link
                }));
                await handleGeneratePosts(previews);
            } else {
                setError('No articles found.');
            }
        } catch (err) {
            console.error('Error in handleFetchFeeds:', err);
            setError('Error fetching RSS feeds.');
        }
    };


    const handleGeneratePosts = async (articles) => {
        try {
            const response = await fetch('http://localhost:5000/api/articles/generate-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previews: articles, context: 'Your OpenAI context here' }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Generated posts:', data);
            if (data.posts && data.posts.length > 0) {
                setPosts(data.posts);
                setError(null); // Clear any previous errors
            } else {
                setError('No posts generated.');
            }
        } catch (err) {
            console.error('Error in handleGeneratePosts:', err);
            setError('Error generating posts.');
        }
    };

    return (
        <div className="container">
            <h1>Dashboard</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter RSS feed URLs, separated by commas"
                    onChange={(e) => setRssFeeds(e.target.value.split(',').map(url => url.trim()))}
                />
                <button onClick={handleFetchFeeds}>Fetch and Generate Posts</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h2>Generated LinkedIn Posts</h2>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index}>
                            <p>{post.text}</p>
                            <button onClick={() => navigator.clipboard.writeText(post.text)}>Copy</button>
                        </div>
                    ))
                ) : (
                    <p>No posts to display.</p>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
