/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wand2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { suggestGroupForTab } from '../services/geminiService';
import { Tab, TabGroup } from '../types';

interface AIGroupSuggesterProps {
  tab: Tab;
  groups: TabGroup[];
  onSuggestionAccept: (tabId: string, groupName: string) => void;
}

export function AIGroupSuggester({ tab, groups, onSuggestionAccept }: AIGroupSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    const groupNames = groups.map(g => g.name);
    const result = await suggestGroupForTab({ title: tab.title, url: tab.url }, groupNames);
    
    setIsLoading(false);
    if (result) {
      setSuggestion(result);
    } else {
      setError('Could not find a suitable group.');
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onSuggestionAccept(tab.id, suggestion);
      setSuggestion(null);
    }
  };

  const handleDecline = () => {
    setSuggestion(null);
    setError('Suggestion declined.');
  };

  if (suggestion) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span>Suggest: <span className="font-semibold text-indigo-600">{suggestion}</span></span>
        <button onClick={handleAccept} className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><Check size={12} /></button>
        <button onClick={handleDecline} className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><X size={12} /></button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-xs text-slate-400">Getting suggestion...</div>;
  }

  if (error) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className='text-slate-500'>Manual Action:</span>
            <select 
                onChange={(e) => onSuggestionAccept(tab.id, e.target.value)}
                className='text-xs border border-slate-300 rounded p-1'>
                <option value="">Assign to...</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            <button onClick={handleSuggest} className="p-1 rounded-full text-slate-400 hover:text-indigo-500" title="Retry Suggestion">
                <Wand2 size={14} />
            </button>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className='text-slate-500'>Manual Action:</span>
            <select 
                onChange={(e) => onSuggestionAccept(tab.id, e.target.value)}
                className='text-xs border border-slate-300 rounded p-1'>
                <option value="">Assign to...</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
            <button onClick={handleSuggest} className="p-1 rounded-full text-slate-400 hover:text-indigo-500" title="Retry Suggestion">
                <Wand2 size={14} />
            </button>
        </div>
    )
  }

  return (
    <button onClick={handleSuggest} className="p-1 rounded-full text-slate-400 group-hover:text-indigo-500" title="Suggest Group with AI">
      <Wand2 size={14} />
    </button>
  );
}
