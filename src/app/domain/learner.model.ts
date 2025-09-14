export interface Learner {
  id: string;
  nom: string;
  name?: string; // For backward compatibility
  email: string;
  role: string;
  objectifs?: string;
  niveau?: string;
  interests?: string; // For backward compatibility
  createdAt?: string;
  updatedAt?: string;
  active: boolean;
}