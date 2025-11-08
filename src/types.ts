export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  isFree: boolean;
  category: string;
  organizer: string;
  position: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
}
