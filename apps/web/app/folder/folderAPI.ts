import { publicApi } from "@/lib/api";

export interface FeatureSummaryDto {
  id: number;
  name: string;
}

export interface FolderSummaryDto {
  id: number;
  name: string;
}

export interface FolderResponseDto {
  id: number;
  name: string;
  description: string;
  parentId: number;
  parentName: string;
  childFolders: FolderSummaryDto[];
  features: FeatureSummaryDto[];
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const folderApi = {
  /**
   * 폴더를 ID로 조회한다.
   *
   * @param id 조회할 폴더의 ID
   * @returns FolderResponseDto
   */
  getFolderById: async (id: number) => {
    const response = await publicApi.get(`/api/folders/${id}`);
    return response.data as FolderResponseDto;
  },
};
