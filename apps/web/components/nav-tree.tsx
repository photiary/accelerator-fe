"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  Folder,
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Code,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "sonner";

import { folderApi, FolderResponseDto } from "@/app/folder/folderAPI";

interface FolderTreeItem extends FolderResponseDto {
  children?: FolderTreeItem[];
  isOpen?: boolean;
}

// Track open state of folders
interface OpenFolderState {
  [key: string]: boolean;
}

export function NavTree() {
  const [folders, setFolders] = useState<FolderTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<FolderTreeItem | null>(
    null,
  );
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [openFolders, setOpenFolders] = useState<OpenFolderState>({});

  const { isMobile } = useSidebar();
  const router = useRouter();

  // Fetch root folders on component mount
  useEffect(() => {
    fetchFolders();
  }, []);

  // Fetch all folders and build tree structure
  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const rootFolders = await folderApi.getRootFolders();
      const folderTree = await buildFolderTree(rootFolders);
      setFolders(folderTree);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  };

  // Recursively build folder tree
  const buildFolderTree = async (
    folders: FolderResponseDto[],
  ): Promise<FolderTreeItem[]> => {
    const result: FolderTreeItem[] = [];

    for (const folder of folders) {
      const childFolders = await folderApi.findChildFolders(folder.id);
      const children = await buildFolderTree(childFolders);

      result.push({
        ...folder,
        children: children.length > 0 ? children : undefined,
        isOpen: false,
      });
    }

    return result;
  };

  // Create new folder
  const handleCreateFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        toast.error("Folder name cannot be empty");
        return;
      }

      const parentId = currentFolder?.id;
      await folderApi.createFolder({
        name: newFolderName,
        description: newFolderDescription,
        parentId,
      });

      toast.success("Folder created successfully");

      // Reset form and close dialog
      setNewFolderName("");
      setNewFolderDescription("");
      setIsCreateDialogOpen(false);

      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  // Rename folder
  const handleRenameFolder = async () => {
    try {
      if (!currentFolder) return;
      if (!newFolderName.trim()) {
        toast.error("Folder name cannot be empty");
        return;
      }

      await folderApi.updateFolder(currentFolder.id, {
        name: newFolderName,
        parentId: currentFolder.parentId,
        description: newFolderDescription || currentFolder.description,
      });

      toast.success("Folder renamed successfully");

      // Reset form and close dialog
      setNewFolderName("");
      setNewFolderDescription("");
      setIsRenameDialogOpen(false);

      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };

  // Delete folder
  const handleDeleteFolder = async () => {
    try {
      if (!currentFolder) return;

      await folderApi.deleteFolder(currentFolder.id);

      toast.success("Folder deleted successfully");

      // Close dialog
      setIsDeleteDialogOpen(false);

      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  // Open create dialog
  const openCreateDialog = (folder: FolderTreeItem | null = null) => {
    setCurrentFolder(folder);
    setNewFolderName("");
    setNewFolderDescription("");
    setIsCreateDialogOpen(true);
  };

  // Open rename dialog
  const openRenameDialog = (folder: FolderTreeItem) => {
    setCurrentFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description);
    setIsRenameDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (folder: FolderTreeItem) => {
    setCurrentFolder(folder);
    setIsDeleteDialogOpen(true);
  };

  // Render folder tree recursively
  const renderFolderTree = (items: FolderTreeItem[]) => {
    return items.map((folder) => (
      <Collapsible
        key={folder.id}
        asChild
        defaultOpen={folder.isOpen}
        open={openFolders[folder.id]}
        onOpenChange={(open) => {
          setOpenFolders((prev) => ({
            ...prev,
            [folder.id]: open,
          }));
        }}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={folder.name}>
              <Folder />
              <span>{folder.name}</span>
              {(folder.children || folder.features?.length > 0) && (
                <ChevronRight
                  className={`ml-auto transition-transform duration-200 ${openFolders[folder.id] ? "rotate-90" : ""}`}
                />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem onClick={() => openCreateDialog(folder)}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>신규 폴더</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openRenameDialog(folder)}>
                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>폴더 수정</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/feature/info?folderId=${folder.id}`);
                }}
              >
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>신규 기능</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog(folder)}>
                <Trash className="mr-2 h-4 w-4 text-destructive" />
                <span className="text-destructive">폴더 삭제</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(folder.children || folder.features?.length > 0) && (
            <CollapsibleContent>
              <SidebarMenuSub>
                {folder.children && renderFolderTree(folder.children)}
                {folder.features?.map((feature) => (
                  <SidebarMenuItem key={`feature-${feature.id}`}>
                    <SidebarMenuButton
                      tooltip={feature.name}
                      onClick={() => router.push(`/feature/info?id=${feature.id}`)}
                    >
                      <Code className="h-4 w-4" />
                      <span>{feature.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
    ));
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          폴더
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-5 w-5"
            onClick={() => openCreateDialog()}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">새 폴더 추가</span>
          </Button>
        </SidebarGroupLabel>
        <SidebarMenu>
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              로딩 중...
            </div>
          ) : folders.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              폴더가 없습니다
            </div>
          ) : (
            renderFolderTree(folders)
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 폴더 생성</DialogTitle>
            <DialogDescription>
              {currentFolder
                ? `'${currentFolder.name}' 폴더 안에 새 폴더를 생성합니다.`
                : "루트 레벨에 새 폴더를 생성합니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                폴더 이름
              </label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="폴더 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                설명 (선택사항)
              </label>
              <Textarea
                id="description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="폴더에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleCreateFolder}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>폴더 이름 수정</DialogTitle>
            <DialogDescription>
              '{currentFolder?.name}' 폴더의 이름을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="rename-name" className="text-sm font-medium">
                폴더 이름
              </label>
              <Input
                id="rename-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="폴더 이름을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="rename-description"
                className="text-sm font-medium"
              >
                설명 (선택사항)
              </label>
              <Textarea
                id="rename-description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="폴더에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleRenameFolder}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>폴더 삭제</DialogTitle>
            <DialogDescription>
              '{currentFolder?.name}' 폴더를 삭제하시겠습니까? 이 작업은 되돌릴
              수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
