# Prompt for API layer generate

## 1. Basic rules

- `apps/web/prompts/web-api.prompt.md`에 정의된 `Swagger.json`으로 API를 생성한다.
- API 함수 위에 JSDoc 주석을 작성하고, JSDoc는 다음 '3. 예제'와 같은 형식으로 생성한다.
- 요구한 method, path params, query params, request, response, error에 맞게 API function을 생성한다.
- 요구한 Domain 안에 `{domain}API.ts`에 API function을 생성하고, `{domain}Mock.ts`에 Mock function을 생성한다.
- 생성한 API function에 맞게 Mock function을 생성한다.
- 생성한 API function에 맞게 `{domain}API.test.ts`에 `MockAdapter`를 이용하여 Unit test를 생성한다.
- 다음 '3. 예제'와 같이 순서와 구조를 반드시 준수하여 생성한다.
- 최우선으로 '1. 기본 규칙'을 반드시 준수한다.

## 3. 예제

### AI Agent

```typescript
// apps/web/app/counter/counterAPI.ts
export interface Count {
  data: number;
}

/**
 * 개수를 조회한다.
 *
 * @param amount 초기 개수
 * @returns ApiResponse<Count>
 */
export const fetchCount = async (amount: number = 1) => {
  const response = await publicApi.get("/api/count", {
    params: { amount },
  });
  return response.data as ApiResponse<Count>;
};

// 새로운 API를 생성한다.
```

```typescript
// apps/web/app/counter/counterMock.ts
import { ApiResponse } from "@/app/api";
import { Count } from "./counterAPI.ts";

const countMocks = (mock: AxiosMockAdapter) => {
  mock.onGet("/api/count").reply((config) => {
    const data: ApiResponse<Count> = {
      code: 200,
      message: "success",
      data: config.params?.amount || 1,
    };
    return [200, data];
  });

  // 새로운 API에 맞게 mock 생성한다.
};
```

```typescript
// apps/web/app/counter/counterAPI.test.ts

import { describe, expect, test, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { fetchCount } from "./counterAPI";

describe("counterAPI", () => {
  let mockApi: MockAdapter;

  beforeEach(() => {
    mockApi = new MockAdapter(publicApi);
  });

  test("개수 조회", async () => {
    const mockResponse = {
      code: 200,
      message: "success",
      data: 5,
    };
    mockApi
      .onGet("/api/count", { params: { amount: 5 } })
      .reply(200, mockResponse);

    const result = await fetchCount(5);
    expect(result).toEqual(mockResponse);
  });

  test("개수 조회 500 에러 응답", async () => {
    const mockResponse = {
      code: 500,
      message: "서버에서 에러가 발생하였습니다.",
    };
    mockApi.onGet("/api/count").reply(500, mockResponse);

    await expect(fetchCount()).rejects.toThrow();
  });
});
```

### 4. API Prompt files
