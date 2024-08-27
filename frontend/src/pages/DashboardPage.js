import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const [rssFeeds, setRssFeeds] = useState([]);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [context, setContext] = useState("articles relevant to executives at C-level and VP of healthcare organizations such as Health Plans, Hospitals, Healthcare Vendors, Clearinghouses");
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

    const handleFetchAndGenerate = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/articles/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rssUrls: rssFeeds, context }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate LinkedIn posts.');
            }

            const data = await response.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Error generating LinkedIn posts:', error);
            setError('Error generating LinkedIn posts.');
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
                />
                <input
                    type="text"
                    placeholder="Enter OpenAI context (optional)"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
                <button
                    className='fetch-gen-btn'
                    onClick={handleFetchAndGenerate}
                >
                    Fetch and Generate Posts
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h2>Generated LinkedIn Posts</h2>
                {posts.length > 0 ? (
                    posts.map((post, index) => {
                        // Clean up the post content
                        const cleanedPost = post.replace(/^:\s*"|"$|:\s*/g, '').trim();
    
                        // Predefined hashtags
                        const hashtags = "#EHR #DigitalHealth #Oncology #HealthcareIT #DataIntegration";
    
                        // Example link (in a real case, you'd fetch this from the article data)
                        const link = "https://www.healthcareitnews.com/news/anz/alfred-health-onboards-cancer-records-oracle-ehr";
    
                        // Combine post content with hashtags and link
                        const fullPost = `${cleanedPost}\n\n${hashtags}\n\n${link}`;
    
                        return (
                            <div key={index} style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                <p>{fullPost}</p>
                                <button
                                    className='copy-btn'
                                    onClick={() => navigator.clipboard.writeText(fullPost)}
                                >
                                    Copy
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p>No posts to display.</p>
                )}
            </div>
        </div>
    );         
}

export default DashboardPage;
