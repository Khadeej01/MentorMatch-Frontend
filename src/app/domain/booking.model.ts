export interface Booking {
  id: string;
  mentorId: string;
  apprenantId: string; // Changed from learnerId to match backend
  dateTime: string; // ISO datetime string - changed from separate date/time
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  mentorName?: string;
  apprenantName?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  learnerId?: string;
}
