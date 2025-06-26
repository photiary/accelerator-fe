**Prompt for Component generate**

# Basic feature

- `../app/folder/folderAPI.ts`를 이용한다.

# Features

- `./nav-tree.tsx` Tree component.
- `./template-app-sidebar.tsx`리소스를 Example 예제로서 참고하여 생성한다.
- 폴더처럼 트리구조로 컴포넌트를 활용할 수 있다.
- 폴더이름 오른쪽에 `<DropdownMenu>`를 이용하여 '폴더 신규', '폴더 수정', '폴더 삭제' 메뉴를 생성
- `FolderResponseDto.features`를 `<SidebarMenuButton>`로 표시. 클릭하면 해당 `feature/info`로 이동.
- Folder를 클릭하면 `/folder/list`에 childFolders를 표시한다. Feature를 클릭하면, `/feature/info`로 이동하여 해당 내용을 표시한다.
