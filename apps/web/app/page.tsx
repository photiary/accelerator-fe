"use client";

import { Button } from "@workspace/ui/components/button";
// import { foldersApi } from "@/app/folders/foldersAPI";

export default function Page() {
  const getFolderById = async (id: number) => {
    // await foldersApi.getFolderById(id);
  };

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button
          size="sm"
          onClick={async () => {
            await getFolderById(1);
          }}
        >
          Button
        </Button>
      </div>
    </div>
  );
}
