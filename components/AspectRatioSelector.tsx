import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
  disabled?: boolean;
}

const ratios = [
  { value: AspectRatio.SQUARE, label: '1:1', icon: 'Square' },
  { value: AspectRatio.PORTRAIT, label: '3:4', icon: 'Portrait' },
  { value: AspectRatio.LANDSCAPE, label: '4:3', icon: 'Landscape' },
  { value: AspectRatio.WIDE, label: '16:9', icon: 'Wide' },
  { value: AspectRatio.TALL, label: '9:16', icon: 'Tall' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onChange, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {ratios.map((ratio) => (
        <button
          key={ratio.value}
          onClick={() => onChange(ratio.value)}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border
            ${selected === ratio.value 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {ratio.label}
        </button>
      ))}
    </div>
  );
};