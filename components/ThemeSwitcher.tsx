import React from 'react';
import type { Theme } from '../App';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
      <button
        onClick={onThemeChange}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-[var(--color-primary-500)] transition-all duration-300"
        aria-label={`Mudar para o modo ${currentTheme === 'light' ? 'escuro' : 'claro'}`}
        title={`Mudar para o modo ${currentTheme === 'light' ? 'escuro' : 'claro'}`}
      >
        {currentTheme === 'light' ? (
            <MoonIcon className="w-6 h-6" />
        ) : (
            <SunIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};