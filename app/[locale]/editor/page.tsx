import React from 'react';
import { EditorProvider } from "@/context/EditorContext";
import EditorShell from "@/app/[locale]/editor/EditorShell";

export default function EditorPage() {
  return (
    // Provider 包裹整个编辑器路由
    <EditorProvider>
      <EditorShell />
    </EditorProvider>
  );
}