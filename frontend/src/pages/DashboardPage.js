import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const [rssFeeds, setRssFeeds] = useState([]);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin');

        if (!token) {
            navigate('/login');
        } else if (isAdmin && isAdmin !== 'undefined' && JSON.parse(isAdmin)) {
            navigate('/admin'); // Redirect to admin page if user is an admin
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <button
                    className='logout-btn'
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter RSS feed URLs, separated by commas"
                    onChange={(e) => setRssFeeds(e.target.value.split(',').map(url => url.trim()))}
                    style={{
                        padding: '10px',
                        width: '100%',
                        marginBottom: '20px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                    }}
                />
                <button
                    className='fetch-gen-btn'
                    onClick={handleFetchFeeds}
                >
                    Fetch and Generate Posts
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h2>Generated LinkedIn Posts</h2>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <p>{post.text}</p>
                            <button
                                className='copy-btn'
                                onClick={() => navigator.clipboard.writeText(post.text)}
                            >
                                Copy
                            </button>
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
