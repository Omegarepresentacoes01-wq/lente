import React, { useState, useEffect } from 'react';
import type { GroundingChunk } from '../types';
import { MapDisplay } from './MapDisplay';
import { ErrorAlert } from './ErrorAlert';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ResultDisplayProps {
  query: string;
  text: string;
  sources: GroundingChunk[];
  primaryMapSourceTitle: string | null;
  onFetchDetails: () => void;
  additionalDetails: string;
  isFetchingDetails: boolean;
  detailsError: string | null;
}

const SourceLink: React.FC<{ title: string; uri: string }> = ({ title, uri }) => (
    <a
      href={uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-100 dark:bg-gray-700 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 p-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
    >
      <p className="font-semibold text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)] truncate">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{uri}</p>
    </a>
  );

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    query,
    text, 
    sources, 
    primaryMapSourceTitle,
    onFetchDetails,
    additionalDetails,
    isFetchingDetails,
    detailsError
}) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'map'>('summary');
    const validMapSources = sources.filter(s => s.maps && s.maps.uri && s.maps.title);
    
    useEffect(() => {
        // Reset to summary view when a new result is displayed
        setActiveTab('summary');
    }, [text, query]);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-md overflow-hidden animate-fade-in">
      <div className="p-6 sm:p-8">
        {primaryMapSourceTitle ? (
            <div>
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                                activeTab === 'summary'
                                ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            Resumo
                        </button>
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                                activeTab === 'map'
                                ? 'border-[var(--color-primary-500)] text-[var(--color-primary-500)] dark:text-[var(--color-primary-400)]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                            Mapa
                        </button>
                    </nav>
                </div>
                <div className="min-h-[320px]">
                    {activeTab === 'summary' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resultado para "{query}"</h2>
                            <div className="prose dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                                {text}
                            </div>
                        </div>
                    )}
                    {activeTab === 'map' && primaryMapSourceTitle && (
                        <div className="animate-fade-in">
                             <MapDisplay placeTitle={primaryMapSourceTitle} />
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Resultado para "{query}"</h2>
                <div className="prose dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                    {text}
                </div>
            </div>
        )}

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          {!additionalDetails && !isFetchingDetails && !detailsError && (
             <button 
              onClick={onFetchDetails}
              disabled={isFetchingDetails}
              className="inline-flex items-center gap-2 bg-[var(--color-primary-600)]/90 hover:bg-[var(--color-primary-500)]/90 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300"
            >
              <SparklesIcon className="w-5 h-5" />
              Me diga mais sobre "{query}"
            </button>
          )}

          {isFetchingDetails && (
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <SpinnerIcon className="w-5 h-5" />
              <span>Buscando mais detalhes...</span>
            </div>
          )}

          {detailsError && <ErrorAlert message={detailsError} />}

          {additionalDetails && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mais Detalhes</h3>
              <div className="prose dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-headings:text-gray-900 dark:prose-headings:text-white whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed">
                {additionalDetails}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {validMapSources.length > 0 && (
        <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fontes do Google Maps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validMapSources.map((source, index) => (
                source.maps && <SourceLink key={`map-${index}`} title={source.maps.title} uri={source.maps.uri} />
            ))}
            </div>
        </div>
      )}
    </div>
  );
};