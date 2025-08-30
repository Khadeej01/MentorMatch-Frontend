export interface Booking {
  id: string;
  mentorId: string;
  learnerId: string;
  date: string; // ISO date string
  time: string; // e.g., "10:00 AM"
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  // Add other relevant booking properties here
}
