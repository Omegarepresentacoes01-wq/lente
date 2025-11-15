import React, { useState, useCallback, useEffect } from 'react';
import { searchWithMaps, getAdditionalDetails } from './services/geminiService';
import type { Location, GroundingChunk } from './types';
import { SearchInput } from './components/SearchInput';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { MapPinIcon } from './components/icons/MapPinIcon';
import { ThemeSwitcher } from './components/ThemeSwitcher';

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('local-lens-theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
};

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [primaryMapSourceTitle, setPrimaryMapSourceTitle] = useState<string | null>(null);
  
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // useEffect to handle the side effects of theme changes (DOM manipulation, localStorage)
  useEffect(() => {
    localStorage.setItem('local-lens-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);


  const handleRequestLocation = useCallback(() => {
    setLocationError(null);
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('success');
      },
      (err: GeolocationPositionError) => {
        console.error(`Geolocation error (${err.code}): ${err.message}`);
        let userMessage = "Não foi possível obter sua localização. As buscas podem ser menos precisas.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            userMessage = "O acesso à geolocalização foi negado. Por favor, ative os serviços de localização nas configurações do seu navegador para resultados próximos.";
            break;
          case err.POSITION_UNAVAILABLE:
            userMessage = "As informações de localização estão indisponíveis no momento. Verifique seu dispositivo ou rede.";
            break;
          case err.TIMEOUT:
            userMessage = "A solicitação para obter sua localização expirou.";
            break;
        }
        setLocationError(userMessage);
        setLocationStatus('error');
        setLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResultText('');
    setSources([]);
    setPrimaryMapSourceTitle(null);
    setAdditionalDetails('');
    setDetailsError(null);

    try {
      const response = await searchWithMaps(query, location);
      const text = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      setResultText(text);
      setSources(groundingChunks);

      const firstMapSource = groundingChunks.find(c => c.maps?.title);
      if (firstMapSource?.maps?.title) {
        setPrimaryMapSourceTitle(firstMapSource.maps.title);
      }

    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao buscar os dados. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [query, location, isLoading]);

  const handleFetchDetails = useCallback(async () => {
    if (!query || isFetchingDetails) return;
    setIsFetchingDetails(true);
    setDetailsError(null);
    setAdditionalDetails('');
    try {
        const details = await getAdditionalDetails(query);
        setAdditionalDetails(details);
    } catch (e) {
        console.error(e);
        setDetailsError("Desculpe, não consegui buscar mais detalhes no momento.");
    } finally {
        setIsFetchingDetails(false);
    }
}, [query, isFetchingDetails]);


  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <ThemeSwitcher currentTheme={theme} onThemeChange={handleThemeChange} />
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <MapPinIcon className="w-10 h-10 text-[var(--color-primary-400)]" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Lente Local</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Encontre informações atualizadas sobre qualquer lugar usando Gemini com Google Maps.
          </p>
        </header>

        <main>
          <SearchInput
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
            onRequestLocation={handleRequestLocation}
            locationStatus={locationStatus}
          />

          {locationError && (
            <div className="mt-4 text-center text-sm text-yellow-800 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 rounded-md p-2">
              {locationError}
            </div>

          )}

          <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            
            {!isLoading && !error && resultText && (
              <ResultDisplay 
                query={query}
                text={resultText} 
                sources={sources}
                primaryMapSourceTitle={primaryMapSourceTitle}
                onFetchDetails={handleFetchDetails}
                additionalDetails={additionalDetails}
                isFetchingDetails={isFetchingDetails}
                detailsError={detailsError}
              />
            )}
            
            {!isLoading && !resultText && !error && (
               <div className="text-center text-gray-500 dark:text-gray-400 p-8 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
                <p>Digite uma empresa, endereço ou cidade para começar.</p>
                <p className="text-sm mt-2">Por exemplo: "Torre Eiffel", "cafés perto de mim" ou "Avenida Paulista, 1578, São Paulo, SP"</p>
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-600 text-sm">
            <p>Desenvolvido com Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;