/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Info, X } from 'lucide-react';

import { HexColorPicker } from 'react-colorful';
import { Settings } from '../types';

interface SettingsPanelProps {
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
}

export function SettingsPanel({ onClose, settings, onSettingsChange }: SettingsPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
    >
      <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Info size={18} className="text-indigo-600 dark:text-indigo-400" style={{ color: settings.themeColor }} />
          Settings
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
          <X size={20} />
        </button>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-6">
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Appearance</h3>
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</label>
            <button 
              onClick={() => onSettingsChange({ darkMode: !settings.darkMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={settings.darkMode ? { backgroundColor: settings.themeColor } : {}}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex flex-col gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Color</label>
            <div className="custom-color-picker">
              <HexColorPicker 
                color={settings.themeColor || '#4f46e5'} 
                onChange={(color) => onSettingsChange({ themeColor: color })} 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tab Management</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inactive Threshold</label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{settings.inactiveThreshold} days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={settings.inactiveThreshold}
              onChange={(e) => onSettingsChange({ inactiveThreshold: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Tabs not accessed for longer than this will be marked as inactive.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Memory Saving Mode</label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Auto-close inactive tab groups</span>
              </div>
              <button 
                onClick={() => onSettingsChange({ memorySavingMode: !settings.memorySavingMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  settings.memorySavingMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.memorySavingMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.memorySavingMode && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inactivity Duration</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{settings.memorySavingDuration} min</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5"
                  value={settings.memorySavingDuration}
                  onChange={(e) => onSettingsChange({ memorySavingDuration: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Auto-Save</h3>
          <div className="flex flex-col gap-2">
            {(['manual', 'hourly', 'daily'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSettingsChange({ autoSave: mode })}
                className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                  settings.autoSave === mode 
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="capitalize">{mode}</span>
                {settings.autoSave === mode && <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Persistence</h3>
          <div className="space-y-2">
             <select 
              value={settings.tabPersistence}
              onChange={(e) => onSettingsChange({ tabPersistence: e.target.value as any })}
              className="w-full p-2 text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500"
             >
               <option value="forever">Keep Forever</option>
               <option value="month">1 Month</option>
               <option value="week">1 Week</option>
             </select>
             <p className="text-[10px] text-slate-400 dark:text-slate-500">How long to keep closed tab history.</p>
          </div>
        </section>
      </main>

      <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">Tab Sorter v1.2.0 • Crafted with care</p>
      </footer>
    </motion.div>
  );
}
