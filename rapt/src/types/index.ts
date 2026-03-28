export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  schedule: string;
  color: "teal" | "peach";
}

export interface StudyPartner {
  id: string;
  name: string;
  quote: string;
  course: string;
  location?: string;
  availability?: string;
  style: "prefer-to-teach" | "need-guidance" | "silent-co-study";
  matchPercent?: number;
}

export interface DiscussionThread {
  id: string;
  tag: "help" | "clarification";
  question: string;
  timeAgo: string;
}

export interface Resource {
  id: string;
  name: string;
  uploadedBy: string;
  type: "pdf" | "image" | "other";
}
