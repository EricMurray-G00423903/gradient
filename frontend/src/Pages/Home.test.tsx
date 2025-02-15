import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

describe('Home Page', () => {
    test('renders welcome message', () => {
        render(<Home />);
        const welcomeMessage = screen.getByText(/welcome to the home page/i);
        expect(welcomeMessage).toBeInTheDocument();
    });

    test('renders another specific text', () => {
        render(<Home />);
        const specificText = screen.getByText(/placeholder/i);
        expect(specificText).toBeInTheDocument();
    });
});