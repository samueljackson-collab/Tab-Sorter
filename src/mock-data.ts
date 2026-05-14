/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tab, TabGroup } from './types';

const now = new Date();

export const mockTabs: Tab[] = [
  {
    id: '1',
    title: 'Google AI Studio - Build with Gemini',
    url: 'https://aistudio.google.com/',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=aistudio.google.com',
    lastAccessed: new Date(now.getTime() - 1000 * 60 * 5),
    memoryUsage: 150,
  },
  {
    id: '2',
    title: 'React Docs - Getting Started',
    url: 'https://react.dev/',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=react.dev',
    lastAccessed: new Date(now.getTime() - 1000 * 60 * 10),
    memoryUsage: 85,
  },
  {
    id: '3',
    title: 'MDN Web Docs - JavaScript',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org',
    lastAccessed: new Date(now.getTime() - 1000 * 60 * 30),
    memoryUsage: 120,
    isDuplicate: true,
  },
  {
    id: '4',
    title: 'This Page Does Not Exist - 404',
    url: 'https://example.com/404-page',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=example.com',
    lastAccessed: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    memoryUsage: 45,
    isBroken: true,
  },
  {
    id: '5',
    title: 'Tailwind CSS - The Utility-First CSS Framework',
    url: 'https://tailwindcss.com/',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=tailwindcss.com',
    lastAccessed: new Date(now.getTime() - 1000 * 60 * 60 * 5),
    memoryUsage: 95,
  },
];

export const mockGroups: TabGroup[] = [
  {
    id: 'g1',
    name: 'Development',
    color: '#3b82f6',
    tabs: mockTabs.filter(t => ['2', '3', '5'].includes(t.id)),
  },
  {
    id: 'g2',
    name: 'AI Tools',
    color: '#8b5cf6',
    tabs: mockTabs.filter(t => t.id === '1'),
  },
];
