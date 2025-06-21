**Prompt for Service Page Component generate**

# Basic feature

- domain: templatePrompt
- `./templatePromptAPI.`를 이용한다.
- Code editor는 `@monaco-editor/react`를 이용한다.
- `$feature$` 문자열은 지시 사양에 맞게 수정한다.

# Features

## Info Page

- `./info/page.tsx`

### 등록

- Title fo Page is 'New prompt'
- `name`, `promptCotent`를 등록

### 조회, 수정

- Title: 'Prompt Info'
- `name`, `promptCotent` 정보 제공과 갱신을 할 수 있도록 한다.
- Input filed는 debounced input로 주기적으로 async로 데이터를 갱신한다.
- `promptCotent`는 Code editor를 사용한다. 'language type'은 'markdown'이다.

### 삭제

- 삭제 버튼
- 삭제 전 확인 다이알로그를 표시

## List Page

- `./list/page.tsx`

## 목록

- Title: 'Prompt List'
- Column `no`, `name`
- Row를 클릭하면 해당 Info Page로 이동한다.
