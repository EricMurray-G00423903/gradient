import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders testing', () => {
  render(<App />);
  const linkElement = screen.getByText(/testing/i);
  expect(linkElement).toBeInTheDocument();
});
