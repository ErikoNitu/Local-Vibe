import React from 'react';

interface MapsLoadingStateProps {
  isMapsApiLoaded: boolean;
  mapError: string | null;
}

const MapsLoadingState: React.FC<MapsLoadingStateProps> = ({ isMapsApiLoaded, mapError }) => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-800/50">
      <div className="text-center p-8 bg-gray-900 rounded-lg shadow-xl max-w-lg mx-4">
        {mapError ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.006-1.742 3.006H4.42c-1.522 0-2.492-1.672-1.742-3.006l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-red-400">Eroare la încărcarea hărții</h2>
            <div className="mt-2 text-gray-300 text-left px-4">
              <p className="font-semibold mb-2">Cheia API pentru Google Maps este invalidă sau configurată greșit. Te rugăm să verifici următoarele în <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google Cloud Console</a>:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Cheia API este corectă:</strong> Asigură-te că folosești cheia API corectă.</li>
                <li><strong>Serviciul "Maps JavaScript API" este activat:</strong> Accesează "APIs & Services" &rarr; "Library" și activează-l pentru proiectul tău.</li>
                <li><strong>Facturarea este activată:</strong> Google Maps Platform necesită un cont de facturare activat pentru proiect.</li>
                <li><strong>Fără restricții de blocare:</strong> Verifică dacă ai setat restricții (ex: referenți HTTP, adrese IP) care ar putea bloca cererea. Pentru testare, poți încerca să le elimini temporar.</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-lg">{!isMapsApiLoaded ? 'Se încarcă harta...' : 'Se încarcă evenimentele...'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default MapsLoadingState;