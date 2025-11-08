import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, Query } from 'firebase/firestore';
import { firebaseConfig } from './firebase';
import { initializeApp } from 'firebase/app';
import { Event } from '../../types';

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
        position: {
          lat: data.position?.lat || 44.43,
          lng: data.position?.lng || 26.10,
        },
        imageUrl: data.imageUrl || 'https://picsum.photos/seed/event/400/300',
      };
      events.push(event);
    });
    
    console.log(`Successfully loaded ${events.length} events from Firestore`);
    return events;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return [];
  }
};