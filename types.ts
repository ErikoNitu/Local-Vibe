export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string format
  isFree: boolean;
  category: string;
  organizer: string;
  phoneNumber?: string; // Optional phone number
  position: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  photos?: string[]; // Array of photo URLs
  distance?: number; // Distance from user location in km
}

export enum PriceFilter {
  All = 'all',
  Free = 'free',
  Paid = 'paid',
}

export enum DateFilter {
  All = 'all',
  Today = 'today',
  ThisWeek = 'this_week',
  NextWeek = 'next_week',
  ThisWeekend = 'this_weekend',
}

export interface Filters {
  price: PriceFilter;
  date: DateFilter;
  search: string;
}

// Fix: Correctly structure Google Maps type declarations within a `declare global`
// block. Because this file is a module (due to `export`), top-level `declare namespace`
// is scoped to the module and not global. This change makes the `google` namespace
// available globally, resolving TypeScript errors in other files.
declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: any);
      }

      namespace marker {
        class AdvancedMarkerElement {
          constructor(opts?: any);
          addListener(eventName: string, handler: () => void): any;
          content: HTMLElement;
          map: Map | null;
          position: any;
          title: string;
        }
      }
    }
  }

  interface Window {
    google: typeof google;
  }
}
