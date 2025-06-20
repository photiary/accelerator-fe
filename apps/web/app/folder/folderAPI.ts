import { publicApi } from "@/lib/api";
import { FeatureRequestDto, FeatureResponseDto } from "../feature/featureAPI";

export interface FolderRequestDto {
  name: string;
  description: string;
  parentId?: number;
}

export interface FolderSummaryDto {
  id: number;
  name: string;
}

export interface FeatureSummaryDto {
  id: number;
  name: string;
}

export interface FolderResponseDto {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  parentName?: string;
  childFolders: FolderSummaryDto[];
  features: FeatureSummaryDto[];
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const folderApi = {
  /**
   * 모든 폴더를 조회한다.
   *
   * @returns FolderResponseDto[]
   */
  getAllFolders: async () => {
    const response = await publicApi.get("/api/folders");
    return response.data as FolderResponseDto[];
  },

  /**
   * ID로 폴더를 조회한다.
   *
   * @param id 폴더 ID
   * @returns FolderResponseDto
   */
  getFolderById: async (id: number) => {
    const response = await publicApi.get(`/api/folders/${id}`);
    return response.data as FolderResponseDto;
  },

  /**
   * 새로운 폴더를 생성한다.
   *
   * @param data 폴더 데이터
   * @returns FolderResponseDto
   */
  createFolder: async (data: FolderRequestDto) => {
    const response = await publicApi.post("/api/folders", data);
    return response.data as FolderResponseDto;
  },

  /**
   * 폴더를 업데이트한다.
   *
   * @param id 폴더 ID
   * @param data 업데이트할 폴더 데이터
   * @returns FolderResponseDto
   */
  updateFolder: async (id: number, data: FolderRequestDto) => {
    const response = await publicApi.put(`/api/folders/${id}`, data);
    return response.data as FolderResponseDto;
  },

  /**
   * 폴더를 삭제한다.
   *
   * @param id 삭제할 폴더 ID
   * @returns void
   */
  deleteFolder: async (id: number) => {
    const response = await publicApi.delete(`/api/folders/${id}`);
    return response.data;
  },

  /**
   * 자식 폴더를 조회한다.
   *
   * @param parentId 부모 폴더 ID
   * @returns FolderResponseDto[]
   */
  findChildFolders: async (parentId: number) => {
    const response = await publicApi.get(`/api/folders/${parentId}/children`);
    return response.data as FolderResponseDto[];
  },

  /**
   * 이름으로 폴더를 검색한다.
   *
   * @param name 검색할 이름
   * @returns FolderResponseDto[]
   */
  findFoldersByName: async (name: string) => {
    const response = await publicApi.get("/api/folders/search", {
      params: { name },
    });
    return response.data as FolderResponseDto[];
  },

  /**
   * 루트 폴더를 조회한다.
   *
   * @returns FolderResponseDto[]
   */
  getRootFolders: async () => {
    const response = await publicApi.get("/api/folders/root");
    return response.data as FolderResponseDto[];
  },

  /**
   * 폴더에 기능을 추가한다.
   *
   * @param folderId 폴더 ID
   * @param data 기능 데이터
   * @returns FeatureResponseDto
   */
  addFeatureToFolder: async (folderId: number, data: FeatureRequestDto) => {
    const response = await publicApi.post(`/api/folders/${folderId}/features`, data);
    return response.data as FeatureResponseDto;
  },

  /**
   * 기능을 다른 폴더로 이동한다.
   *
   * @param folderId 대상 폴더 ID
   * @param featureId 이동할 기능 ID
   * @returns FeatureResponseDto
   */
  moveFeatureToFolder: async (folderId: number, featureId: number) => {
    const response = await publicApi.put(`/api/folders/${folderId}/features/${featureId}`);
    return response.data as FeatureResponseDto;
  },
};