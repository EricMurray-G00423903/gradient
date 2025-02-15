import React from 'react';
import { render, screen } from '@testing-library/react';
import StudyPlanner from './StudyPlanner';

describe('StudyPlanner', () => {
    test('renders Study Planner heading', () => {
        render(<StudyPlanner />);
        const headingElement = screen.getByText(/Study Planner/i);
        expect(headingElement).toBeInTheDocument();
    });

    test('renders welcome message', () => {
        render(<StudyPlanner />);
        const welcomeMessage = screen.getByText(/Welcome to the page!/i);
        expect(welcomeMessage).toBeInTheDocument();
    });
});