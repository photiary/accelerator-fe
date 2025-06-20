**Prompt for Service Page Component generate**

# Basic feature

- domain: templatePrompt
- `./templatePromptAPI.`를 이용한다.
- Code editor는 `Monaco Editor`를 이용한다.

# Features

## Info

### 등록
- Title fo Page is 'New prompt'
- `name`, `promptCotent`를 등록

### 조회, 수정
- Title fo Page is 'Prompt Info'
- `name`, `promptCotent` 정보 제공과 갱신을 할 수 있도록 한다.
- Input filed에서 focus out 되면 async로 데이터를 갱신한다.

### 삭제

- Template Prompt의 `name`, `promptCotent`를 등록, 수정한다.
- , 정보 또는 수정 일 때는 'Prompt Info'
- 