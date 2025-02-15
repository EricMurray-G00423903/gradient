import React from 'react';
import { Link } from 'react-router-dom';

const StudyPlanner = () => {
    return (
        <div>
            <h1>Study Planner</h1>
            <p>Welcome to the page!</p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default StudyPlanner;