/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, useDragControls } from 'motion/react';
import { Folder, TabGroup as TabGroupType } from '../types';
import { ChevronDown, Trash2, Share2, Search, SortAsc, Folder as FolderIcon, Briefcase, Home, Globe, CheckSquare, Square, Code, Music, Video, Book, Coffee, Heart, Star, Zap, Settings, Download, X, Monitor, Layout, FileText, Cloud, Database, Shield, Activity, Terminal } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HexColorPicker } from 'react-colorful';
import { TabGroup } from './TabGroup';

interface FolderItemProps {
  key?: string | number;
  folder: Folder;
  darkMode?: boolean;
  onDelete: (folderId: string) => void;
  onRename: (folderId: string, newName: string) => void;
  onToggleShare: (folderId: string) => void;
  onUpdateAppearance: (folderId: string, appearance: { color?: string; icon?: string; category?: string }) => void;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  selectedTabCount: number;
  onBatchCloseTabs: () => void;
  onBatchGroupTabs: () => void;
  onBatchPinTabs: () => void;
  onBatchRenameTabs: (newName: string) => void;
  // Tab related handlers to pass down
  onToggleKeepOpen: (id: string) => void;
  inactiveThreshold: number;
  allGroups: TabGroupType[];
  onSuggestionAccept: (tabId: string, groupName: string) => void;
  onCloseTab: (tab: any) => void;
  onColorChange: (groupId: string, color: string) => void;
  selectedTabIds: Set<string>;
  onTabSelect: (tabId: string) => void;
  onGenerateTags?: (groupId: string) => void;
  viewMode?: 'list' | 'grid' | 'compact';
}

const FOLDER_ICONS = [
  { id: 'folder', icon: FolderIcon },
  { id: 'briefcase', icon: Briefcase },
  { id: 'home', icon: Home },
  { id: 'globe', icon: Globe },
  { id: 'code', icon: Code },
  { id: 'monitor', icon: Monitor },
  { id: 'layout', icon: Layout },
  { id: 'file-text', icon: FileText },
  { id: 'cloud', icon: Cloud },
  { id: 'database', icon: Database },
  { id: 'shield', icon: Shield },
  { id: 'activity', icon: Activity },
  { id: 'terminal', icon: Terminal },
  { id: 'music', icon: Music },
  { id: 'video', icon: Video },
  { id: 'book', icon: Book },
  { id: 'coffee', icon: Coffee },
  { id: 'heart', icon: Heart },
  { id: 'star', icon: Star },
  { id: 'zap', icon: Zap },
];

const FOLDER_COLORS = [
  '#f1f5f9', // slate-100
  '#fee2e2', // red-100
  '#fef3c7', // amber-100
  '#dcfce7', // green-100
  '#dbeafe', // blue-100
  '#f3e8ff', // purple-100
];

