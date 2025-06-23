**Prompt for Service Page Component generate**

# Basic feature

- domain: feature
- `./featureAPI.ts`를 이용한다.
- Code editor는 `@monaco-editor/react`를 이용한다.
- `$feature$` 문자열은 지시 사양에 맞게 수정한다.

# Features

## Info Page

- `./info/page.tsx`
- Title: Feature
- 등록, 조회, 수정한다.

- Feature

  - `name`: `<Input>`
  - `description`: `<Textarea>`

- Template Prompt

  - `./template-prompt/templatePromptAPI.ts`를 이용한다.
  - `templatePromptId`, `templatePromptName`는 `<Select>` 컴포넌트를 사용한다.
  - 선택한 Template Prompt 가 표시된다. `react-markdown`을 사용한다.

- SQL Query

  - `sqlQueryName`: `<Input>`
  - `sqlQueryContent`: Code editor를 사용한다. 'language type'은 'SQL'이다.

- Sequence Diagram
  - `sequenceDiagramName`: `<Input>`
  - `sequenceDiagramContent`: Code editor를 사용한다. 다음코드를 이용하여 Mermaid 스키마에 맞게 입력할 수 있도록 한다.
  ```typescript
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    enableSchemaRequest: true,
    schemas: [
      {
        fileMatch: ["config.json"],
        uri: "https://mermaid.js.org/schemas/config.schema.json",
      },
    ],
  });
  ```
  - 입력된 Sequence Diagram은 `mermaid`패키지를 사용하여 표시한다.

- OUTPUT Prompt
  - `selectedTemplatePrompt.promptContent`내용에서 각각 `$SQL_QUERY$`는 `sqlQueryContent`로 치환, `$SEQUENCE_DIAGRAM$`는 `sequenceDiagramContent`로 치환해서 `outputPrompt`로 표시한다.
  - `outputPrompt`은 `react-markdown`을 사용한다. 
  - `outputPrompt` 컨텐츠 내용을 복사할 수 있는 클립보드 복사 기능이 있는 버튼을 추가한다.

### 신규 등록

- URL 쿼리 파리미터에 folderId가 있으면 신규 등록으로서 모든 입력 필드를 초기화 한다.
- 부모 folderId를 사용한다.
  - URL 쿼리 파라미터로 전달된 folderId를 사용한다. (예: `/feature/info?folderId=123`)
  - folderId가 있는 경우, `folderApi.addFeatureToFolder(folderId, data)` 메소드를 사용하여 폴더에 기능을 추가한다.
  - folderId가 없는 경우, `featureApi.createFeature(data)` 메소드를 사용하여 기능을 생성한다.

### 삭제

- 삭제 버튼
- 삭제 전 `<Dialog>` 컴포넌트를 사용하여 확인 메시지 표시
