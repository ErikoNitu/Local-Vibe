import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, Query } from 'firebase/firestore';
import { firebaseConfig } from './firebase';
import { initializeApp } from 'firebase/app';
import { Event } from '../../types';
import { fetchMockEvents } from './geminiService';

// Hardcoded fallback events for development/testing
const FALLBACK_EVENTS: Event[] = [
  {
    id: 'fallback-concert-1',
    title: 'Acoustic Concert in Garden',
    description: 'Enjoy an evening of live music in an intimate setting. Local artists will perform known pieces and original compositions.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isFree: false,
    category: 'Music',
    organizer: 'Urban Garden',
    position: { lat: 44.435, lng: 26.105 },
    imageUrl: 'https://picsum.photos/seed/music/400/300',
  },
  {
    id: 'fallback-craft-fair-1',
    title: 'Local Crafts Fair',
    description: 'Discover unique products created by local craftspeople. Jewelry, ceramics, decorations and much more.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isFree: true,
    category: 'Fair',
    organizer: 'Craftspeople Community',
    position: { lat: 44.440, lng: 26.090 },
    imageUrl: 'https://picsum.photos/seed/crafts/400/300',
  },
  {
    id: 'fallback-marathon-1',
    title: 'City Marathon',
    description: 'Join the biggest running event in the city. Courses for all fitness levels.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isFree: false,
    category: 'Sports',
    organizer: 'RunClub',
    position: { lat: 44.410, lng: 26.110 },
    imageUrl: 'https://picsum.photos/seed/running/400/300',
  },
];

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addEventToFirestore = async (
  eventData: any,
  userId: string,
  userDisplayName: string | null
) => {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      userId,
      userDisplayName: userDisplayName || 'Anonymous',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding event to Firestore:', error);
    throw error;
  }
};

export const fetchEventsFromFirestore = async (): Promise<Event[]> => {
  try {
    const q = query(collection(db, 'events'));
    const querySnapshot = await getDocs(q);
    const events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure position exists with proper structure
      const event: Event = {
        id: doc.id,
        title: data.title || 'Untitled Event',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        isFree: data.isFree ?? false,
        category: data.category || 'Other',
        organizer: data.organizer || 'Unknown',
        phoneNumber: data.phoneNumber || '',
        position: {
          lat: data.position?.lat || 44.43,
          lng: data.position?.lng || 26.10,
        },
        imageUrl: data.imageUrl || 'https://picsum.photos/seed/event/400/300',
        photos: data.photos || [],
      };
      events.push(event);
    });
    
    console.log(`Successfully loaded ${events.length} events from Firestore`);
    
    // If no events in Firestore, use mock events for development/testing
    if (events.length === 0) {
      console.log('No events in Firestore, trying to fetch mock events...');
      try {
        const mockEvents = await fetchMockEvents();
        console.log(`Loaded ${mockEvents.length} mock events`);
        return mockEvents.length > 0 ? mockEvents : FALLBACK_EVENTS;
      } catch (mockError) {
        console.error('Error fetching mock events, using hardcoded fallback:', mockError);
        return FALLBACK_EVENTS;
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    // Fallback to hardcoded events on error
    console.log('Using hardcoded fallback events');
    return FALLBACK_EVENTS;
  }
};