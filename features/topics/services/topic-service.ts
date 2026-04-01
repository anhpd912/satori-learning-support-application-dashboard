import api from '@/lib/axios';
import { 
  ApiResponse, 
  PageResponse, 
  TopicSummary, 
  TopicDetail, 
  ScenarioSummary, 
  ScenarioDetail, 
  Mission 
} from '../types';

export const topicService = {
  // Themes (Frontend Topics)
  getThemes: async (page = 0, size = 10, keyword?: string) => {
    const params = { page, size, keyword };
    const response = await api.get<ApiResponse<PageResponse<TopicSummary>>>('/manager/conversation/themes', { params });
    return response.data;
  },

  getThemeById: async (themeId: string) => {
    const response = await api.get<ApiResponse<TopicDetail>>(`/manager/conversation/themes/${themeId}`);
    return response.data;
  },

  // Topics (Frontend Scenarios)
  getScenarios: async (page = 0, size = 10) => {
    const params = { page, size };
    const response = await api.get<ApiResponse<PageResponse<ScenarioSummary>>>('/manager/conversation/topics', { params });
    return response.data;
  },

  getScenariosByThemeId: async (themeId: string, page = 0, size = 10) => {
    const params = { page, size };
    const response = await api.get<ApiResponse<PageResponse<ScenarioSummary>>>(`/manager/conversation/themes/${themeId}/topics`, { params });
    return response.data;
  },

  getScenarioById: async (topicId: string) => {
    const response = await api.get<ApiResponse<ScenarioDetail>>(`/manager/conversation/topics/${topicId}`);
    return response.data;
  },

  // Missions
  getMissionsByScenarioId: async (topicId: string) => {
    const response = await api.get<ApiResponse<Mission[]>>(`/manager/conversation/topics/${topicId}/missions`);
    return response.data;
  },

  // Management (Themes)
  createTheme: async (data: Partial<TopicDetail>) => {
    const response = await api.post<ApiResponse<TopicSummary>>('/manager/conversation/themes', data);
    return response.data;
  },

  updateTheme: async (themeId: string, data: Partial<TopicDetail>) => {
    const response = await api.put<ApiResponse<TopicSummary>>(`/manager/conversation/themes/${themeId}`, data);
    return response.data;
  },

  deleteTheme: async (themeId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/manager/conversation/themes/${themeId}`);
    return response.data;
  },

  // Management (Topics/Scenarios)
  createScenario: async (data: any) => {
    const response = await api.post<ApiResponse<ScenarioDetail>>('/manager/conversation/topics', data);
    return response.data;
  },

  updateScenario: async (topicId: string, data: any) => {
    const response = await api.put<ApiResponse<ScenarioDetail>>(`/manager/conversation/topics/${topicId}`, data);
    return response.data;
  },

  deleteScenario: async (topicId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/manager/conversation/topics/${topicId}`);
    return response.data;
  },
};
