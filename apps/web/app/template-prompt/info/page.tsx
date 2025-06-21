"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import Editor from "@monaco-editor/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  templatePromptApi,
  TemplatePromptRequestDto,
  TemplatePromptResponseDto,
} from "../templatePromptAPI";

// Custom hook for debounced function
const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isNewPrompt = !id;

  const [prompt, setPrompt] = useState<TemplatePromptResponseDto | null>(null);
  const [name, setName] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (isNewPrompt) {
        setLoading(false);
        return;
      }

      try {
        const data = await templatePromptApi.getTemplatePromptById(Number(id));
        setPrompt(data);
        setName(data.name);
        setPromptContent(data.promptContent);
      } catch (error) {
        console.error("Failed to fetch prompt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [id, isNewPrompt]);

  const handleSave = async () => {
    if (saving) return;

    const data: TemplatePromptRequestDto = {
      name,
      promptContent,
    };

    setSaving(true);
    try {
      console.log("handleSave");
      if (isNewPrompt) {
        const newPrompt = await templatePromptApi.createTemplatePrompt(data);
        router.push(`/template-prompt/info?id=${newPrompt.id}`);
      } else {
        await templatePromptApi.updateTemplatePrompt(Number(id), data);
      }
    } catch (error) {
      console.error("Failed to save prompt:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await templatePromptApi.deleteTemplatePrompt(Number(id));
      router.push("/template-prompt/list");
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSaveDebounced = useDebounce(async () => {
    if (
      !isNewPrompt &&
      (prompt?.name !== name || prompt?.promptContent !== promptContent)
    ) {
      await handleSave();
    }
  }, 1000); // 1 second

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    handleSaveDebounced();
  };

  // Keep the blur handler as a fallback
  const handleNameBlur = async () => {
    if (!isNewPrompt && prompt?.name !== name) {
      await handleSave();
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setPromptContent(value || "");
    handleSaveDebounced();
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
                  <BreadcrumbLink href="/template-prompt/list">
                    Prompt
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {isNewPrompt ? "New prompt" : "Prompt Info"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-6 md:min-h-min">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Loading...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder="Enter prompt name"
                    className="max-w-md"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="promptContent"
                    className="text-sm font-medium"
                  >
                    Prompt Content
                  </label>
                  <div className="h-[500px] border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language="markdown"
                      value={promptContent}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/template-prompt/list")}
                  >
                    Back to List
                  </Button>
                  <div className="flex gap-2">
                    {!isNewPrompt && (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : isNewPrompt ? "Create" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              Prompt:{" "}
              <span className="font-medium text-foreground">{name}</span>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
