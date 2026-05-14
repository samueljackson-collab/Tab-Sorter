/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Tab, TabGroup } from '../types';
import { getAISortingSuggestions } from '../services/geminiService';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface AISorterModalProps {
  tabs: Tab[];
  groups: TabGroup[];
  onApply: (newGroups: TabGroup[]) => void;
  onClose: () => void;
}

export function AISorterModal({ tabs, groups, onApply, onClose }: AISorterModalProps) {
  const [userPreference, setUserPreference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<TabGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const result = await getAISortingSuggestions(
      tabs.map(t => ({ id: t.id, title: t.title, url: t.url })),
      groups.map(g => ({ id: g.id, name: g.name })),
      userPreference
    );

    if (result) {
      // Reconstruct full tab objects in the suggestions
      const newGroups = result.map((groupSuggestion: any) => ({
        ...groupSuggestion,
        tabs: groupSuggestion.tabs.map((tabId: string) => tabs.find(t => t.id === tabId)).filter(Boolean)
      }));
      setSuggestions(newGroups);
    } else {
      setError('Could not get suggestions. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
            AI-Powered Tab Sorter
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
            <X size={18} />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="user-preference" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Sorting Preference (optional)</label>
            <textarea 
              id="user-preference"
              value={userPreference}
              onChange={(e) => setUserPreference(e.target.value)}
              placeholder="e.g., 'Group tabs by project,' 'Separate work and personal,' 'Group all social media tabs together'"
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg h-24 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {suggestions && (
            <div>
              <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Suggested Organization</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                {suggestions.map(group => (
                  <div key={group.id}>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{group.name}</p>
                    <ul className="list-disc list-inside pl-2 text-sm text-slate-600 dark:text-slate-400">
                      {group.tabs.map(tab => <li key={tab.id}>{tab.title}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 flex justify-end items-center gap-2">
          <button onClick={onClose} className="text-slate-600 dark:text-slate-400 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          {suggestions ? (
            <button 
              onClick={() => onApply(suggestions)}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Suggestions
            </button>
          ) : (
            <button 
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 flex items-center gap-2"
            >
              {isLoading ? 'Thinking...' : 'Generate Suggestions'}
            </button>
          )}
        </footer>
      </div>
    </motion.div>
  );
}