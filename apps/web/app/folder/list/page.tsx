"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, Folder, Code, Plus } from "lucide-react";
import {
  folderApi,
  FolderResponseDto,
  FolderSummaryDto,
  FeatureSummaryDto,
} from "../folderAPI";
import React from "react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("id");

  const [currentFolder, setCurrentFolder] = useState<FolderResponseDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (folderId) {
          // Fetch a specific folder
          const folder = await folderApi.getFolderById(Number(folderId));
          setCurrentFolder(folder);

          // Build breadcrumbs
          await buildBreadcrumbs(folder);
        } else {
          // Fetch root folders
          const rootFolders = await folderApi.getRootFolders();
          if (rootFolders.length > 0) {
            setCurrentFolder({
              id: 0,
              name: "Root",
              description: "Root folder",
              childFolders: rootFolders.map((folder) => ({
                id: folder.id,
                name: folder.name,
              })),
              features: [],
              createdAt: "",
              createdId: "",
              updatedAt: "",
              updatedId: "",
            });
          } else {
            setCurrentFolder(null);
          }
          setBreadcrumbs([]);
        }
      } catch (error) {
        console.error("Failed to fetch folder data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [folderId]);

  const buildBreadcrumbs = async (folder: FolderResponseDto) => {
    const breadcrumbItems = [{ id: folder.id, name: folder.name }];

    let currentParentId = folder.parentId;
    while (currentParentId) {
      try {
        const parentFolder = await folderApi.getFolderById(currentParentId);
        breadcrumbItems.unshift({
          id: parentFolder.id,
          name: parentFolder.name,
        });
        currentParentId = parentFolder.parentId;
      } catch (error) {
        console.error("Error fetching parent folder:", error);
        break;
      }
    }

    setBreadcrumbs(breadcrumbItems || []);
  };

  const handleFolderClick = (folder: FolderSummaryDto) => {
    router.push(`/folder/list?id=${folder.id}`);
  };

  const handleFeatureClick = (feature: FeatureSummaryDto) => {
    router.push(`/feature/info?id=${feature.id}`);
  };

  const handleBackClick = () => {
    if (breadcrumbs && breadcrumbs.length > 1) {
      // Navigate to parent folder
      router.push(`/folder/list?id=${breadcrumbs[breadcrumbs.length - 2]?.id}`);
    } else {
      // Navigate to root
      router.push("/folder/list");
    }
  };

  const handleCreateFolder = () => {
    if (folderId) {
      router.push(`/feature/info?folderId=${folderId}`);
    } else {
      router.push("/feature/info");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/folder/list">Folder</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={`/folder/list?id=${item.id}`}>
                          {item.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateFolder}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>New Feature</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-4 md:min-h-min">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                {folderId && (
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackClick}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!currentFolder ||
                    (currentFolder.childFolders.length === 0 &&
                      currentFolder.features.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {currentFolder.childFolders.map((folder) => (
                          <TableRow
                            key={`folder-${folder.id}`}
                            onClick={() => handleFolderClick(folder)}
                            className="cursor-pointer hover:bg-muted"
                          >
                            <TableCell>
                              <Folder className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>{folder.name}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              Folder
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentFolder.features.map((feature) => (
                          <TableRow
                            key={`feature-${feature.id}`}
                            onClick={() => handleFeatureClick(feature)}
                            className="cursor-pointer hover:bg-muted"
                          >
                            <TableCell>
                              <Code className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>{feature.name}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              Feature
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
