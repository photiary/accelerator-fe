import { publicApi } from "@/lib/api";

export interface HelloResponse {
  message: string;
}

export const demoApi = {
  /**
   * Hello endpoint
   *
   * @param message Optional message parameter
   * @returns HelloResponse
   */
  hello: async (message: string = "Hello, World!") => {
    const response = await publicApi.get("/api/demo/hello", {
      params: { message },
    });
    return response.data as HelloResponse;
  },

  /**
   * Error endpoint
   *
   * @returns void
   */
  error: async () => {
    const response = await publicApi.get("/api/demo/error");
    return response.data;
  },
};
