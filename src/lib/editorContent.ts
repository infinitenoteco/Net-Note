import type {
  EditorBlock,
  EditorDocument,
} from "../types/editorTypes";

const EDITOR_VERSION = 1;

function createBlockId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createParagraphBlock(
  content = ""
): EditorBlock {
  return {
    id: createBlockId(),
    type: "paragraph",
    content,
  };
}

export function createEmptyEditorDocument(): EditorDocument {
  return {
    version: EDITOR_VERSION,
    blocks: [createParagraphBlock("")],
  };
}

export function parseEditorContent(
  rawContent: string | null | undefined
): EditorDocument {
  const raw = String(rawContent ?? "");

  /*
   * Empty note
   */
  if (!raw.trim()) {
    return createEmptyEditorDocument();
  }

  /*
   * New editor format
   */
  try {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      parsed.version === EDITOR_VERSION &&
      Array.isArray(parsed.blocks)
    ) {
      const validBlocks: EditorBlock[] = [];

      for (const block of parsed.blocks) {
        if (
          block &&
          typeof block.id === "string" &&
          typeof block.type === "string" &&
          typeof block.content === "string"
        ) {
          validBlocks.push(block as EditorBlock);
        }
      }

      if (validBlocks.length > 0) {
        return {
          version: EDITOR_VERSION,
          blocks: validBlocks,
        };
      }
    }
  } catch {
    /*
     * Old plain-text content.
     * This is expected for existing notes.
     */
  }

  /*
   * Backward compatibility:
   *
   * Existing notes are plain text.
   * Convert each line into a paragraph block.
   */
  const lines = raw.split(/\r?\n/);

  return {
    version: EDITOR_VERSION,
    blocks:
      lines.length > 0
        ? lines.map((line) => createParagraphBlock(line))
        : [createParagraphBlock(raw)],
  };
}

export function serializeEditorContent(
  document: EditorDocument
): string {
  return JSON.stringify({
    version: EDITOR_VERSION,
    blocks: document.blocks,
  });
}

export function getPlainTextFromEditorContent(
  rawContent: string | null | undefined
): string {
  const document = parseEditorContent(rawContent);

  return document.blocks
    .map((block) => block.content)
    .filter(Boolean)
    .join("\n");
}