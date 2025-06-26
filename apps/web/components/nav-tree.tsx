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
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<FolderTreeItem | null>(
    null,
  );
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [openFolders, setOpenFolders] = useState<OpenFolderState>({});

  const { isMobile } = useSidebar();
  const router = useRouter();

  // Fetch root folders on component mount
  useEffect(() => {
    fetchFolders();

    // Restore selected folder ID from localStorage if available
    const savedFolderId = localStorage.getItem("selectedFolderId");
    if (savedFolderId) {
      setSelectedFolderId(Number(savedFolderId));
    }
  }, []);

  // Save selected folder ID to localStorage when it changes
  useEffect(() => {
    if (selectedFolderId) {
      localStorage.setItem("selectedFolderId", selectedFolderId.toString());
    } else {
      localStorage.removeItem("selectedFolderId");
    }
  }, [selectedFolderId]);

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

  // Recursively build folder tree with optimized fetching
  const buildFolderTree = async (
    folders: FolderResponseDto[],
    depth: number = 0,
    maxDepth: number = 2
  ): Promise<FolderTreeItem[]> => {
    const result: FolderTreeItem[] = [];

    for (const folder of folders) {
      // Only fetch children if we're within the max depth
      let children: FolderTreeItem[] = [];
      if (depth < maxDepth) {
        try {
          const childFolders = await folderApi.findChildFolders(folder.id);
          children = await buildFolderTree(childFolders, depth + 1, maxDepth);
        } catch (error) {
          console.error(`Error fetching children for folder ${folder.id}:`, error);
          // Continue with empty children rather than failing the whole tree
        }
      }

      result.push({
        ...folder,
        children: children.length > 0 ? children : undefined,
        isOpen: openFolders[folder.id] || false,
      });
    }

    return result;
  };

  // Create new folder
  const handleCreateFolder = async () => {
    try {
      if (!newFolderName.trim()) {
        toast.error("폴더 이름은 비워둘 수 없습니다");
        return;
      }

      setIsCreating(true);
      const parentId = currentFolder?.id;
      const newFolder = await folderApi.createFolder({
        name: newFolderName,
        description: newFolderDescription,
        parentId,
      });

      toast.success("폴더가 생성되었습니다");

      // Reset form and close dialog
      setNewFolderName("");
      setNewFolderDescription("");
      setIsCreateDialogOpen(false);

      // Refresh folders
      await fetchFolders();

      // Auto-open the parent folder if it exists
      if (parentId) {
        setOpenFolders(prev => ({
          ...prev,
          [parentId]: true
        }));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("폴더 생성에 실패했습니다");
    } finally {
      setIsCreating(false);
    }
  };

  // Rename folder
  const handleRenameFolder = async () => {
    try {
      if (!currentFolder) return;
      if (!newFolderName.trim()) {
        toast.error("폴더 이름은 비워둘 수 없습니다");
        return;
      }

      setIsRenaming(true);
      await folderApi.updateFolder(currentFolder.id, {
        name: newFolderName,
        parentId: currentFolder.parentId,
        description: newFolderDescription || currentFolder.description,
      });

      toast.success("폴더 이름이 변경되었습니다");

      // Reset form and close dialog
      setNewFolderName("");
      setNewFolderDescription("");
      setIsRenameDialogOpen(false);

      // Refresh folders
      await fetchFolders();

      // Keep the folder open if it was open before
      if (openFolders[currentFolder.id]) {
        setOpenFolders(prev => ({
          ...prev,
          [currentFolder.id]: true
        }));
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("폴더 이름 변경에 실패했습니다");
    } finally {
      setIsRenaming(false);
    }
  };

  // Delete folder
  const handleDeleteFolder = async () => {
    try {
      if (!currentFolder) return;

      setIsDeleting(true);
      await folderApi.deleteFolder(currentFolder.id);

      toast.success("폴더가 삭제되었습니다");

      // Close dialog
      setIsDeleteDialogOpen(false);

      // Remove from openFolders state
      if (openFolders[currentFolder.id]) {
        setOpenFolders(prev => {
          const newState = { ...prev };
          delete newState[currentFolder.id];
          return newState;
        });
      }

      // If this was the selected folder, clear selection
      if (selectedFolderId === currentFolder.id) {
        setSelectedFolderId(null);
      }

      // Refresh folders
      await fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("폴더 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
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

  // Handle folder click
  const handleFolderClick = (
    folder: FolderTreeItem,
    event: React.MouseEvent,
  ) => {
    // Prevent the event from triggering the CollapsibleTrigger
    event.stopPropagation();

    // Set this folder as selected
    setSelectedFolderId(folder.id);

    // Navigate to folder list page
    router.push(`/folder/list?id=${folder.id}`);

    // Also toggle the folder open state
    setOpenFolders((prev) => ({
      ...prev,
      [folder.id]: !prev[folder.id],
    }));
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
            <SidebarMenuButton
              tooltip={folder.name}
              onClick={(e) => handleFolderClick(folder, e)}
              isActive={selectedFolderId === folder.id}
              className={selectedFolderId === folder.id ? "bg-accent" : ""}
            >
              <Folder className={selectedFolderId === folder.id ? "text-accent-foreground" : ""} />
              <span>{folder.name}</span>
              {(folder.children || folder.features?.length > 0) && (
                <ChevronRight
                  className={`ml-auto transition-transform duration-200 ${
                    openFolders[folder.id] ? "rotate-90" : ""
                  } ${selectedFolderId === folder.id ? "text-accent-foreground" : ""}`}
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
                      onClick={() => {
                        // Clear folder selection when a feature is clicked
                        setSelectedFolderId(null);
                        router.push(`/feature/info?id=${feature.id}`);
                      }}
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
              disabled={isCreating}
            >
              취소
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              disabled={isCreating}
            >
              {isCreating ? "생성 중..." : "생성"}
            </Button>
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
              disabled={isRenaming}
            >
              취소
            </Button>
            <Button 
              onClick={handleRenameFolder}
              disabled={isRenaming}
            >
              {isRenaming ? "저장 중..." : "저장"}
            </Button>
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
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteFolder}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
