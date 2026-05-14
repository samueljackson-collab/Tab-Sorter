/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function ColorPicker({ currentColor, onColorChange }: { currentColor: string, onColorChange: (color: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rgb, setRgb] = useState(hexToRgb(currentColor));

  useEffect(() => {
    setRgb(hexToRgb(currentColor));
  }, [currentColor]);

  const handleRgbChange = (key: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.min(255, Math.max(0, parseInt(value) || 0));
    const newRgb = { ...rgb, [key]: numValue };
    // Update local RGB state immediately
    setRgb(newRgb);
    // Propagate change to parent
    onColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-4 h-4 rounded-full ring-2 ring-offset-1 ring-transparent hover:ring-slate-300 dark:hover:ring-slate-600"
        style={{ backgroundColor: currentColor }}
      />
      {isOpen && (
        <div className="absolute z-10 top-full mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <HexColorPicker color={currentColor} onChange={onColorChange} />
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: currentColor }} />
              <input 
                type="text" 
                value={currentColor} 
                onChange={(e) => onColorChange(e.target.value)}
                className="text-xs font-mono w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300"
              />
            </div>
            
            <div className="flex gap-1 justify-between">
              {['r', 'g', 'b'].map((channel) => (
                <div key={channel} className="flex flex-col items-center">
                  <label className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">{channel}</label>
                  <input 
                    type="number"
                    min="0"
                    max="255"
                    value={rgb[channel as keyof typeof rgb]}
                    onChange={(e) => handleRgbChange(channel as 'r' | 'g' | 'b', e.target.value)}
                    className="w-12 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300 text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
