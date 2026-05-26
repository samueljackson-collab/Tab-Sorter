import { describe, it, expect } from 'vitest';
import type { Tab, TabGroup, Folder, Settings, SavedSession } from '../types';

describe('Tab type', () => {
  it('accepts required fields', () => {
    const tab: Tab = {
      id: 'tab-1',
      title: 'Example Page',
      url: 'https://example.com',
      faviconUrl: 'https://example.com/favicon.ico',
      lastAccessed: new Date(),
    };
    expect(tab.id).toBe('tab-1');
    expect(tab.url).toBe('https://example.com');
  });

  it('accepts optional fields', () => {
    const tab: Tab = {
      id: 'tab-2',
      title: 'Another Page',
      url: 'https://another.com',
      faviconUrl: '',
      lastAccessed: new Date(),
      memoryUsage: 128,
      isDuplicate: false,
      isBroken: false,
      keepOpen: true,
      isSelected: false,
    };
    expect(tab.memoryUsage).toBe(128);
    expect(tab.keepOpen).toBe(true);
  });
});

describe('TabGroup type', () => {
  it('accepts required fields', () => {
    const group: TabGroup = {
      id: 'group-1',
      name: 'Work',
      tabs: [],
      color: '#3b82f6',
    };
    expect(group.name).toBe('Work');
    expect(group.tabs).toHaveLength(0);
  });

  it('accepts optional tags', () => {
    const group: TabGroup = {
      id: 'group-2',
      name: 'Research',
      tabs: [],
      color: '#10b981',
      tags: ['science', 'articles'],
    };
    expect(group.tags).toContain('science');
  });
});

describe('Folder type', () => {
  it('accepts required fields with timestamps', () => {
    const now = Date.now();
    const folder: Folder = {
      id: 'folder-1',
      name: 'My Folder',
      groups: [],
      createdAt: now,
      updatedAt: now,
    };
    expect(folder.id).toBe('folder-1');
    expect(folder.createdAt).toBe(now);
  });
});

describe('Settings type', () => {
  it('accepts all required settings fields', () => {
    const settings: Settings = {
      inactiveThreshold: 7,
      autoSave: 'manual',
      tabPersistence: 'forever',
      darkMode: false,
      memorySavingMode: false,
      memorySavingDuration: 60,
    };
    expect(settings.inactiveThreshold).toBe(7);
    expect(settings.autoSave).toBe('manual');
  });

  it('accepts valid autoSave enum values', () => {
    const manual: Settings['autoSave'] = 'manual';
    const hourly: Settings['autoSave'] = 'hourly';
    const daily: Settings['autoSave'] = 'daily';
    expect(['manual', 'hourly', 'daily']).toContain(manual);
    expect(['manual', 'hourly', 'daily']).toContain(hourly);
    expect(['manual', 'hourly', 'daily']).toContain(daily);
  });
});

describe('SavedSession type', () => {
  it('accepts required fields', () => {
    const session: SavedSession = {
      id: 'session-1',
      date: new Date('2024-01-01'),
      tabs: [],
    };
    expect(session.id).toBe('session-1');
    expect(session.tabs).toHaveLength(0);
  });
});
