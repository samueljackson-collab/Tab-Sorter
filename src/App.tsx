/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Selecto from 'react-selecto';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { mockTabs, mockGroups } from './mock-data';
import { Tab, TabGroup as TabGroupType, SavedSession, Folder } from './types';
import { Settings, X, Pin, Sparkles, Check, Edit, Trash2, SortAsc, Search } from 'lucide-react';
import { LayoutGrid, List, AlignJustify } from 'lucide-react';
import { TabItem } from './components/TabItem';
import { TabGroup } from './components/TabGroup';
import { SettingsPanel } from './components/SettingsPanel';
import { AnimatePresence, motion } from 'motion/react';
import { EndOfDayModal } from './components/EndOfDayModal';
import { SavedSessionItem } from './components/SavedSessionItem';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { FolderItem } from './components/FolderItem';
import { AISorterModal } from './components/AISorterModal';

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>(mockTabs);
  const [groups, setGroups] = useState<TabGroupType[]>(mockGroups);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [inactiveThreshold, setInactiveThreshold] = useState(3);
  const [tabToClose, setTabToClose] = useState<Tab | null>(null);
  const [selectedTabIds, setSelectedTabIds] = useState<Set<string>>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [isBatchRenaming, setIsBatchRenaming] = useState(false);
  const [batchRenameValue, setBatchRenameValue] = useState('');
  const [folderSortBy, setFolderSortBy] = useState<'manual' | 'name' | 'groupCount' | 'createdAt' | 'updatedAt'>('manual');
  const [folderSortDirection, setFolderSortDirection] = useState<'asc' | 'desc'>('asc');
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);

  const sortedFolders = useMemo(() => {
    let result = [...folders];
    
    if (folderSearchQuery.trim()) {
      result = result.filter(f => f.name.toLowerCase().includes(folderSearchQuery.toLowerCase()));
    }

    result.sort((a, b) => {
      if (folderSortBy === 'manual') return 0; // Keep original order
      
      let comparison = 0;
      switch (folderSortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'groupCount':
          comparison = a.groups.length - b.groups.length;
          break;
        case 'createdAt':
          comparison = (a.createdAt || 0) - (b.createdAt || 0);
          break;
        case 'updatedAt':
          comparison = (a.updatedAt || 0) - (b.updatedAt || 0);
          break;
      }
      return folderSortDirection === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [folders, folderSortBy, folderSortDirection, folderSearchQuery]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAISorterOpen, setIsAISorterOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('#4f46e5'); // Default indigo-600
  const [memorySavingMode, setMemorySavingMode] = useState(false);
  const [memorySavingDuration, setMemorySavingDuration] = useState(30);
  const [folderView, setFolderView] = useState<'list' | 'grid' | 'compact'>('list');

  // Memory saving mode effect
  useEffect(() => {
    if (!memorySavingMode) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const durationMs = memorySavingDuration * 60 * 1000;
      
      setGroups(prevGroups => {
        return prevGroups.map(group => {
          const activeTabs = group.tabs.filter(tab => {
            if (tab.keepOpen) return true;
            return now - new Date(tab.lastAccessed).getTime() < durationMs;
          });
          return { ...group, tabs: activeTabs };
        }).filter(group => group.tabs.length > 0);
      });

      setFolders(prevFolders => {
        return prevFolders.map(folder => {
          const newGroups = folder.groups.map(group => {
            const activeTabs = group.tabs.filter(tab => {
              if (tab.keepOpen) return true;
              return now - new Date(tab.lastAccessed).getTime() < durationMs;
            });
            return { ...group, tabs: activeTabs };
          }).filter(group => group.tabs.length > 0);
          return { ...folder, groups: newGroups };
        });
      });
      
      setTabs(prevTabs => prevTabs.filter(tab => {
        if (tab.keepOpen) return true;
        return now - new Date(tab.lastAccessed).getTime() < durationMs;
      }));
      
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [memorySavingMode, memorySavingDuration]);

  const handleGenerateTags = async (groupId: string) => {
    // Mock AI tag generation based on tab URLs/titles
    const generateTagsForGroup = (group: TabGroupType) => {
      const allText = group.tabs.map(t => `${t.title} ${t.url}`).join(' ').toLowerCase();
      const tags = [];
      if (allText.includes('github') || allText.includes('code') || allText.includes('react')) tags.push('development');
      if (allText.includes('design') || allText.includes('figma') || allText.includes('color')) tags.push('design');
      if (allText.includes('news') || allText.includes('article') || allText.includes('blog')) tags.push('reading');
      if (allText.includes('youtube') || allText.includes('video') || allText.includes('music')) tags.push('media');
      if (tags.length === 0) tags.push('general', 'web');
      return tags;
    };

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, tags: generateTagsForGroup(g) };
      }
      return g;
    }));

    setFolders(prev => prev.map(f => ({
      ...f,
      groups: f.groups.map(g => {
        if (g.id === groupId) {
          return { ...g, tags: generateTagsForGroup(g) };
        }
        return g;
      })
    })));
  };

  const handleToggleKeepOpen = (id: string) => {
    setTabs(prevTabs => 
      prevTabs.map(t => t.id === id ? { ...t, keepOpen: !t.keepOpen } : t)
    );
    setGroups(prevGroups => 
        prevGroups.map(g => ({...g, tabs: g.tabs.map(t => t.id === id ? { ...t, keepOpen: !t.keepOpen } : t)}))
    );
  };

  const handleMoveTabToGroup = (tabId: string, groupName: string) => {
    const tabToMove = tabs.find(t => t.id === tabId);
    if (!tabToMove) return;

    setGroups(prevGroups => {
        const newGroups = [...prevGroups];
        const groupIndex = newGroups.findIndex(g => g.name === groupName);

        if (groupIndex !== -1) {
            // Add to existing group
            newGroups[groupIndex] = {
                ...newGroups[groupIndex],
                tabs: [...newGroups[groupIndex].tabs, tabToMove]
            };
        } else {
            // This case would be for creating a new group, which we can add later.
        }
        return newGroups;
    });
  };

  const ungroupedTabs = useMemo(() => {
    const groupedTabIds = new Set(groups.flatMap(g => g.tabs.map(t => t.id)));
    return tabs.filter(t => !groupedTabIds.has(t.id));
  }, [tabs, groups]);

  const handleConfirmEndOfDay = () => {
    const tabsToKeep = tabs.filter(t => t.keepOpen);
    const tabsToClose = tabs.filter(t => !t.keepOpen);

    if (tabsToClose.length > 0) {
      const newSession: SavedSession = {
        id: `session-${Date.now()}`,
        date: new Date(),
        tabs: tabsToClose,
      };
      setSavedSessions(prev => [newSession, ...prev]);
    }

    setTabs(tabsToKeep);
    setGroups(prevGroups => {
        return prevGroups.map(group => ({
            ...group,
            tabs: group.tabs.filter(tab => tab.keepOpen)
        })).filter(group => group.tabs.length > 0);
    });

    setIsModalOpen(false);
  };

  const handleCloseTab = (tabId: string) => {
    setTabs(prev => prev.filter(t => t.id !== tabId));
    setGroups(prev => 
        prev.map(g => ({...g, tabs: g.tabs.filter(t => t.id !== tabId)}))
            .filter(g => g.tabs.length > 0)
    );
    setTabToClose(null);
  };

  const handleRestoreSession = (session: SavedSession) => {
    const restoredTabs = session.tabs.map(t => ({...t, lastAccessed: new Date()}));
    setTabs(prev => [...prev, ...restoredTabs]);
    setSavedSessions(prev => prev.filter(s => s.id !== session.id));
  };

  const handleGroupColorChange = (groupId: string, color: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? {...g, color} : g));
  };

  const handleTabSelect = (tabId: string) => {
    setSelectedTabIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tabId)) {
        newSelection.delete(tabId);
      } else {
        newSelection.add(tabId);
      }
      return newSelection;
    });
  };

  const handleBatchClose = () => {
    const idsToClose = Array.from(selectedTabIds);
    setTabs(prev => prev.filter(t => !idsToClose.includes(t.id)));
    setGroups(prev => 
        prev.map(g => ({...g, tabs: g.tabs.filter(t => !idsToClose.includes(t.id))}))
            .filter(g => g.tabs.length > 0)
    );
    setSelectedTabIds(new Set());
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? {...f, name: newName, updatedAt: Date.now()} : f));
  };

  const handleToggleShareFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        const isShared = !f.shared;
        return {
          ...f,
          shared: isShared,
          shareLink: isShared ? `${window.location.origin}/share/${folderId}` : undefined
        };
      }
      return f;
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    const now = Date.now();
    const newFolder: Folder = {
      id: `folder-${now}`,
      name: newFolderName,
      groups: [],
      createdAt: now,
      updatedAt: now,
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIsGroup = groups.some(g => g.id === active.id) || folders.some(f => f.groups.some(g => g.id === active.id));
      const overIsFolder = folders.some(f => f.id === over.id);
      const activeIsFolder = folders.some(f => f.id === active.id);

      if (activeIsFolder && overIsFolder) {
        setFolders(prev => {
          const oldIndex = prev.findIndex(f => f.id === active.id);
          const newIndex = prev.findIndex(f => f.id === over.id);
          const newFolders = [...prev];
          const [movedFolder] = newFolders.splice(oldIndex, 1);
          newFolders.splice(newIndex, 0, movedFolder);
          return newFolders;
        });
      } else if (activeIsGroup && overIsFolder) {
        let groupToMove: TabGroupType | undefined;
        
        // Find group
        groupToMove = groups.find(g => g.id === active.id);
        if (!groupToMove) {
          for (const folder of folders) {
            const found = folder.groups.find(g => g.id === active.id);
            if (found) {
              groupToMove = found;
              break;
            }
          }
        }

        if (!groupToMove) return;

        // Remove group from its current folder (if any)
        setFolders(prev => prev.map(f => ({...f, groups: f.groups.filter(g => g.id !== active.id)})));
        // Remove group from top-level groups
        setGroups(prev => prev.filter(g => g.id !== active.id));

        // Add group to the new folder
        setFolders(prev => prev.map(f => f.id === over.id ? {...f, groups: [...f.groups, groupToMove!]} : f));
      } else if (activeIsGroup && over.id === 'ungrouped-area') {
        const groupToMove = folders.flatMap(f => f.groups).find(g => g.id === active.id);
        if (!groupToMove) return;

        // Remove group from its folder
        setFolders(prev => prev.map(f => ({...f, groups: f.groups.filter(g => g.id !== active.id)})));
        // Add group to the top-level groups
        setGroups(prev => [...prev, groupToMove]);
      }
    }
  };

  const handleApplyAISuggestions = (newGroups: TabGroupType[]) => {
    // A simple merge strategy: replace existing groups with the same ID, and add new ones.
    const updatedGroups = [...groups];
    const allTabs = [...tabs];

    newGroups.forEach(suggestedGroup => {
      const existingGroupIndex = updatedGroups.findIndex(g => g.id === suggestedGroup.id);
      if (existingGroupIndex !== -1) {
        // Update existing group
        updatedGroups[existingGroupIndex] = { ...updatedGroups[existingGroupIndex], tabs: suggestedGroup.tabs };
      } else {
        // Add new group
        updatedGroups.push({
          id: suggestedGroup.id,
          name: suggestedGroup.name,
          tabs: suggestedGroup.tabs,
          color: '#cccccc' // Default color for new groups
        });
      }
    });

    // Update tabs that are now in groups
    const groupedTabIds = new Set(updatedGroups.flatMap(g => g.tabs.map(t => t.id)));
    const ungroupedTabs = allTabs.filter(t => !groupedTabIds.has(t.id));

    setGroups(updatedGroups);
    // For this simple implementation, we'll just update the main tabs list to reflect the new reality.
    // A more complex implementation might want to preserve the original ungrouped tabs.
    setTabs([...ungroupedTabs, ...updatedGroups.flatMap(g => g.tabs)]);

    setIsAISorterOpen(false);
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(folderId)) {
        newSelection.delete(folderId);
      } else {
        newSelection.add(folderId);
      }
      return newSelection;
    });
  };

  const handleUpdateFolderAppearance = (folderId: string, appearance: { color?: string; icon?: string; category?: string }) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, ...appearance, updatedAt: Date.now() } : f));
  };

  const handleBatchRenameFolders = () => {
    if (batchRenameValue.trim() === '') return;
    
    setFolders(prevFolders => prevFolders.map(f => {
      if (selectedFolderIds.has(f.id)) {
        return { ...f, name: batchRenameValue, updatedAt: Date.now() };
      }
      return f;
    }));
    
    setIsBatchRenaming(false);
    setBatchRenameValue('');
    setSelectedFolderIds(new Set());
  };

  const handleBatchGroupTabs = (folderId?: string) => {
    const idsToGroup = Array.from(selectedTabIds);
    if (idsToGroup.length === 0) return;

    const tabsToGroup = tabs.filter(t => idsToGroup.includes(t.id));
    const newGroup: TabGroupType = {
      id: `group-${Date.now()}`,
      name: 'New Group',
      tabs: tabsToGroup,
      color: '#6366f1'
    };

    if (folderId) {
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, groups: [...f.groups, newGroup] } : f));
    } else {
      setGroups(prev => [...prev, newGroup]);
    }

    setSelectedTabIds(new Set());
  };

  const handleBatchCloseTabsInFolder = (folderId: string) => {
    const idsToClose = Array.from(selectedTabIds);
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          groups: f.groups.map(g => ({
            ...g,
            tabs: g.tabs.filter(t => !idsToClose.includes(t.id))
          })).filter(g => g.tabs.length > 0)
        };
      }
      return f;
    }));
    setSelectedTabIds(new Set());
  };

  const handleBatchPinTabsInFolder = (folderId: string) => {
    const idsToPin = Array.from(selectedTabIds);
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          groups: f.groups.map(g => ({
            ...g,
            tabs: g.tabs.map(t => idsToPin.includes(t.id) ? { ...t, keepOpen: true } : t)
          }))
        };
      }
      return f;
    }));
    setSelectedTabIds(new Set());
  };

  const handleBatchPin = () => {
    const idsToPin = Array.from(selectedTabIds);
    setTabs(prevTabs => 
      prevTabs.map(t => idsToPin.includes(t.id) ? { ...t, keepOpen: true } : t)
    );
    setGroups(prevGroups => 
        prevGroups.map(g => ({...g, tabs: g.tabs.map(t => idsToPin.includes(t.id) ? { ...t, keepOpen: true } : t)}))
    );
    setSelectedTabIds(new Set());
  };

  const handleBatchRenameTabs = (folderId: string, newName: string) => {
    const idsToRename = Array.from(selectedTabIds);
    if (idsToRename.length === 0 || newName.trim() === '') return;

    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          groups: f.groups.map(g => ({
            ...g,
            tabs: g.tabs.map(t => idsToRename.includes(t.id) ? { ...t, title: newName } : t)
          }))
        };
      }
      return f;
    }));
    setSelectedTabIds(new Set());
  };

  const handleBatchCloseTabsInFolders = () => {
    setFolders(prev => prev.map(f => {
      if (selectedFolderIds.has(f.id)) {
        return {
          ...f,
          groups: []
        };
      }
      return f;
    }));
    setSelectedFolderIds(new Set());
  };

  const handleBatchPinTabsInFolders = () => {
    setFolders(prev => prev.map(f => {
      if (selectedFolderIds.has(f.id)) {
        return {
          ...f,
          groups: f.groups.map(g => ({
            ...g,
            tabs: g.tabs.map(t => ({ ...t, keepOpen: true }))
          }))
        };
      }
      return f;
    }));
    setSelectedFolderIds(new Set());
  };

  return (
    <div 
      className={`${darkMode ? 'dark' : ''} w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-950 p-4`}
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
    <div className="w-[400px] h-[600px] bg-slate-50 dark:bg-slate-900 shadow-2xl rounded-lg flex flex-col font-sans overflow-hidden relative border border-slate-200 dark:border-slate-800">
      <Selecto
        dragContainer={'.overflow-y-auto'}
        selectableTargets={['.tab-item']}
        onSelect={e => {
            const selectedIds = new Set(selectedTabIds);
            e.added.forEach(el => {
                const tabId = el.dataset.tabId;
                if (tabId) selectedIds.add(tabId);
            });
            e.removed.forEach(el => {
                const tabId = el.dataset.tabId;
                if (tabId) selectedIds.delete(tabId);
            });
            setSelectedTabIds(selectedIds);
        }}
        hitRate={0}
        selectByClick={true}
        toggleContinueSelect={'shift'}
        ratio={0}
      />
      {/* Header */}
      <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-900 z-10">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tab Sorter AI</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAISorterOpen(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400" title="AI Sorter">
            <Sparkles size={18} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <DndContext onDragEnd={handleDragEnd}>
      <main className="flex-grow p-4 overflow-y-auto space-y-6 bg-slate-50 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 px-2">Create Folder</h2>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name..."
              className="flex-grow p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button 
              onClick={handleCreateFolder}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
             <div className="relative flex-grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  value={folderSearchQuery}
                  onChange={(e) => setFolderSearchQuery(e.target.value)}
                  placeholder="Search folders..."
                  className="w-full pl-9 pr-2 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
             </div>
             <div className="flex items-center gap-2">
                <select
                  value={folderSortBy}
                  onChange={(e) => setFolderSortBy(e.target.value as any)}
                  className="px-2 py-2 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none text-slate-600 dark:text-slate-400 focus:border-indigo-500"
                >
                  <option value="manual">Manual</option>
                  <option value="name">Name</option>
                  <option value="groupCount">Size</option>
                  <option value="createdAt">Created</option>
                  <option value="updatedAt">Updated</option>
                </select>
                 <button 
                  onClick={() => setFolderSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title={folderSortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <SortAsc size={16} className={`transition-transform ${folderSortDirection === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setFolderView('list')}
                    className={`p-2 ${folderView === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                  <button 
                    onClick={() => setFolderView('grid')}
                    className={`p-2 ${folderView === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setFolderView('compact')}
                    className={`p-2 ${folderView === 'compact' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="Compact View"
                  >
                    <AlignJustify size={16} />
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Folders */}
        <div className="space-y-6">
          {(() => {
            const categories = Array.from(new Set(sortedFolders.map(f => f.category || 'Uncategorized')));
            const orderedFolders = categories.flatMap(category => 
              sortedFolders.filter(f => (f.category || 'Uncategorized') === category)
            );

            return (
              <SortableContext items={orderedFolders.map(f => f.id)} strategy={verticalListSortingStrategy}>
                {categories.map(category => {
                  const categoryFolders = sortedFolders.filter(f => (f.category || 'Uncategorized') === category);
                  if (categoryFolders.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      {categories.length > 1 && (
                        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 px-2">{category}</h3>
                      )}
                      <div className={folderView === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                        {categoryFolders.map(folder => {
                        const folderTabIds = new Set(folder.groups.flatMap(g => g.tabs.map(t => t.id)));
                        const selectedTabsInFolder = Array.from(selectedTabIds).filter(id => folderTabIds.has(id));

                        return (
                          <FolderItem 
                            key={folder.id} 
                            folder={folder}
                            darkMode={darkMode}
                            onDelete={handleDeleteFolder}
                            onRename={handleRenameFolder}
                            onToggleShare={handleToggleShareFolder}
                            onUpdateAppearance={handleUpdateFolderAppearance}
                            isSelected={selectedFolderIds.has(folder.id)}
                            onSelect={handleFolderSelect}
                            selectedTabCount={selectedTabsInFolder.length}
                            onBatchCloseTabs={() => handleBatchCloseTabsInFolder(folder.id)}
                            onBatchGroupTabs={() => handleBatchGroupTabs(folder.id)}
                            onBatchPinTabs={() => handleBatchPinTabsInFolder(folder.id)}
                            onBatchRenameTabs={(newName) => handleBatchRenameTabs(folder.id, newName)}
                            onToggleKeepOpen={handleToggleKeepOpen}
                            inactiveThreshold={inactiveThreshold}
                            allGroups={groups}
                            onSuggestionAccept={handleMoveTabToGroup}
                            onCloseTab={setTabToClose}
                            onColorChange={handleGroupColorChange}
                            selectedTabIds={selectedTabIds}
                            onTabSelect={handleTabSelect}
                            onGenerateTags={handleGenerateTags}
                            viewMode={folderView}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </SortableContext>
          );
        })()}
      </div>

        {/* Ungrouped area droppable */}
        <div id="ungrouped-area" className="min-h-[100px]">
          {/* Groups */}
        {groups.map((group) => (
          <TabGroup 
            key={group.id} 
            group={group} 
            onToggleKeepOpen={handleToggleKeepOpen} 
            inactiveThreshold={inactiveThreshold} 
            groups={groups}
            onSuggestionAccept={handleMoveTabToGroup}
            onClose={setTabToClose}
            onColorChange={handleGroupColorChange}
            selectedTabIds={selectedTabIds}
            onTabSelect={handleTabSelect}
          />
        ))}

          {/* Ungrouped Tabs */}
        </div>
        {savedSessions.length > 0 && (
            <div>
                <h2 className="text-sm font-semibold text-slate-500 mb-2 px-2">Saved Sessions</h2>
                <div className="space-y-2">
                    {savedSessions.map(session => (
                        <SavedSessionItem key={session.id} session={session} onRestore={handleRestoreSession} />
                    ))}
                </div>
            </div>
        )}

        {ungroupedTabs.length > 0 && (
            <div>
                <h2 className="text-sm font-semibold text-slate-500 mb-2 px-2">Ungrouped Tabs</h2>
                <div className="space-y-1">
                {ungroupedTabs.map((tab) => (
                    <TabItem 
                        key={tab.id} 
                        tab={tab} 
                        onToggleKeepOpen={handleToggleKeepOpen} 
                        isUngrouped={true}
                        groups={groups}
                        onSuggestionAccept={handleMoveTabToGroup}
                        inactiveThreshold={inactiveThreshold}
                        onClose={setTabToClose}
                        isSelected={selectedTabIds.has(tab.id)}
                        onSelect={handleTabSelect}
                    />
                ))}
                </div>
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Sort & Save End-of-Day Tabs
        </button>
      </footer>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel 
            onClose={() => setIsSettingsOpen(false)} 
            settings={{ 
              inactiveThreshold,
              autoSave: 'manual',
              tabPersistence: 'forever',
              darkMode,
              themeColor,
              memorySavingMode,
              memorySavingDuration
            }}
            onSettingsChange={(newSettings) => {
              if (newSettings.inactiveThreshold !== undefined) {
                setInactiveThreshold(newSettings.inactiveThreshold);
              }
              if (newSettings.darkMode !== undefined) {
                setDarkMode(newSettings.darkMode);
              }
              if (newSettings.themeColor !== undefined) {
                setThemeColor(newSettings.themeColor);
              }
              if (newSettings.memorySavingMode !== undefined) {
                setMemorySavingMode(newSettings.memorySavingMode);
              }
              if (newSettings.memorySavingDuration !== undefined) {
                setMemorySavingDuration(newSettings.memorySavingDuration);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tabToClose && (
            <ConfirmationDialog 
                title="Close Tab"
                message={`Are you sure you want to close this tab: ${tabToClose.title}?`}
                onConfirm={() => handleCloseTab(tabToClose.id)}
                onCancel={() => setTabToClose(null)}
                confirmText='Close'
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
            <EndOfDayModal 
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmEndOfDay}
                tabsToClose={tabs.filter(t => !t.keepOpen).length}
                tabsToKeep={tabs.filter(t => t.keepOpen).length}
            />
        )}
      </AnimatePresence>

      </DndContext>
      <AnimatePresence>
        {selectedFolderIds.size > 0 && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] bg-indigo-900 text-white rounded-lg shadow-lg z-20 flex items-center justify-between p-2"
            >
                <div className="flex items-center gap-2 flex-grow">
                  <span className="text-xs font-medium px-2 whitespace-nowrap">{selectedFolderIds.size} folders</span>
                  <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-700 mx-1" />
                  
                  {isBatchRenaming ? (
                    <div className="flex items-center gap-2 flex-grow">
                      <input 
                        type="text" 
                        value={batchRenameValue}
                        onChange={(e) => setBatchRenameValue(e.target.value)}
                        placeholder="New name..."
                        className="flex-grow p-1 text-xs border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleBatchRenameFolders()}
                      />
                      <button onClick={handleBatchRenameFolders} className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setIsBatchRenaming(false)} className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsBatchRenaming(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        <Edit size={12} /> Rename
                      </button>
                      <button 
                        onClick={handleBatchPinTabsInFolders}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        title="Pin all tabs in selected folders"
                      >
                        <Pin size={12} /> Pin Tabs
                      </button>
                      <button 
                        onClick={handleBatchCloseTabsInFolders}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        title="Close all tabs in selected folders"
                      >
                        <X size={12} /> Close Tabs
                      </button>
                      <button 
                        onClick={() => {
                          setFolders(prev => prev.filter(f => !selectedFolderIds.has(f.id)));
                          setSelectedFolderIds(new Set());
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                      <button 
                        onClick={() => setSelectedFolderIds(new Set())}
                        className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTabIds.size > 0 && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] bg-slate-800 text-white rounded-lg shadow-lg z-20 flex items-center justify-between p-2"
            >
                <span className="text-sm font-medium px-2">{selectedTabIds.size} selected</span>
                <div className="flex items-center gap-2">
                    <button onClick={handleBatchPin} className="p-2 rounded-md hover:bg-slate-700" title="Pin Selected">
                        <Pin size={16} />
                    </button>
                    <button onClick={handleBatchClose} className="p-2 rounded-md hover:bg-slate-700" title="Close Selected">
                        <X size={16} />
                    </button>
                    <button onClick={() => setSelectedTabIds(new Set())} className="p-2 rounded-md hover:bg-slate-700 text-xs font-semibold">
                        Clear
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAISorterOpen && (
          <AISorterModal 
            tabs={tabs}
            groups={groups}
            onApply={handleApplyAISuggestions}
            onClose={() => setIsAISorterOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