export function FolderItem({ 
  folder, 
  darkMode,
  onDelete, 
  onRename, 
  onToggleShare, 
  onUpdateAppearance,
  isSelected,
  onSelect,
  selectedTabCount,
  onBatchCloseTabs,
  onBatchGroupTabs,
  onBatchPinTabs,
  onBatchRenameTabs,
  onToggleKeepOpen,
  inactiveThreshold,
  allGroups,
  onSuggestionAccept,
  onCloseTab,
  onColorChange,
  selectedTabIds,
  onTabSelect,
  onGenerateTags,
  viewMode = 'list'
}: FolderItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: folder.id,
    data: { type: 'folder' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'tabs'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tabSortBy, setTabSortBy] = useState<'name' | 'url' | 'lastAccessed'>('name');
  const [tabSortDirection, setTabSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [isBatchRenamingTabs, setIsBatchRenamingTabs] = useState(false);
  const [batchRenameTabsValue, setBatchRenameTabsValue] = useState('');

  const dragControls = useDragControls();

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    const rows = [['Title', 'URL', 'Group']];
    folder.groups.forEach(group => {
      group.tabs.forEach(tab => {
        rows.push([
          `"${tab.title.replace(/"/g, '""')}"`,
          `"${tab.url.replace(/"/g, '""')}"`,
          `"${group.name.replace(/"/g, '""')}"`
        ]);
      });
    });
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${folder.name}_tabs.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedGroups = useMemo(() => {
    const result = folder.groups.filter(g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else comparison = b.tabs.length - a.tabs.length;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [folder.groups, searchQuery, sortBy, sortDirection]);

  const handleRename = () => {
    if (newName.trim() !== '') {
      onRename(folder.id, newName.trim());
      setIsEditing(false);
    }
  };

  const handleBatchRenameTabsSubmit = () => {
    if (batchRenameTabsValue.trim() !== '') {
      onBatchRenameTabs(batchRenameTabsValue.trim());
      setIsBatchRenamingTabs(false);
      setBatchRenameTabsValue('');
    }
  };

  const SelectedIcon = FOLDER_ICONS.find(i => i.id === folder.icon)?.icon || FolderIcon;

  const totalMemory = folder.groups.reduce((acc, group) => {
    return acc + group.tabs.reduce((tAcc, tab) => tAcc + (tab.memoryUsage || 0), 0);
  }, 0);

  return (
    <div 
      ref={setNodeRef}
      style={{ ...style, backgroundColor: folder.color || (darkMode ? '#1e293b' : '#f1f5f9') }}
      className={`rounded-lg border overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 dark:border-indigo-400' : 'border-slate-200 dark:border-slate-800'
      } ${viewMode === 'grid' ? 'aspect-square flex flex-col' : ''}`}
    >
      {viewMode === 'grid' ? (
        <div className="flex-grow flex flex-col p-3 relative h-full">
           <div className="flex justify-between items-start mb-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onSelect(folder.id); }}
                className={`p-1 hover:text-indigo-600 dark:hover:text-indigo-400 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              </button>
              <div className="flex gap-1">
                <button onClick={() => setShowSettings(!showSettings)} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5">
                  <Settings size={14} />
                </button>
                <button onClick={() => onDelete(folder.id)} className="p-1 rounded-full text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} />
                </button>
              </div>
           </div>
           
           <div className="flex-grow flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 shadow-sm">
                <SelectedIcon size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center overflow-hidden w-full px-2">
                <h2 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{folder.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{folder.groups.length} groups</span>
                  {folder.category && (
                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      {folder.category}
                    </span>
                  )}
                </div>
              </div>
           </div>
           
           <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform text-slate-600 dark:text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
           </button>
        </div>
      ) : (
        <div 
          className={`flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 ${viewMode === 'compact' ? 'p-1' : 'p-2'}`}
          onContextMenu={handleExportCSV}
        >
          <div className="flex items-center gap-2 flex-grow overflow-hidden">
            <button 
              onClick={(e) => { e.stopPropagation(); onSelect(folder.id); }}
              className={`p-1 hover:text-indigo-600 dark:hover:text-indigo-400 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
            
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0">
              <ChevronDown size={viewMode === 'compact' ? 14 : 18} className={`transition-transform text-slate-600 dark:text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex items-center gap-2 flex-grow overflow-hidden cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
              <SelectedIcon size={viewMode === 'compact' ? 14 : 18} className="text-slate-600 dark:text-slate-400 flex-shrink-0" />

              {isEditing ? (
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="bg-white/50 dark:bg-slate-900/50 px-1 rounded font-semibold text-slate-800 dark:text-slate-100 outline-none border border-indigo-300 dark:border-indigo-500 min-w-0"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                  <h2 className={`${viewMode === 'compact' ? 'text-sm' : 'text-base'} font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate`} onDoubleClick={() => setIsEditing(true)}>{folder.name}</h2>
                  {folder.category && viewMode !== 'compact' && (
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex-shrink-0">
                      {folder.category}
                    </span>
                  )}
                </div>
              )}
            </div>
            {totalMemory > 0 && viewMode === 'list' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex-shrink-0">
                {totalMemory} MB
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {selectedTabCount > 0 && (
              <div className={`flex items-center gap-1 mr-2 bg-white/50 dark:bg-slate-800/50 rounded-md p-0.5 border border-slate-300 dark:border-slate-600 ${viewMode === 'compact' ? 'hidden sm:flex' : ''}`}>
                <button 
                  onClick={onBatchCloseTabs}
                  className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Close {selectedTabCount}
                </button>
                <button 
                  onClick={onBatchGroupTabs}
                  className="text-[10px] px-1.5 py-0.5 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Group
                </button>
                <button 
                  onClick={onBatchPinTabs}
                  className="text-[10px] px-1.5 py-0.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Pin
                </button>
                <button 
                  onClick={() => setIsBatchRenamingTabs(!isBatchRenamingTabs)}
                  className="text-[10px] px-1.5 py-0.5 bg-sky-500 text-white rounded hover:bg-sky-600"
                >
                  Rename
                </button>
              </div>
            )}

            {isBatchRenamingTabs && selectedTabCount > 0 && (
              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <input 
                  type="text" 
                  value={batchRenameTabsValue}
                  onChange={(e) => setBatchRenameTabsValue(e.target.value)}
                  placeholder="New name..."
                  className="w-24 px-1 py-0.5 text-[10px] rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleBatchRenameTabsSubmit()}
                />
                <button 
                  onClick={handleBatchRenameTabsSubmit}
                  className="p-0.5 rounded bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  <CheckSquare size={12} />
                </button>
              </div>
            )}

            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5" title="Settings">
              <Settings size={viewMode === 'compact' ? 14 : 16} />
            </button>
            <button onClick={() => onToggleShare(folder.id)} className={`p-1.5 rounded-full ${folder.shared ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'} hover:bg-black/5 dark:hover:bg-white/5`} title="Share">
              <Share2 size={viewMode === 'compact' ? 14 : 16} />
            </button>
            <button onClick={() => onDelete(folder.id)} className="p-1.5 rounded-full text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/20" title="Delete">
              <Trash2 size={viewMode === 'compact' ? 14 : 16} />
            </button>
          </div>
        </div>
      )}

      {showSettings && createPortal(
        <motion.div 
          drag 
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed z-50 top-24 left-1/2 -ml-40 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <div 
            className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-move"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
              Folder Settings
            </h3>
            <button 
              onClick={() => setShowSettings(false)} 
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Appearance</span>
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Background Color</span>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-center custom-color-picker">
                      <HexColorPicker 
                        color={folder.color || (darkMode ? '#1e293b' : '#f1f5f9')} 
                        onChange={(c) => onUpdateAppearance(folder.id, { color: c })} 
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {FOLDER_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => onUpdateAppearance(folder.id, { color: c })}
                          className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Icon</span>
                  <div className="flex gap-1 flex-wrap p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    {FOLDER_ICONS.map(i => (
                      <button 
                        key={i.id} 
                        onClick={() => onUpdateAppearance(folder.id, { icon: i.id })}
                        className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 ${folder.icon === i.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        <i.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Organization</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Category</span>
                <select 
                  value={folder.category || 'Uncategorized'}
                  onChange={(e) => onUpdateAppearance(folder.id, { category: e.target.value })}
                  className="text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500"
                >
                  <option value="Uncategorized">Uncategorized</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Projects">Projects</option>
                  <option value="Learning">Learning</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Tab Sorting</span>
              <div className="flex items-center justify-between gap-2">
                <select 
                  value={tabSortBy}
                  onChange={(e) => setTabSortBy(e.target.value as any)}
                  className="flex-grow text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="url">Sort by URL</option>
                  <option value="lastAccessed">Sort by Last Accessed</option>
                </select>
                <button 
                  onClick={() => setTabSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                >
                  <SortAsc size={16} className={`transition-transform ${tabSortDirection === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Details</span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Created</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Total Tabs</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {folder.groups.reduce((acc, g) => acc + g.tabs.length, 0)}
                </span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button 
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Download size={16} />
                Export URLs to CSV
              </button>
            </div>
          </div>
        </motion.div>,
        document.body
      )}

      {isOpen && (
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-grow">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-xs bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-indigo-300 dark:focus:border-indigo-500 text-slate-700 dark:text-slate-300"
              />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded bg-white/50 dark:bg-slate-900/50">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-[10px] bg-transparent border-none px-1 py-1 outline-none text-slate-600 dark:text-slate-400 focus:ring-0"
                  title="Sort groups by..."
                >
                  <option value="name">Groups: Name</option>
                  <option value="tabs">Groups: Size</option>
                </select>
                <button 
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border-l border-slate-200 dark:border-slate-700"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <SortAsc size={12} className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {folder.shared && (
            <div className="p-2 text-[10px] text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30 rounded border border-slate-200/50 dark:border-slate-700/50">
              <p>Share link: <a href={folder.shareLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline truncate block">{folder.shareLink}</a></p>
            </div>
          )}

          <div className="space-y-2">
            <SortableContext items={filteredAndSortedGroups.map(g => g.id)} strategy={verticalListSortingStrategy}>
              {filteredAndSortedGroups.map(group => (
                <TabGroup 
                  key={group.id} 
                  group={group} 
                  onToggleKeepOpen={onToggleKeepOpen} 
                  inactiveThreshold={inactiveThreshold} 
                  groups={allGroups}
                  onSuggestionAccept={onSuggestionAccept}
                  onClose={onCloseTab}
                  onColorChange={onColorChange}
                  selectedTabIds={selectedTabIds}
                  onTabSelect={onTabSelect}
                  tabSortBy={tabSortBy}
                  tabSortDirection={tabSortDirection}
                  onGenerateTags={onGenerateTags}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      )}
    </div>
  );
}
