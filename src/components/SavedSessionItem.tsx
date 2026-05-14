/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SavedSession } from '../types';
import { ChevronDown } from 'lucide-react';

function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function SavedSessionItem({ session, onRestore }: { key?: string | number, session: SavedSession, onRestore: (session: SavedSession) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{formatDate(session.date)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{session.tabs.length} tabs saved</p>
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={(e) => { e.stopPropagation(); onRestore(session); }} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Restore</button>
                    <ChevronDown size={20} className={`text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    {session.tabs.map(tab => (
                        <div key={tab.id} className="flex items-center gap-3 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                             <img src={tab.faviconUrl} alt="" className="w-4 h-4" referrerPolicy="no-referrer" />
                             <div className="truncate">
                                <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{tab.title}</p>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
