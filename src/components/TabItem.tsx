/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pin, X } from 'lucide-react';
import { Tab, TabGroup } from '../types';
import { AIGroupSuggester } from './AIGroupSuggester';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

interface TabItemProps {
    key?: string | number;
    tab: Tab;
    onToggleKeepOpen: (id: string) => void;
    inactiveThreshold: number;
    isUngrouped?: boolean;
    groups?: TabGroup[];
    onSuggestionAccept?: (tabId: string, groupName: string) => void;
    onClose: (tab: Tab) => void;
    isSelected: boolean;
    onSelect: (tabId: string) => void;
}

export function TabItem({ tab, onToggleKeepOpen, isUngrouped, groups, onSuggestionAccept, inactiveThreshold, onClose, isSelected, onSelect }: TabItemProps) {
  const isInactive = (new Date().getTime() - tab.lastAccessed.getTime()) / (1000 * 3600 * 24) > inactiveThreshold;
  return (
    <div 
      className={`tab-item flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      data-tab-id={tab.id}
      onClick={() => onSelect(tab.id)}
    >
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={() => onSelect(tab.id)}
        onClick={(e) => e.stopPropagation()}
        className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
      />
      <img src={tab.faviconUrl} alt="" className="w-4 h-4 flex-shrink-0" referrerPolicy="no-referrer" />
      <div className="flex-grow truncate">
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-slate-800 dark:text-slate-200'}`}>{tab.title}</p>
          {tab.memoryUsage && (
            <span className={`text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              {tab.memoryUsage} MB
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isInactive && (
            <div className="w-2 h-2 rounded-full bg-orange-400" title={`Inactive for more than ${inactiveThreshold} days`}></div>
          )}
          <p className={`text-xs truncate ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>{tab.url}</p>
          <span className={`text-xs flex-shrink-0 ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>• {formatTimeAgo(tab.lastAccessed)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {tab.isDuplicate && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">Dup</span>
        )}
        {tab.isBroken && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">Broken</span>
        )}
        {isUngrouped && groups && onSuggestionAccept && (
            <AIGroupSuggester tab={tab} groups={groups} onSuggestionAccept={onSuggestionAccept} />
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleKeepOpen(tab.id); }}
          className={`p-1 rounded-full ${tab.keepOpen ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
          <Pin size={14} className={`${tab.keepOpen ? '' : '-rotate-45'}`}/>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClose(tab); }} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
