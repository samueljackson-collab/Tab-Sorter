/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }: ConfirmationDialogProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/40 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            {confirmText}
          </button>
        </div>
      </motion.div>
    </>
  );
}
