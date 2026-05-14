/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl: string;
  lastAccessed: Date;
  memoryUsage?: number; // in MB
  isDuplicate?: boolean;
  isBroken?: boolean;
  keepOpen?: boolean;
  isSelected?: boolean;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: Tab[];
  color: string;
  tags?: string[];
}

export interface SavedSession {
  id: string;
  date: Date;
  tabs: Tab[];
}

export interface Settings {
  inactiveThreshold: number;
  autoSave: 'manual' | 'hourly' | 'daily';
  autoSaveHourlyInterval?: number;
  autoSaveDailyTime?: string;
  tabPersistence: 'forever' | 'month' | 'week';
  darkMode: boolean;
  themeColor?: string;
  memorySavingMode: boolean;
  memorySavingDuration: number; // in minutes
}

export interface Folder {
  id: string;
  name: string;
  groups: TabGroup[];
  shared?: boolean;
  shareLink?: string;
  color?: string;
  icon?: string;
  category?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
