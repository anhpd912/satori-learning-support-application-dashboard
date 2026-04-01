export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Frontend Topic = Backend Theme
export interface TopicSummary {
  id: string;
  title: string;
  titleJapanese?: string;
  descriptionVi?: string;
  description?: string; // Kept for backward compatibility if any
  category?: string;
  jlptLevel?: string;
  thumbnailUrl?: string;
  status: ContentStatus;
  orderIndex: number;
  topicCount?: number;
}

export interface TopicDetail extends TopicSummary {
  // Add more fields if needed
}

// Frontend Scenario = Backend Topic
export interface ScenarioSummary {
  id: string;
  themeId: string;
  title: string;
  titleJapanese?: string;
  descriptionVi?: string;
  description: string;
  orderIndex: number;
  status: ContentStatus;
  roles?: string; 
}

export interface ScenarioDetail extends ScenarioSummary {
  themeName?: string;
  courseId?: string;
  courseName?: string;
  titleJapanese?: string;
  descriptionVi?: string;
  scenario?: string;
  category?: string;
  jlptLevel?: string;
  difficultyScore?: number;
  roleplayContext?: string;
  thumbnailUrl?: string;
  missions?: Mission[];
  learnerRole?: string; // Kept if still used or if it maps to something else
  aiRole?: string;      // Kept if still used or if it maps to something else
  context?: string;     // Kept if still used or if it maps to something else
}

export interface Mission {
  id: string;
  topicId: string;
  title: string;
  description: string;
  orderIndex: number;
  order?: number; // Syncing with potential backend field name
}
