import React from 'react';

function Dashboard() {
  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="news-post">
          <h2>News Post 1</h2>
          <p>This is a placeholder for the first news post.</p>
          <button>Copy Post</button>
        </div>
        <div className="news-post">
          <h2>News Post 2</h2>
          <p>This is a placeholder for the second news post.</p>
          <button>Copy Post</button>
        </div>
        <div className="news-post">
          <h2>News Post 3</h2>
          <p>This is a placeholder for the third news post.</p>
          <button>Copy Post</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
