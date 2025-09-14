export interface Booking {
  id: string;
  mentorId: string;
  apprenantId: string; // Changed from learnerId to match backend
  dateTime: string; // ISO datetime string - changed from separate date/time
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  mentorName?: string;
  apprenantName?: string;
  createdAt?: string;
  updatedAt?: string;
  cancellationReason?: string;
  cancellationType?: string;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  learnerId?: string;
}
