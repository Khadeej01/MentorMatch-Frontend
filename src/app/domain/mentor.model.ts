export interface Mentor {
  id: number;
  nom: string;
  email: string;
  competences: string;
  experience: string;
  available: boolean;
  active: boolean;
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
  suspensionReason?: string;
}

export interface MentorCreateRequest {
  nom: string;
  email: string;
  competences: string;
  experience: string;
  available: boolean;
  active: boolean;
  role: string;
}

export interface MentorUpdateRequest extends MentorCreateRequest {
  id: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  suspensionReason?: string;
}
