export interface Mentor {
  id: number;
  nom: string;
  email: string;
  competences: string;
  experience: string;
  available: boolean;
  role: string;
}

export interface MentorCreateRequest {
  nom: string;
  email: string;
  competences: string;
  experience: string;
  available: boolean;
  role: string;
}

export interface MentorUpdateRequest extends MentorCreateRequest {
  id: number;
}
