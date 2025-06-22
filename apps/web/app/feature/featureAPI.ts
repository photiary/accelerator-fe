import { publicApi } from "@/lib/api";

export interface FeatureRequestDto {
  name: string;
  description: string;
  folderId?: number;
  templatePromptId?: number;
  sequenceDiagramName?: string;
  sequenceDiagramContent?: string;
  sqlQueryName?: string;
  sqlQueryContent?: string;
  sequenceDiagramId?: number;
  sqlQueryId?: number;
}

export interface FeatureResponseDto {
  id: number;
  name: string;
  description: string;
  folderId?: number;
  folderName?: string;
  templatePromptId?: number;
  templatePromptName?: string;
  templatePromptContent?: string;
  sequenceDiagramId?: number;
  sequenceDiagramName?: string;
  sequenceDiagramContent?: string;
  sqlQueryId?: number;
  sqlQueryName?: string;
  sqlQueryContent?: string;
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const featureApi = {
  /**
   * 모든 기능을 조회한다.
   *
   * @returns FeatureResponseDto[]
   */
  getAllFeatures: async () => {
    const response = await publicApi.get("/api/features");
    return response.data as FeatureResponseDto[];
  },

  /**
   * ID로 기능을 조회한다.
   *
   * @param id 기능 ID
   * @returns FeatureResponseDto
   */
  getFeatureById: async (id: number) => {
    const response = await publicApi.get(`/api/features/${id}`);
    return response.data as FeatureResponseDto;
  },

  /**
   * 새로운 기능을 생성한다.
   *
   * @param data 기능 데이터
   * @returns FeatureResponseDto
   */
  createFeature: async (data: FeatureRequestDto) => {
    const response = await publicApi.post("/api/features", data);
    return response.data as FeatureResponseDto;
  },

  /**
   * 기능을 업데이트한다.
   *
   * @param id 기능 ID
   * @param data 업데이트할 기능 데이터
   * @returns FeatureResponseDto
   */
  updateFeature: async (id: number, data: FeatureRequestDto) => {
    const response = await publicApi.put(`/api/features/${id}`, data);
    return response.data as FeatureResponseDto;
  },

  /**
   * 기능을 삭제한다.
   *
   * @param id 삭제할 기능 ID
   * @returns void
   */
  deleteFeature: async (id: number) => {
    const response = await publicApi.delete(`/api/features/${id}`);
    return response.data;
  },

  /**
   * 이름으로 기능을 검색한다.
   *
   * @param name 검색할 이름
   * @returns FeatureResponseDto[]
   */
  findFeaturesByName: async (name: string) => {
    const response = await publicApi.get("/api/features/search", {
      params: { name },
    });
    return response.data as FeatureResponseDto[];
  },

  /**
   * 폴더별로 기능을 검색한다.
   *
   * @param folderId 폴더 ID
   * @returns FeatureResponseDto[]
   */
  findFeaturesByFolder: async (folderId: number) => {
    const response = await publicApi.get(`/api/features/folder/${folderId}`);
    return response.data as FeatureResponseDto[];
  },
};
