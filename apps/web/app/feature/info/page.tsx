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
import { Textarea } from "@workspace/ui/components/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import Editor from "@monaco-editor/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  featureApi,
  FeatureRequestDto,
  FeatureResponseDto,
} from "../featureAPI";
import {
  templatePromptApi,
  TemplatePromptResponseDto,
} from "../../template-prompt/templatePromptAPI";
import { folderApi } from "../../folder/folderAPI";
import ReactMarkdown from "react-markdown";
import Mermaid from "mermaid";

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
  const folderId = searchParams.get("folderId");
  const isNewFeature = !id;

  const [feature, setFeature] = useState<FeatureResponseDto | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templatePromptId, setTemplatePromptId] = useState<number | undefined>(
    undefined,
  );
  const [templatePrompts, setTemplatePrompts] = useState<
    TemplatePromptResponseDto[]
  >([]);
  const [selectedTemplatePrompt, setSelectedTemplatePrompt] =
    useState<TemplatePromptResponseDto | null>(null);
  const [sqlQueryName, setSqlQueryName] = useState("");
  const [sqlQueryContent, setSqlQueryContent] = useState("");
  const [sequenceDiagramName, setSequenceDiagramName] = useState("");
  const [sequenceDiagramContent, setSequenceDiagramContent] = useState("");
  const [mermaidSvg, setMermaidSvg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize Mermaid
  useEffect(() => {
    Mermaid.initialize({
      startOnLoad: false,
      theme: "default",
    });
  }, []);

  // Render Mermaid diagram when content changes
  useEffect(() => {
    const renderMermaid = async () => {
      if (!sequenceDiagramContent) {
        setMermaidSvg("");
        return;
      }

      try {
        const { svg } = await Mermaid.render(
          "mermaid-diagram",
          sequenceDiagramContent,
        );
        setMermaidSvg(svg);
      } catch (error) {
        console.error("Failed to render Mermaid diagram:", error);
      }
    };

    renderMermaid();
  }, [sequenceDiagramContent]);

  // Fetch template prompts
  useEffect(() => {
    const fetchTemplatePrompts = async () => {
      try {
        const data = await templatePromptApi.getAllTemplatePrompts();
        setTemplatePrompts(data);
      } catch (error) {
        console.error("Failed to fetch template prompts:", error);
      }
    };

    fetchTemplatePrompts();
  }, []);

  // Fetch feature data
  useEffect(() => {
    const fetchFeature = async () => {
      if (isNewFeature) {
        // Initialize all input fields for new feature
        setName("");
        setDescription("");
        setTemplatePromptId(undefined);
        setSqlQueryName("");
        setSqlQueryContent("");
        setSequenceDiagramName("");
        setSequenceDiagramContent("");
        setSelectedTemplatePrompt(null);
        setFeature(null);
        setLoading(false);
        return;
      }

      try {
        const data = await featureApi.getFeatureById(Number(id));
        setFeature(data);
        setName(data.name);
        setDescription(data.description);
        setTemplatePromptId(data.templatePromptId);
        setSqlQueryName(data.sqlQueryName || "");
        setSqlQueryContent(data.sqlQueryContent || "");
        setSequenceDiagramName(data.sequenceDiagramName || "");
        setSequenceDiagramContent(data.sequenceDiagramContent || "");

        // Fetch template prompt if ID exists
        if (data.templatePromptId) {
          const templatePrompt = await templatePromptApi.getTemplatePromptById(
            data.templatePromptId,
          );
          setSelectedTemplatePrompt(templatePrompt);
        }
      } catch (error) {
        console.error("Failed to fetch feature:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, [id, isNewFeature]);

  // Handle template prompt change
  const handleTemplatePromptChange = async (value: string) => {
    const promptId = Number(value);
    setTemplatePromptId(promptId);

    try {
      const templatePrompt =
        await templatePromptApi.getTemplatePromptById(promptId);
      setSelectedTemplatePrompt(templatePrompt);
    } catch (error) {
      console.error("Failed to fetch template prompt:", error);
      setSelectedTemplatePrompt(null);
    }

    handleSaveDebounced();
  };

  const handleSave = async () => {
    if (saving) return;

    const data: FeatureRequestDto = {
      name,
      description,
      templatePromptId,
      sqlQueryName,
      sqlQueryContent,
      sequenceDiagramName,
      sequenceDiagramContent,
    };

    setSaving(true);
    try {
      if (isNewFeature) {
        let newFeature;
        if (folderId) {
          // If folderId is present, add feature to the folder
          newFeature = await folderApi.addFeatureToFolder(Number(folderId), data);
        } else {
          // Otherwise create a standalone feature
          newFeature = await featureApi.createFeature(data);
        }
        router.push(`/feature/info?id=${newFeature.id}`);
      } else {
        await featureApi.updateFeature(Number(id), data);
      }
    } catch (error) {
      console.error("Failed to save feature:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await featureApi.deleteFeature(Number(id));
      router.push("/feature/list");
    } catch (error) {
      console.error("Failed to delete feature:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSaveDebounced = useDebounce(async () => {
    if (
      !isNewFeature &&
      (feature?.name !== name ||
        feature?.description !== description ||
        feature?.templatePromptId !== templatePromptId ||
        feature?.sqlQueryName !== sqlQueryName ||
        feature?.sqlQueryContent !== sqlQueryContent ||
        feature?.sequenceDiagramName !== sequenceDiagramName ||
        feature?.sequenceDiagramContent !== sequenceDiagramContent)
    ) {
      await handleSave();
    }
  }, 1000); // 1 second

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    handleSaveDebounced();
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
    handleSaveDebounced();
  };

  const handleSqlQueryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSqlQueryName(e.target.value);
    handleSaveDebounced();
  };

  const handleSequenceDiagramNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSequenceDiagramName(e.target.value);
    handleSaveDebounced();
  };

  const handleSqlQueryContentChange = (value: string | undefined) => {
    setSqlQueryContent(value || "");
    handleSaveDebounced();
  };

  const handleSequenceDiagramContentChange = (value: string | undefined) => {
    setSequenceDiagramContent(value || "");
    handleSaveDebounced();
  };

  // Keep the blur handlers as fallbacks
  const handleNameBlur = async () => {
    if (!isNewFeature && feature?.name !== name) {
      await handleSave();
    }
  };

  const handleDescriptionBlur = async () => {
    if (!isNewFeature && feature?.description !== description) {
      await handleSave();
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
                  <BreadcrumbLink href="/feature/list">Feature</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {isNewFeature ? "New Feature" : "Feature Info"}
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
                {/* Feature Section */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-xl font-semibold">Feature</h2>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={handleNameChange}
                      onBlur={handleNameBlur}
                      placeholder="Enter feature name"
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={handleDescriptionChange}
                      onBlur={handleDescriptionBlur}
                      placeholder="Enter feature description"
                      className="max-w-md"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Template Prompt Section */}
                <div className="flex flex-col gap-6 mt-6">
                  <h2 className="text-xl font-semibold">Template Prompt</h2>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="templatePrompt"
                      className="text-sm font-medium"
                    >
                      Template Prompt
                    </label>
                    <Select
                      value={templatePromptId?.toString()}
                      onValueChange={handleTemplatePromptChange}
                    >
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select a template prompt" />
                      </SelectTrigger>
                      <SelectContent>
                        {templatePrompts.map((prompt) => (
                          <SelectItem
                            key={prompt.id}
                            value={prompt.id.toString()}
                          >
                            {prompt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedTemplatePrompt && (
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-sm font-medium">
                        Template Prompt Content
                      </label>
                      <div className="border rounded-md p-4 bg-white">
                        <ReactMarkdown>
                          {selectedTemplatePrompt.promptContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>

                {/* SQL Query Section */}
                <div className="flex flex-col gap-6 mt-6">
                  <h2 className="text-xl font-semibold">SQL Query</h2>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="sqlQueryName"
                      className="text-sm font-medium"
                    >
                      SQL Query Name
                    </label>
                    <Input
                      id="sqlQueryName"
                      value={sqlQueryName}
                      onChange={handleSqlQueryNameChange}
                      placeholder="Enter SQL query name"
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="sqlQueryContent"
                      className="text-sm font-medium"
                    >
                      SQL Query Content
                    </label>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                      <Editor
                        height="100%"
                        language="sql"
                        value={sqlQueryContent}
                        onChange={handleSqlQueryContentChange}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sequence Diagram Section */}
                <div className="flex flex-col gap-6 mt-6">
                  <h2 className="text-xl font-semibold">Sequence Diagram</h2>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="sequenceDiagramName"
                      className="text-sm font-medium"
                    >
                      Sequence Diagram Name
                    </label>
                    <Input
                      id="sequenceDiagramName"
                      value={sequenceDiagramName}
                      onChange={handleSequenceDiagramNameChange}
                      placeholder="Enter sequence diagram name"
                      className="max-w-md"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="sequenceDiagramContent"
                      className="text-sm font-medium"
                    >
                      Sequence Diagram Content
                    </label>
                    <div className="h-[300px] border rounded-md overflow-hidden">
                      <Editor
                        height="100%"
                        language="json"
                        value={sequenceDiagramContent}
                        onChange={handleSequenceDiagramContentChange}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                        }}
                        beforeMount={(monaco) => {
                          monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                            {
                              validate: true,
                              enableSchemaRequest: true,
                              schemas: [
                                {
                                  fileMatch: ["config.json"],
                                  uri: "https://mermaid.js.org/schemas/config.schema.json",
                                },
                              ],
                            },
                          );
                        }}
                      />
                    </div>
                  </div>
                  {mermaidSvg && (
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="text-sm font-medium">
                        Sequence Diagram Preview
                      </label>
                      <div
                        className="border rounded-md p-4 bg-white"
                        dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/feature/list")}
                  >
                    Back to List
                  </Button>
                  <div className="flex gap-2">
                    {!isNewFeature && (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : isNewFeature ? "Create" : "Save"}
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
              Are you sure you want to delete this feature? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              Feature:{" "}
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
