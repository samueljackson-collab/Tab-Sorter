/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Tab } from '../types';

interface EndOfDayModalProps {
  onClose: () => void;
  onConfirm: () => void;
  tabsToClose: number;
  tabsToKeep: number;
}

export function EndOfDayModal({ onClose, onConfirm, tabsToClose, tabsToKeep }: EndOfDayModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 p-6 border border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">End of Day Sort & Save</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          This will sort and save your tabs for the day. Are you sure you want to proceed?
        </p>
        
        <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm space-y-2 border border-slate-100 dark:border-slate-700">
            <div className='flex justify-between'>
                <span className='text-slate-700 dark:text-slate-300'>Tabs to be closed & saved:</span>
                <span className='font-bold text-slate-800 dark:text-slate-100'>{tabsToClose}</span>
            </div>
            <div className='flex justify-between'>
                <span className='text-slate-700 dark:text-slate-300'>Tabs to keep open:</span>
                <span className='font-bold text-slate-800 dark:text-slate-100'>{tabsToKeep}</span>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Confirm & Sort
          </button>
        </div>
      </motion.div>
    </>
  );
}
