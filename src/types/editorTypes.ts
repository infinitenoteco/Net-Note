export type EditorBlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
    | "heading4"
  | "heading5"
  | "heading6"
  | "bulletedList"
  | "numberedList"
  | "todo"
  | "quote"
  | "divider"
  | "code"
  | "callout"
  | "toggle"
  | "image"
  | "file"
  | "link";

export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  content: string;

  checked?: boolean;

  language?: string;

  url?: string;

  caption?: string;

  children?: EditorBlock[];
}

export interface EditorDocument {
  version: 1;
  blocks: EditorBlock[];
}