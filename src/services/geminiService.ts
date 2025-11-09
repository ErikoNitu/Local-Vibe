import { GoogleGenAI, Type } from "@google/genai";
import { Event } from '../types';

const fetchMockEvents = async (): Promise<Event[]> => {
  // This check is for the development environment.
  // In a real production environment, the API key would be managed securely.
  if (!import.meta.env.VITE_REACT_APP_GEMINI_API_KEY) {
    console.warn("VITE_REACT_APP_GEMINI_API_KEY environment variable not set. Returning static mock data.");
    // Return a single static event if API key is not available
    return [
        {
            id: 'static-1',
            title: 'Acoustic Concert in Garden',
            description: 'Enjoy an evening of live music in an intimate setting. Local artists will perform known pieces and original compositions.',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: false,
            category: 'Music',
            organizer: 'Urban Garden',
            position: { lat: 44.435, lng: 26.10  },
            imageUrl: 'https://picsum.photos/seed/music/400/300'
        }
    ];
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_REACT_APP_GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a list of 15 diverse fictional local events for Bucharest, Romania. Include concerts, workshops, fairs and sports events. Make sure the dates are in the near future (next 2-3 weeks). The `lat` and `lng` coordinates must be valid for the Bucharest area (e.g: lat between 44.40 and 44.45, lng between 26.05 and 26.15).",
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
                  id: { type: Type.STRING, description: 'A unique ID, e.g: event-1' },
                  title: { type: Type.STRING, description: 'Event title' },
                  description: { type: Type.STRING, description: 'A brief event description' },
                  date: { type: Type.STRING, description: 'Event date in ISO 8601 format' },
                  isFree: { type: Type.BOOLEAN, description: 'Whether the event is free' },
                  category: { type: Type.STRING, description: 'Event category (e.g: Music, Art, Sports)' },
                  organizer: { type: Type.STRING, description: 'Organizer name' },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER, description: 'Location latitude (e.g: 44.4268)' },
                      lng: { type: Type.NUMBER, description: 'Location longitude (e.g: 26.1025)' }
                    }
                  },
                   imageUrl: { type: Type.STRING, description: 'URL of a placeholder image (e.g: https://picsum.photos/seed/random-word/400/300)' }
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
            title: 'Local Crafts Fair',
            description: 'Discover unique products created by local craftspeople. Jewelry, ceramics, decorations and much more.',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: true,
            category: 'Fair',
            organizer: 'Craftspeople Community',
            position: { lat: 44.44, lng: 26.09 },
            imageUrl: 'https://picsum.photos/seed/crafts/400/300'
        },
        {
            id: 'fallback-2',
            title: 'City Marathon',
            description: 'Join the biggest running event in the city. Courses for all fitness levels.',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            isFree: false,
            category: 'Sports',
            organizer: 'RunClub',
            position: { lat: 44.41, lng: 26.11 },
            imageUrl: 'https://picsum.photos/seed/running/400/300'
        }
    ];
  }
};

const parseUserInputWithGemini = async (userInput: string, events: Event[], userLocation?: { lat: number; lng: number }): Promise<{eventIds: string[], aiMessage: string}> => {
  if (!import.meta.env.VITE_REACT_APP_GEMINI_API_KEY) {
    return { eventIds: [], aiMessage: "API key not configured. Please check your environment variables." };
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_REACT_APP_GEMINI_API_KEY });

  try {
    // Filter events to only include today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });

    if (todayEvents.length === 0) {
      return { eventIds: [], aiMessage: "Sorry, there are no events scheduled for today. Would you like me to recommend events for another day?" };
    }

    // Helper function to calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const eventsContext = todayEvents.map((e, index) => {
      const eventTime = new Date(e.date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      const eventHour = new Date(e.date).getHours();
      let distanceInfo = '';
      
      if (userLocation) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, e.position.lat, e.position.lng);
        distanceInfo = `, Distance from user: ${distance.toFixed(1)} km`;
      }
      
      return `${index}. "${e.title}" (ID: ${e.id}, Category: ${e.category}, Hour: ${eventHour}:00): ${e.description} at ${eventTime}${distanceInfo}, Free: ${e.isFree}, Organizer: ${e.organizer}`;
    }).join('\n');

    const userLocationInfo = userLocation ? `\nUser's current location: Latitude ${userLocation.lat.toFixed(4)}, Longitude ${userLocation.lng.toFixed(4)}` : '';

    const prompt = `You are an AI Event Assistant for finding events in Bucharest, Romania. Your role is to recommend ONLY TODAY'S events based on user's mood, interests, specific activities, preferred hour, or location proximity.

Available events TODAY:
${eventsContext}${userLocationInfo}

User's message: "${userInput}"

IMPORTANT INSTRUCTIONS:
1. Only recommend events from TODAY's list above.
2. Consider the following when recommending:
   - If user mentions a specific hour (e.g., "evening", "afternoon", "16:00", "after work"), prioritize events happening around that time.
   - If user wants events "near me" or mentions location, prioritize events closest to their location.
   - Consider user's mood and interests.
3. If you understand the user's preferences clearly, recommend UP TO 3 events from today that match best. Return a JSON object with:
   {
     "eventIds": ["event-id-1", "event-id-2"],
     "aiMessage": "Your friendly recommendation message explaining why these events match their interest, including event times and distances if relevant."
   }

4. If the user's intent is unclear or you need more information to make better recommendations, ask clarifying questions. Return:
   {
     "eventIds": [],
     "aiMessage": "Your friendly question asking for clarification about today's activities"
   }

5. If no TODAY's events match their criteria, return:
   {
     "eventIds": [],
     "aiMessage": "Sorry, no today's events match your criteria. But here are some today's activities available: [brief list]. What sounds interesting?"
   }

6. Always respond in a friendly and conversational tone in Romanian.
7. Never recommend more than 3 events.
8. Mention specific event times and distances (if applicable) in your recommendations.

Respond ONLY with the JSON object, no other text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const responseText = response.text.trim();
    // Extract JSON object from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        eventIds: Array.isArray(result.eventIds) ? result.eventIds.slice(0, 3) : [],
        aiMessage: result.aiMessage || "I'm here to help you find today's events!"
      };
    }
    return { eventIds: [], aiMessage: "I'm here to help you find today's events! Tell me about your mood or what activity you'd like to do today." };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { eventIds: [], aiMessage: "Sorry, I encountered an issue. Please try again!" };
  }
};

// Reverse geocoding function to convert lat/lng to location name using Gemini
const reverseGeocodeWithGemini = async (lat: number, lng: number): Promise<string> => {
  if (!import.meta.env.VITE_REACT_APP_GEMINI_API_KEY) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_REACT_APP_GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Given the coordinates latitude: ${lat} and longitude: ${lng}, what is the exact location name or address? Respond with just the location name or address, nothing else. Be concise and specific.`
    });

    const locationName = response.text.trim();
    return locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error("Error reverse geocoding with Gemini:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export { fetchMockEvents, parseUserInputWithGemini, reverseGeocodeWithGemini };