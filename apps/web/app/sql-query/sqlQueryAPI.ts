import { publicApi } from "@/lib/api";

export interface SqlQueryRequestDto {
  name: string;
  queryContent: string;
}

export interface SqlQueryResponseDto {
  id: number;
  name: string;
  queryContent: string;
  createdAt: string;
  createdId: string;
  updatedAt: string;
  updatedId: string;
}

export const sqlQueryApi = {
  /**
   * 모든 SQL 쿼리를 조회한다.
   *
   * @returns SqlQueryResponseDto[]
   */
  getAllSqlQueries: async () => {
    const response = await publicApi.get("/api/sql-queries");
    return response.data as SqlQueryResponseDto[];
  },

  /**
   * ID로 SQL 쿼리를 조회한다.
   *
   * @param id SQL 쿼리 ID
   * @returns SqlQueryResponseDto
   */
  getSqlQueryById: async (id: number) => {
    const response = await publicApi.get(`/api/sql-queries/${id}`);
    return response.data as SqlQueryResponseDto;
  },

  /**
   * 새로운 SQL 쿼리를 생성한다.
   *
   * @param data SQL 쿼리 데이터
   * @returns SqlQueryResponseDto
   */
  createSqlQuery: async (data: SqlQueryRequestDto) => {
    const response = await publicApi.post("/api/sql-queries", data);
    return response.data as SqlQueryResponseDto;
  },

  /**
   * SQL 쿼리를 업데이트한다.
   *
   * @param id SQL 쿼리 ID
   * @param data 업데이트할 SQL 쿼리 데이터
   * @returns SqlQueryResponseDto
   */
  updateSqlQuery: async (id: number, data: SqlQueryRequestDto) => {
    const response = await publicApi.put(`/api/sql-queries/${id}`, data);
    return response.data as SqlQueryResponseDto;
  },

  /**
   * SQL 쿼리를 삭제한다.
   *
   * @param id 삭제할 SQL 쿼리 ID
   * @returns void
   */
  deleteSqlQuery: async (id: number) => {
    const response = await publicApi.delete(`/api/sql-queries/${id}`);
    return response.data;
  },

  /**
   * 이름으로 SQL 쿼리를 검색한다.
   *
   * @param name 검색할 이름
   * @returns SqlQueryResponseDto[]
   */
  findSqlQueriesByName: async (name: string) => {
    const response = await publicApi.get("/api/sql-queries/search", {
      params: { name },
    });
    return response.data as SqlQueryResponseDto[];
  },
};
