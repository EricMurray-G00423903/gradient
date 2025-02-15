import React from 'react';
import { Link } from 'react-router-dom';

const Home= () => {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>placeholder</p>
            <Link to="/study-planner">Go to Study Planner</Link>
        </div>
    );
};

export default Home;