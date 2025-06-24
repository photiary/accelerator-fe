**Prompt for Service Page Component generate**

# Basic feature

- domain: folder
- `./folderAPI.ts`를 이용한다.
- `$feature$` 문자열은 지시 사양에 맞게 수정한다.

# Features

## List Page

- `./list/page.tsx`
- Folder, Feature를 목록으로 표시한다.
- Table item
  - `name`: Folder를 클릭하면 childFolders를 표시한다. Feature를 클릭하면, `/feature/info`로 이동하여 해당 내용을 표시한다.
