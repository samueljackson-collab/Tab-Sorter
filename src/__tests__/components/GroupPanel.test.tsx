import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TabGroup } from '../../components/TabGroup';
import type { TabGroup as TabGroupType, Tab } from '../../types';

// TabItem -> AIGroupSuggester -> geminiService imports @google/genai at module
// load time and throws if no API key is configured. Mock it to avoid that.
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

const RECENT_DATE = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago

const MOCK_TAB_1: Tab = {
  id: 'tab-1',
  title: 'Google',
  url: 'https://google.com',
  faviconUrl: 'https://google.com/favicon.ico',
  lastAccessed: RECENT_DATE,
};

const MOCK_TAB_2: Tab = {
  id: 'tab-2',
  title: 'React Docs',
  url: 'https://react.dev',
  faviconUrl: 'https://react.dev/favicon.ico',
  lastAccessed: RECENT_DATE,
};

const MOCK_GROUP: TabGroupType = {
  id: 'group-1',
  name: 'Work',
  color: '#4f46e5',
  tabs: [MOCK_TAB_1, MOCK_TAB_2],
};

function renderGroup(overrides: Partial<TabGroupType> = {}, props: Record<string, unknown> = {}) {
  const group = { ...MOCK_GROUP, ...overrides };
  const onToggleKeepOpen = vi.fn();
  const onSuggestionAccept = vi.fn();
  const onClose = vi.fn();
  const onColorChange = vi.fn();
  const onTabSelect = vi.fn();
  const onGenerateTags = vi.fn();

  const utils = render(
    <DndContext>
      <TabGroup
        group={group}
        onToggleKeepOpen={onToggleKeepOpen}
        inactiveThreshold={7}
        groups={[group]}
        onSuggestionAccept={onSuggestionAccept}
        onClose={onClose}
        onColorChange={onColorChange}
        selectedTabIds={new Set<string>()}
        onTabSelect={onTabSelect}
        onGenerateTags={onGenerateTags}
        {...props}
      />
    </DndContext>
  );

  return {
    ...utils,
    onToggleKeepOpen,
    onSuggestionAccept,
    onClose,
    onColorChange,
    onTabSelect,
    onGenerateTags,
  };
}

describe('TabGroup — rendering', () => {
  it('renders the group name', () => {
    renderGroup();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders the list of tabs within the group', () => {
    renderGroup();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('React Docs')).toBeInTheDocument();
  });

  it('renders the tab count badge', () => {
    renderGroup();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles an empty group (no tabs) gracefully', () => {
    renderGroup({ tabs: [] });
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
  });

  it('renders tags when present', () => {
    renderGroup({ tags: ['development', 'reading'] });
    expect(screen.getByText('#development')).toBeInTheDocument();
    expect(screen.getByText('#reading')).toBeInTheDocument();
  });

  it('does not render a tags row when tags are absent', () => {
    renderGroup();
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });

  it('renders total memory usage badge when tabs have memory usage', () => {
    renderGroup({
      tabs: [
        { ...MOCK_TAB_1, memoryUsage: 100 },
        { ...MOCK_TAB_2, memoryUsage: 50 },
      ],
    });
    expect(screen.getByText('150 MB')).toBeInTheDocument();
  });

  it('does not render memory usage badge when no tabs have memory usage', () => {
    renderGroup();
    expect(screen.queryByText(/MB$/)).not.toBeInTheDocument();
  });
});

describe('TabGroup — expand/collapse interaction', () => {
  it('shows tabs by default (expanded)', () => {
    renderGroup();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('hides tabs after collapse toggle is clicked', () => {
    renderGroup();
    const toggleButton = screen.getByText('2').closest('button');
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton!);
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
    expect(screen.queryByText('React Docs')).not.toBeInTheDocument();
  });

  it('shows tabs again after toggling twice', () => {
    renderGroup();
    const toggleButton = screen.getByText('2').closest('button');
    fireEvent.click(toggleButton!);
    fireEvent.click(toggleButton!);
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});

describe('TabGroup — group-level actions', () => {
  it('calls onColorChange when a new color is selected via ColorPicker', () => {
    const { onColorChange } = renderGroup();
    // Open the color picker by clicking the swatch toggle button (identified
    // by its inline backgroundColor style, since it has no accessible name).
    const swatchButton = screen
      .getAllByRole('button')
      .find((button) => button.style.backgroundColor);
    expect(swatchButton).toBeDefined();
    fireEvent.click(swatchButton!);
    // The hex text input is the most reliable way to drive a color change in
    // jsdom, since react-colorful's gradient picker relies on pointer drag
    // events that jsdom doesn't simulate.
    const hexInput = screen.getByDisplayValue(/^#/);
    fireEvent.change(hexInput, { target: { value: '#abcdef' } });
    expect(onColorChange).toHaveBeenCalledWith('group-1', '#abcdef');
  });

  it('calls onGenerateTags with the group id when the AI tag button is clicked', () => {
    const { onGenerateTags } = renderGroup();
    const tagButton = screen.getByTitle('Generate AI Tags');
    fireEvent.click(tagButton);
    expect(onGenerateTags).toHaveBeenCalledWith('group-1');
  });

  it('does not render the AI tag button when onGenerateTags is not provided', () => {
    renderGroup({}, { onGenerateTags: undefined });
    expect(screen.queryByTitle('Generate AI Tags')).not.toBeInTheDocument();
  });

  it('calls onClose with the tab when a tab close button is clicked', () => {
    const { onClose } = renderGroup();
    const closeButtons = document.querySelectorAll('[data-tab-id="tab-1"] button');
    const lastButton = closeButtons[closeButtons.length - 1];
    fireEvent.click(lastButton);
    expect(onClose).toHaveBeenCalledWith(MOCK_TAB_1);
  });

  it('calls onToggleKeepOpen with the tab id when a tab pin button is clicked', () => {
    const { onToggleKeepOpen } = renderGroup();
    const tabButtons = document.querySelectorAll('[data-tab-id="tab-1"] button');
    const pinButton = tabButtons[0];
    fireEvent.click(pinButton);
    expect(onToggleKeepOpen).toHaveBeenCalledWith('tab-1');
  });

  it('calls onTabSelect with the tab id when a tab is selected', () => {
    const { onTabSelect } = renderGroup();
    const tabContainer = document.querySelector('[data-tab-id="tab-1"]');
    fireEvent.click(tabContainer!);
    expect(onTabSelect).toHaveBeenCalledWith('tab-1');
  });
});
