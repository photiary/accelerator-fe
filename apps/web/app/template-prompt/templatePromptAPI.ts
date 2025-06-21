import { publicApi } from "@/lib/api";

export interface TemplatePromptRequestDto {
  name: string;
  promptContent: string;
}

export interface TemplatePromptResponseDto {
  id: number;
  name: string;
  promptContent: string;
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const templatePromptApi = {
  /**
   * 모든 템플릿 프롬프트를 조회한다.
   *
   * @returns TemplatePromptResponseDto[]
   */
  getAllTemplatePrompts: async () => {
    const response = await publicApi.get("/api/template-prompts");
    return response.data as TemplatePromptResponseDto[];
  },

  /**
   * ID로 템플릿 프롬프트를 조회한다.
   *
   * @param id 템플릿 프롬프트 ID
   * @returns TemplatePromptResponseDto
   */
  getTemplatePromptById: async (id: number) => {
    const response = await publicApi.get(`/api/template-prompts/${id}`);
    return response.data as TemplatePromptResponseDto;
  },

  /**
   * 새로운 템플릿 프롬프트를 생성한다.
   *
   * @param data 템플릿 프롬프트 데이터
   * @returns TemplatePromptResponseDto
   */
  createTemplatePrompt: async (data: TemplatePromptRequestDto) => {
    const response = await publicApi.post("/api/template-prompts", data);
    return response.data as TemplatePromptResponseDto;
  },

  /**
   * 템플릿 프롬프트를 업데이트한다.
   *
   * @param id 템플릿 프롬프트 ID
   * @param data 업데이트할 템플릿 프롬프트 데이터
   * @returns TemplatePromptResponseDto
   */
  updateTemplatePrompt: async (id: number, data: TemplatePromptRequestDto) => {
    const response = await publicApi.put(`/api/template-prompts/${id}`, data);
    return response.data as TemplatePromptResponseDto;
  },

  /**
   * 템플릿 프롬프트를 삭제한다.
   *
   * @param id 삭제할 템플릿 프롬프트 ID
   * @returns void
   */
  deleteTemplatePrompt: async (id: number) => {
    const response = await publicApi.delete(`/api/template-prompts/${id}`);
    return response.data;
  },

  /**
   * 이름으로 템플릿 프롬프트를 검색한다.
   *
   * @param name 검색할 이름
   * @returns TemplatePromptResponseDto[]
   */
  findTemplatePromptsByName: async (name: string) => {
    const response = await publicApi.get("/api/template-prompts/search", {
      params: { name },
    });
    return response.data as TemplatePromptResponseDto[];
  },
};
