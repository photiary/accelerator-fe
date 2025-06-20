import { publicApi } from "@/lib/api";

export interface SequenceDiagramRequestDto {
  name: string;
  sequenceDiagramContent: string;
}

export interface SequenceDiagramResponseDto {
  id: number;
  name: string;
  sequenceDiagramContent: string;
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const sequenceDiagramApi = {
  /**
   * 모든 시퀀스 다이어그램을 조회한다.
   *
   * @returns SequenceDiagramResponseDto[]
   */
  getAllSequenceDiagrams: async () => {
    const response = await publicApi.get("/api/sequence-diagrams");
    return response.data as SequenceDiagramResponseDto[];
  },

  /**
   * ID로 시퀀스 다이어그램을 조회한다.
   *
   * @param id 시퀀스 다이어그램 ID
   * @returns SequenceDiagramResponseDto
   */
  getSequenceDiagramById: async (id: number) => {
    const response = await publicApi.get(`/api/sequence-diagrams/${id}`);
    return response.data as SequenceDiagramResponseDto;
  },

  /**
   * 새로운 시퀀스 다이어그램을 생성한다.
   *
   * @param data 시퀀스 다이어그램 데이터
   * @returns SequenceDiagramResponseDto
   */
  createSequenceDiagram: async (data: SequenceDiagramRequestDto) => {
    const response = await publicApi.post("/api/sequence-diagrams", data);
    return response.data as SequenceDiagramResponseDto;
  },

  /**
   * 시퀀스 다이어그램을 업데이트한다.
   *
   * @param id 시퀀스 다이어그램 ID
   * @param data 업데이트할 시퀀스 다이어그램 데이터
   * @returns SequenceDiagramResponseDto
   */
  updateSequenceDiagram: async (
    id: number,
    data: SequenceDiagramRequestDto,
  ) => {
    const response = await publicApi.put(`/api/sequence-diagrams/${id}`, data);
    return response.data as SequenceDiagramResponseDto;
  },

  /**
   * 시퀀스 다이어그램을 삭제한다.
   *
   * @param id 삭제할 시퀀스 다이어그램 ID
   * @returns void
   */
  deleteSequenceDiagram: async (id: number) => {
    const response = await publicApi.delete(`/api/sequence-diagrams/${id}`);
    return response.data;
  },

  /**
   * 이름으로 시퀀스 다이어그램을 검색한다.
   *
   * @param name 검색할 이름
   * @returns SequenceDiagramResponseDto[]
   */
  findSequenceDiagramsByName: async (name: string) => {
    const response = await publicApi.get("/api/sequence-diagrams/search", {
      params: { name },
    });
    return response.data as SequenceDiagramResponseDto[];
  },
};
