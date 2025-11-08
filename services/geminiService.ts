import { GoogleGenAI, Type } from "@google/genai";
import { Event } from '../types';

const fetchMockEvents = async (): Promise<Event[]> => {
  // This check is for the development environment.
  // In a real production environment, the API key would be managed securely.
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Returning static mock data.");
    // Return a single static event if API key is not available
    return [
        {
            id: 'static-1',
            title: 'Concert Acustic în Grădină',
            description: 'Bucură-te de o seară de muzică live într-un cadru intim. Artiști locali vor interpreta piese cunoscute și compoziții proprii.',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: false,
            category: 'Muzică',
            organizer: 'Grădina Urbană',
            position: { lat: 44.435, lng: 26.10  },
            imageUrl: 'https://picsum.photos/seed/music/400/300'
        }
    ];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generează o listă de 15 evenimente locale fictive diverse pentru București, România. Include concerte, ateliere, târguri și evenimente sportive. Asigură-te că datele sunt în viitorul apropiat (următoarele 2-3 săptămâni). Coordonatele `lat` și `lng` trebuie să fie valide pentru zona București (ex: lat între 44.40 și 44.45, lng între 26.05 și 26.15).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'Un ID unic, ex: event-1' },
                  title: { type: Type.STRING, description: 'Titlul evenimentului' },
                  description: { type: Type.STRING, description: 'O scurtă descriere a evenimentului' },
                  date: { type: Type.STRING, description: 'Data evenimentului în format ISO 8601' },
                  isFree: { type: Type.BOOLEAN, description: 'Dacă evenimentul este gratuit' },
                  category: { type: Type.STRING, description: 'Categoria evenimentului (ex: Muzică, Artă, Sport)' },
                  organizer: { type: Type.STRING, description: 'Numele organizatorului' },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER, description: 'Latitudinea locației (ex: 44.4268)' },
                      lng: { type: Type.NUMBER, description: 'Longitudinea locației (ex: 26.1025)' }
                    }
                  },
                   imageUrl: { type: Type.STRING, description: 'URL-ul unei imagini placeholder (ex: https://picsum.photos/seed/random-word/400/300)' }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData.events;
  } catch (error) {
    console.error("Error fetching events from Gemini API:", error);
    // Return static data as a fallback in case of API error
    return [
        {
            id: 'fallback-1',
            title: 'Târg de Artizanat Local',
            description: 'Descoperă produse unice create de meșteri locali. Bijuterii, ceramică, decorațiuni și multe altele.',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: true,
            category: 'Târg',
            organizer: 'Comunitatea Meșterilor',
            position: { lat: 44.44, lng: 26.09 },
            imageUrl: 'https://picsum.photos/seed/crafts/400/300'
        },
        {
            id: 'fallback-2',
            title: 'Maratonul Orașului',
            description: 'Alătură-te celui mai mare eveniment de alergare din oraș. Trasee pentru toate nivelurile de pregătire.',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: false,
            category: 'Sport',
            organizer: 'RunClub',
            position: { lat: 44.41, lng: 26.11 },
            imageUrl: 'https://picsum.photos/seed/running/400/300'
        }
    ];
  }
};

export { fetchMockEvents };