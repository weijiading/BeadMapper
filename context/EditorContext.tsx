"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { BrandColor } from "@/lib/constants/palettes";
import { SamplingMode, ColorMethod, DitherMethod, BrandType } from "@/types"; // 确保 types/index.ts 中包含这些定义

// 定义状态结构
interface EditorState {
  imageSrc: string | null;
  processedData: {
    colors: string[];
    rows: number;
    cols: number;
  } | null;
  settings: {
    width: number;
    maxColors: number;
    ditherMethod: DitherMethod;
    colorMethod: ColorMethod;
    samplingMode: SamplingMode; // 修复：添加缺失的属性
    brands: BrandType[];        // 修复：添加缺失的属性
    excludedColors: string[];   // 修复：添加缺失的属性
  };
  activeTool: 'pen' | 'eraser' | 'pan' | 'select';
  selectedColor: string;
}

// 定义 Actions
type Action =
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'SET_PROCESSED_DATA'; payload: EditorState['processedData'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<EditorState['settings']> }
  | { type: 'SET_TOOL'; payload: EditorState['activeTool'] }
  | { type: 'SET_SELECTED_COLOR'; payload: string };

// 初始状态
const initialState: EditorState = {
  imageSrc: null,
  processedData: null,
  settings: {
    width: 50,
    maxColors: 20,
    ditherMethod: 'none',
    colorMethod: 'lab-ciede2000',
    samplingMode: 'default',
    brands: ['perler', 'mard'],
    excludedColors: []
  },
  activeTool: 'pen',
  selectedColor: '#000000'
};

// Reducer 实现
const editorReducer = (state: EditorState, action: Action): EditorState => {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, imageSrc: action.payload };
    case 'SET_PROCESSED_DATA':
      return { ...state, processedData: action.payload };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    case 'SET_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SET_SELECTED_COLOR':
      return { ...state, selectedColor: action.payload };
    default:
      return state;
  }
};

const EditorContext = createContext<{
  state: EditorState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
};