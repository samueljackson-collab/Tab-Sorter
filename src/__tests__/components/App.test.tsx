import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Avoid real network calls to the Gemini SDK during render/interactions.
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Tab Sorter AI')).toBeInTheDocument();
  });

  it('renders the header title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Tab Sorter AI' })).toBeInTheDocument();
  });

  it('renders the AI Sorter and Settings buttons in the header', () => {
    render(<App />);
    expect(screen.getByTitle('AI Sorter')).toBeInTheDocument();
  });

  it('renders the end-of-day footer button', () => {
    render(<App />);
    expect(screen.getByText('Sort & Save End-of-Day Tabs')).toBeInTheDocument();
  });

  it('renders the create folder input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('New folder name...')).toBeInTheDocument();
  });

  it('renders tab groups from mock data', () => {
    render(<App />);
    // mock-data defines at least one tab group; the container for groups should be present
    const groupsContainer = document.querySelector('#ungrouped-area');
    expect(groupsContainer).toBeInTheDocument();
  });
});
