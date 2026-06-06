import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabItem } from '../components/TabItem';
import type { Tab } from '../types';

const RECENT_DATE = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
const OLD_DATE = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10); // 10 days ago

const MOCK_TAB: Tab = {
  id: 'tab-1',
  title: 'Google',
  url: 'https://google.com',
  faviconUrl: 'https://google.com/favicon.ico',
  lastAccessed: RECENT_DATE,
};

function renderTab(overrides: Partial<Tab> = {}, props: Record<string, unknown> = {}) {
  const tab = { ...MOCK_TAB, ...overrides };
  const onToggleKeepOpen = vi.fn();
  const onClose = vi.fn();
  const onSelect = vi.fn();

  render(
    <TabItem
      tab={tab}
      onToggleKeepOpen={onToggleKeepOpen}
      inactiveThreshold={7}
      onClose={onClose}
      isSelected={false}
      onSelect={onSelect}
      {...props}
    />
  );

  return { onToggleKeepOpen, onClose, onSelect };
}

describe('TabItem — rendering', () => {
  it('renders the tab title', () => {
    renderTab();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('renders the tab URL', () => {
    renderTab();
    expect(screen.getByText('https://google.com')).toBeInTheDocument();
  });

  it('renders memory usage badge when memoryUsage is set', () => {
    renderTab({ memoryUsage: 128 });
    expect(screen.getByText('128 MB')).toBeInTheDocument();
  });

  it('does not render memory badge when memoryUsage is undefined', () => {
    renderTab();
    expect(screen.queryByText(/MB$/)).not.toBeInTheDocument();
  });

  it('renders "Dup" badge when isDuplicate is true', () => {
    renderTab({ isDuplicate: true });
    expect(screen.getByText('Dup')).toBeInTheDocument();
  });

  it('does not render "Dup" badge when isDuplicate is false', () => {
    renderTab({ isDuplicate: false });
    expect(screen.queryByText('Dup')).not.toBeInTheDocument();
  });

  it('renders "Broken" badge when isBroken is true', () => {
    renderTab({ isBroken: true });
    expect(screen.getByText('Broken')).toBeInTheDocument();
  });

  it('does not render "Broken" badge when isBroken is false', () => {
    renderTab({ isBroken: false });
    expect(screen.queryByText('Broken')).not.toBeInTheDocument();
  });

  it('shows inactive indicator for tabs older than inactiveThreshold', () => {
    renderTab({ lastAccessed: OLD_DATE });
    // The inactive indicator is a div with a specific title attribute
    const indicator = document.querySelector('[title*="Inactive"]');
    expect(indicator).toBeInTheDocument();
  });

  it('does not show inactive indicator for recent tabs', () => {
    renderTab({ lastAccessed: RECENT_DATE });
    const indicator = document.querySelector('[title*="Inactive"]');
    expect(indicator).not.toBeInTheDocument();
  });
});

describe('TabItem — selection state', () => {
  it('renders checkbox as checked when isSelected is true', () => {
    renderTab({}, { isSelected: true });
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('renders checkbox as unchecked when isSelected is false', () => {
    renderTab({}, { isSelected: false });
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('applies selected styles to tab container when isSelected', () => {
    renderTab({}, { isSelected: true });
    const container = document.querySelector('[data-tab-id="tab-1"]');
    expect(container?.className).toContain('bg-indigo-100');
  });
});

describe('TabItem — interactions', () => {
  it('calls onSelect with tab id when clicked', () => {
    const { onSelect } = renderTab();
    const container = document.querySelector('[data-tab-id="tab-1"]');
    fireEvent.click(container!);
    expect(onSelect).toHaveBeenCalledWith('tab-1');
  });

  it('calls onSelect when checkbox changes', () => {
    const { onSelect } = renderTab();
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith('tab-1');
  });

  it('calls onClose when close button is clicked', () => {
    const { onClose } = renderTab();
    // Find close button (X icon button)
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[buttons.length - 1]; // last button is close
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledWith(MOCK_TAB);
  });

  it('calls onToggleKeepOpen when pin button is clicked', () => {
    const { onToggleKeepOpen } = renderTab();
    const buttons = screen.getAllByRole('button');
    const pinBtn = buttons[0]; // first button is pin
    fireEvent.click(pinBtn);
    expect(onToggleKeepOpen).toHaveBeenCalledWith('tab-1');
  });

  it('close button click does not propagate to onSelect', () => {
    const { onSelect, onClose } = renderTab();
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons[buttons.length - 1];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
