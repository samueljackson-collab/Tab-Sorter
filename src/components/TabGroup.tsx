/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { TabGroup as TabGroupType, Tab } from '../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TabItem } from './TabItem';

interface TabGroupProps {
  key?: string | number;
  group: TabGroupType;
  onToggleKeepOpen: (id: string) => void;
  inactiveThreshold: number;
  groups: TabGroupType[];
  onSuggestionAccept: (tabId: string, groupName: string) => void;
  onClose: (tab: Tab) => void;
  onColorChange: (groupId: string, color: string) => void;
  selectedTabIds: Set<string>;
  onTabSelect: (tabId: string) => void;
  tabSortBy?: 'name' | 'url' | 'lastAccessed';
  tabSortDirection?: 'asc' | 'desc';
  onGenerateTags?: (groupId: string) => void;
}

export function TabGroup({ group, onToggleKeepOpen, inactiveThreshold, groups: _groups, onSuggestionAccept: _onSuggestionAccept, onClose, onColorChange, selectedTabIds, onTabSelect, tabSortBy = 'name', tabSortDirection = 'asc', onGenerateTags }: TabGroupProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [isOpen, setIsOpen] = useState(true);

  const sortedTabs = React.useMemo(() => {
    const result = [...group.tabs];
    result.sort((a, b) => {
      let comparison = 0;
      if (tabSortBy === 'name') comparison = a.title.localeCompare(b.title);
      else if (tabSortBy === 'url') comparison = a.url.localeCompare(b.url);
      else if (tabSortBy === 'lastAccessed') comparison = a.lastAccessed.getTime() - b.lastAccessed.getTime();
      
      return tabSortDirection === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [group.tabs, tabSortBy, tabSortDirection]);

  // Basic function to determine if a color is light or dark
  const isColorLight = (hexcolor: string) => {
    if (!hexcolor) return true;
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    // Using the YIQ formula
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
  };

  const textColor = isColorLight(group.color) ? 'text-slate-900 dark:text-slate-100' : 'text-white';
  const lighterBg = group.color + '30'; // Add alpha for background

  const totalMemory = group.tabs.reduce((acc, tab) => acc + (tab.memoryUsage || 0), 0);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded bg-white dark:bg-slate-800 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
      <div style={{ borderLeft: `4px solid ${group.color}` }}>
      <div 
        className={`w-full flex justify-between items-center p-2`}
        style={{ backgroundColor: lighterBg }}
      >
        <div className="flex items-center gap-2">
          <ColorPicker currentColor={group.color} onColorChange={(newColor) => onColorChange(group.id, newColor)} />
          <h3 className={`text-sm font-semibold ${textColor}`}>{group.name}</h3>
          {onGenerateTags && (
            <button 
              onClick={() => onGenerateTags(group.id)} 
              className={`p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textColor} opacity-70 hover:opacity-100`}
              title="Generate AI Tags"
            >
              <Sparkles size={14} />
            </button>
          )}
          {totalMemory > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isColorLight(group.color) ? 'bg-black/10 text-slate-800' : 'bg-white/20 text-white'}`}>
              {totalMemory} MB
            </span>
          )}
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 ${textColor} hover:opacity-80 transition-opacity`}>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} style={{backgroundColor: group.color, color: isColorLight(group.color) ? '#000' : '#fff'}}>{group.tabs.length}</span>
            <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {group.tags && group.tags.length > 0 && (
        <div className="px-2 py-1 flex flex-wrap gap-1" style={{ backgroundColor: lighterBg }}>
          {group.tags.map((tag, idx) => (
            <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 ${textColor} opacity-80`}>
              #{tag}
            </span>
          ))}
        </div>
      )}
      {isOpen && (
        <div className="p-2 space-y-1 bg-white dark:bg-slate-800/50">
          {sortedTabs.map((tab) => (
            <TabItem 
              key={tab.id} 
              tab={tab} 
              onToggleKeepOpen={onToggleKeepOpen} 
              inactiveThreshold={inactiveThreshold} 
              onClose={onClose}
              isSelected={selectedTabIds.has(tab.id)}
              onSelect={onTabSelect}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
