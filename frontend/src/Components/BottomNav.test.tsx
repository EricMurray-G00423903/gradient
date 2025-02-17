import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BottomNav from './BottomNav';

describe('BottomNav Component', () => {
    test('renders BottomNav component', () => {
        render(<BottomNav />);
        expect(screen.getByLabelText('Home')).toBeInTheDocument();
        expect(screen.getByLabelText('Modules')).toBeInTheDocument();
        expect(screen.getByLabelText('Study Planner')).toBeInTheDocument();
        expect(screen.getByLabelText('Projects')).toBeInTheDocument();
        expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    test('changes value when a BottomNavigationAction is clicked', () => {
        render(<BottomNav />);
        const homeAction = screen.getByLabelText('Home');
        const modulesAction = screen.getByLabelText('Modules');

        fireEvent.click(modulesAction);
        expect(modulesAction).toHaveClass('Mui-selected');
        expect(homeAction).not.toHaveClass('Mui-selected');
    });

    test('renders with correct initial value', () => {
        render(<BottomNav />);
        const homeAction = screen.getByLabelText('Home');
        expect(homeAction).toHaveClass('Mui-selected');
    });
});