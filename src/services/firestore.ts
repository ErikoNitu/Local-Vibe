import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from './firebase';
import { initializeApp } from 'firebase/app';

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

export const fetchEventsFromFirestore = async () => {
  try {
    const q = query(collection(db, 'events'));
    const querySnapshot = await getDocs(q);
    const events: any[] = [];
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return events;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return [];
  }
};