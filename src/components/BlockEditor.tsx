import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  CircleAlert,
  ChevronRight,
} from "lucide-react";

import type {
  EditorBlock,
  EditorDocument,
} from "../types/editorTypes";

import {
  createParagraphBlock,
  parseEditorContent,
  serializeEditorContent,
} from "../lib/editorContent";

import { EditorBlock as EditorBlockComponent } from "./EditorBlock";
import { useLocale } from "../lib/locale";
import { motion } from "motion/react";

interface BlockEditorProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

type SlashCommand = {
  type: EditorBlock["type"];
  label: string;
  description: string;
  icon: React.ReactNode;
};

type NestedUpdateResult = {
  blocks: EditorBlock[];
  changed: boolean;
};

function updateNestedBlock(
  blocks: EditorBlock[],
  blockId: string,
  updater: (block: EditorBlock) => EditorBlock
): NestedUpdateResult {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];

    if (block.id === blockId) {
      const updatedBlock = updater(block);

      if (updatedBlock === block) {
        return { blocks, changed: false };
      }

      const nextBlocks = blocks.slice();
      nextBlocks[index] = updatedBlock;

      return { blocks: nextBlocks, changed: true };
    }

    if (block.children?.length) {
      const result = updateNestedBlock(
        block.children,
        blockId,
        updater
      );

      if (result.changed) {
        const nextBlocks = blocks.slice();
        nextBlocks[index] = {
          ...block,
          children: result.blocks,
        };

        return { blocks: nextBlocks, changed: true };
      }
    }
  }

  return { blocks, changed: false };
}

type AddNestedBlockResult = {
  blocks: EditorBlock[];
  added: boolean;
};

function addNestedBlock(
  blocks: EditorBlock[],
  parentId: string,
  targetId: string
): AddNestedBlockResult {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];

    if (block.id === parentId) {
      const children = block.children ?? [];
      const childIndex = children.findIndex(
        (child) => child.id === targetId
      );

      if (childIndex !== -1) {
        const newBlock = createParagraphBlock("");
        const nextChildren = [
          ...children.slice(0, childIndex + 1),
          newBlock,
          ...children.slice(childIndex + 1),
        ];

        const nextBlocks = blocks.slice();
        nextBlocks[index] = {
          ...block,
          children: nextChildren,
        };

        return {
          blocks: nextBlocks,
          added: true,
        };
      }
    }

    if (block.children?.length) {
      const result = addNestedBlock(
        block.children,
        parentId,
        targetId
      );

      if (result.added) {
        const nextBlocks = blocks.slice();
        nextBlocks[index] = {
          ...block,
          children: result.blocks,
        };

        return {
          blocks: nextBlocks,
          added: true,
        };
      }
    }
  }

  return {
    blocks,
    added: false,
  };
}

type EnterResult = {
  blocks: EditorBlock[];
  added: boolean;
  focusBlockId: string | null;
};

function insertBlockAfterId(
  blocks: EditorBlock[],
  blockId: string
): EnterResult {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];

    if (block.id === blockId) {
      const isList =
        block.type === "bulletedList" ||
        block.type === "numberedList" ||
        block.type === "todo";

      // Pressing Enter on an empty list item exits the list.
      if (isList && block.content.trim() === "") {
        const newBlock = createParagraphBlock("");

        return {
          blocks: [
            ...blocks.slice(0, index),
            newBlock,
            ...blocks.slice(index + 1),
          ],
          added: true,
          focusBlockId: newBlock.id,
        };
      }

      // Pressing Enter on a non-empty list item continues the same list.
      const newBlock: EditorBlock = isList
        ? {
            ...createParagraphBlock(""),
            type: block.type,
            checked:
              block.type === "todo"
                ? false
                : undefined,
          }
        : createParagraphBlock("");

      return {
        blocks: [
          ...blocks.slice(0, index + 1),
          newBlock,
          ...blocks.slice(index + 1),
        ],
        added: true,
        focusBlockId: newBlock.id,
      };
    }

    if (block.children?.length) {
      const result = insertBlockAfterId(
        block.children,
        blockId
      );

      if (result.added) {
        const nextBlocks = blocks.slice();
        nextBlocks[index] = {
          ...block,
          children: result.blocks,
        };

        return result
          ? {
              ...result,
              blocks: nextBlocks,
            }
          : result;
      }
    }
  }

  return {
    blocks,
    added: false,
    focusBlockId: null,
  };
}

type RemoveBlockResult = {
  blocks: EditorBlock[];
  removed: boolean;
  previousBlockId: string | null;
};

function removeBlockById(
  blocks: EditorBlock[],
  blockId: string
): RemoveBlockResult {
  for (let index = 0; index < blocks.length; index++) {
    if (blocks[index].id === blockId) {
      if (index === 0) {
        return {
          blocks,
          removed: false,
          previousBlockId: null,
        };
      }

      return {
        blocks: [
          ...blocks.slice(0, index),
          ...blocks.slice(index + 1),
        ],
        removed: true,
        previousBlockId: blocks[index - 1].id,
      };
    }
  }

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];

    if (!block.children?.length) {
      continue;
    }

    const result = removeBlockById(
      block.children,
      blockId
    );

    if (result.removed) {
      const nextBlocks = blocks.slice();
      nextBlocks[index] = {
        ...block,
        children: result.blocks,
      };

      return {
        blocks: nextBlocks,
        removed: true,
        previousBlockId: result.previousBlockId,
      };
    }
  }

  return {
    blocks,
    removed: false,
    previousBlockId: null,
  };
}

export function BlockEditor({
  content,
  onChange,
  readOnly = false,
}: BlockEditorProps) {
  const { t } = useLocale();

  const [document, setDocument] =
    useState<EditorDocument>(() =>
      parseEditorContent(content)
    );
  const [openToggles, setOpenToggles] =
    useState<Record<string, boolean>>({});
  const [focusBlockId, setFocusBlockId] =
    useState<string | null>(null);

  const lastExternalContentRef = useRef(content);
  const focusedBlockIdRef =
    useRef<string | null>(null);
  const documentRef =
    useRef<EditorDocument>(document);
  const isDirtyRef = useRef(false);

  const [slashQuery, setSlashQuery] =
    useState<string | null>(null);
  const [slashBlockId, setSlashBlockId] =
    useState<string | null>(null);

  useLayoutEffect(() => {
    documentRef.current = document;
  }, [document]);

  const slashCommands = useMemo<SlashCommand[]>(
    () => [
      {
        type: "paragraph",
        label: t("Text"),
        description: t("Just Start Writing"),
        icon: <Type className="w-4 h-4" />,
      },
      {
        type: "heading1",
        label: t("Heading 1"),
        description: t("Large heading"),
        icon: <Heading1 className="w-4 h-4" />,
      },
      {
        type: "heading2",
        label: t("Heading 2"),
        description: t("Medium heading"),
        icon: <Heading2 className="w-4 h-4" />,
      },
      {
        type: "heading3",
        label: t("Heading 3"),
        description: t("Small heading"),
        icon: <Heading3 className="w-4 h-4" />,
      },
      {
        type: "heading4",
        label: t("Heading 4"),
        description: t("Small section heading"),
        icon: <Heading4 className="w-4 h-4" />,
      },
      {
        type: "heading5",
        label: t("Heading 5"),
        description: t("Smaller heading"),
        icon: <Heading5 className="w-4 h-4" />,
      },
      {
        type: "heading6",
        label: t("Heading 6"),
        description: t("Smallest heading"),
        icon: <Heading6 className="w-4 h-4" />,
      },
      {
        type: "bulletedList",
        label: t("Bulleted List"),
        description: t("Create A Bulleted List"),
        icon: <List className="w-4 h-4" />,
      },
      {
        type: "numberedList",
        label: t("Numbered List"),
        description: t("Create A Numbered List"),
        icon: <ListOrdered className="w-4 h-4" />,
      },
      {
        type: "todo",
        label: t("To-do List"),
        description: t("Create A Task List"),
        icon: <CheckSquare className="w-4 h-4" />,
      },
      {
        type: "quote",
        label: t("Quote"),
        description: t("Add A Quote"),
        icon: <Quote className="w-4 h-4" />,
      },
      {
        type: "code",
        label: t("Code"),
        description: t("Add Code Block"),
        icon: <Code2 className="w-4 h-4" />,
      },
      {
        type: "callout",
        label: t("Callout"),
        description: t("Highlight Info"),
        icon: <CircleAlert className="w-4 h-4" />,
      },
      // {
      //   type: "divider",
      //   label: "Divider",
      //   description: "Add a divider",
      //   icon: <Minus className="w-4 h-4" />,
      // },

      // {
      //   type: "toggle",
      //   label: "Toggle",
      //   description: "Create a collapsible section",
      //   icon: <ChevronRight className="w-4 h-4" />,
      // },
    ],
    [t]
  );

  /*
   * Load a different note when the parent content changes.
   */
  useEffect(() => {
    if (
      content === lastExternalContentRef.current
    ) {
      return;
    }

    isDirtyRef.current = false;
    lastExternalContentRef.current = content;

    setDocument(
      parseEditorContent(content)
    );
  }, [content]);

  useEffect(() => {
    if (!isDirtyRef.current || readOnly) {
      return;
    }

    const serializedContent =
      serializeEditorContent(document);

    lastExternalContentRef.current =
      serializedContent;
    isDirtyRef.current = false;

    onChange?.(serializedContent);
  }, [document, onChange, readOnly]);

  const updateDocument = useCallback(
    (
      updater: (
        current: EditorDocument
      ) => EditorDocument
    ) => {
      isDirtyRef.current = true;
      setDocument(updater);
    },
    []
  );

  const handleBlockChange = useCallback(
    (
      blockId: string,
      newContent: string
    ) => {
      updateDocument((current) => {
        const result = updateNestedBlock(
          current.blocks,
          blockId,
          (block) => {
            if (block.content === newContent) {
              return block;
            }

            return {
              ...block,
              content: newContent,
            };
          }
        );

        return result.changed
          ? {
              ...current,
              blocks: result.blocks,
            }
          : current;
      });

      if (newContent.startsWith("/")) {
        setSlashBlockId(blockId);
        setSlashQuery(newContent.slice(1));
      } else {
        setSlashBlockId(null);
        setSlashQuery(null);
      }
    },
    [updateDocument]
  );

  const handleToggleTodo = useCallback(
    (blockId: string) => {
      updateDocument((current) => {
        for (const block of current.blocks) {
          if (block.id === blockId) {
            return {
              ...current,
              blocks: current.blocks.map((item) =>
                item.id === blockId
                  ? {
                      ...item,
                      checked: !(item.checked ?? false),
                    }
                  : item
              ),
            };
          }
        }

        return current;
      });
    },
    [updateDocument]
  );

  const handleSlashCommand = useCallback(
    (command: SlashCommand) => {
      if (!slashBlockId) return;

      updateDocument((current) => {
        const result = updateNestedBlock(
          current.blocks,
          slashBlockId,
          (block) => ({
            ...block,
            type: command.type,
            content: "",
            checked:
              command.type === "todo"
                ? false
                : undefined,
            children:
              command.type === "toggle"
                ? [createParagraphBlock("")]
                : undefined,
          })
        );

        return result.changed
          ? {
              ...current,
              blocks: result.blocks,
            }
          : current;
      });

      setSlashBlockId(null);
      setSlashQuery(null);
    },
    [slashBlockId, updateDocument]
  );

  const normalizedSlashQuery = useMemo(
    () =>
      (slashQuery || "")
        .trim()
        .toLowerCase(),
    [slashQuery]
  );

  const {
    filteredSlashCommands,
    textSlashCommands,
    listSlashCommands,
    elementSlashCommands,
  } = useMemo(() => {
    const filtered: SlashCommand[] = [];

    for (const command of slashCommands) {
      if (
        normalizedSlashQuery &&
        ![
          command.label,
          command.description,
          command.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSlashQuery)
      ) {
        continue;
      }

      filtered.push(command);
    }

    const textCommands: SlashCommand[] = [];
    const listCommands: SlashCommand[] = [];
    const elementCommands: SlashCommand[] = [];

    for (const command of filtered) {
      if (
        command.type === "paragraph" ||
        command.type.startsWith("heading")
      ) {
        textCommands.push(command);
        continue;
      }

      if (
        command.type === "bulletedList" ||
        command.type === "numberedList" ||
        command.type === "todo"
      ) {
        listCommands.push(command);
        continue;
      }

      if (
        command.type === "quote" ||
        command.type === "code" ||
        command.type === "callout"
      ) {
        elementCommands.push(command);
      }
    }

    return {
      filteredSlashCommands: filtered,
      textSlashCommands: textCommands,
      listSlashCommands: listCommands,
      elementSlashCommands: elementCommands,
    };
  }, [normalizedSlashQuery, slashCommands]);

  const listIndexes = useMemo(() => {
    const indexes: number[] = new Array(
      document.blocks.length
    );
    let previousType: EditorBlock["type"] | null =
      null;
    let count = 0;

    for (let index = 0; index < document.blocks.length; index++) {
      const currentType =
        document.blocks[index]?.type;

      if (
        currentType !== "numberedList" &&
        currentType !== "bulletedList"
      ) {
        indexes[index] = 1;
        previousType = null;
        count = 0;
        continue;
      }

      if (currentType === previousType) {
        count++;
      } else {
        count = 1;
      }

      indexes[index] = count;
      previousType = currentType;
    }

    return indexes;
  }, [document.blocks]);

  const handleEnter = useCallback(
    (blockId: string) => {
      // Calculate the new document before updating React state. This lets us
      // set the focus target in the same render as the newly created block.
      const result = insertBlockAfterId(
        documentRef.current.blocks,
        blockId
      );

      if (!result.added) {
        return;
      }

      if (result.focusBlockId) {
        setFocusBlockId(result.focusBlockId);
      }

      updateDocument((current) => {
        if (current !== documentRef.current) {
          const latestResult = insertBlockAfterId(
            current.blocks,
            blockId
          );

          return latestResult.added
            ? {
                ...current,
                blocks: latestResult.blocks,
              }
            : current;
        }

        return {
          ...current,
          blocks: result.blocks,
        };
      });
    },
    [updateDocument]
  );

  const handleBackspace = useCallback(
    (blockId: string) => {
      const result = removeBlockById(
        documentRef.current.blocks,
        blockId
      );

      if (!result.removed) {
        return;
      }

      if (result.previousBlockId) {
        setFocusBlockId(result.previousBlockId);
      }

      updateDocument((current) => {
        if (current !== documentRef.current) {
          const latestResult = removeBlockById(
            current.blocks,
            blockId
          );

          return latestResult.removed
            ? {
                ...current,
                blocks: latestResult.blocks,
              }
            : current;
        }

        return {
          ...current,
          blocks: result.blocks,
        };
      });
    },
    [updateDocument]
  );

  const handleToggleOpen = useCallback(
    (blockId: string) => {
      setOpenToggles((current) => ({
        ...current,
        [blockId]: !(current[blockId] ?? true),
      }));
    },
    []
  );

  const handleFocus = useCallback(
    (blockId: string) => {
      focusedBlockIdRef.current = blockId;
    },
    []
  );

  if (!document.blocks.length) {
    return (
      <div className="w-full">
        <div className="text-sm text-text-muted">
          {readOnly ? t("This note is empty.") : t("Start writing...")}
        </div>
      </div>
    );
  }

  const activeSlashBlock =
    slashBlockId
      ? document.blocks.find(
          (block) => block.id === slashBlockId
        )
      : null;

  return (
    <div className="w-full">
      {slashQuery !== null &&
        slashBlockId &&
        activeSlashBlock &&
        typeof window !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 32,
            }}
            className="
                fixed
                top-[44px]
                right-0
                bottom-[0px]
                z-[100]
                w-[280px]
                bg-surface
                border-l
                border-t
                border-border-soft
                rounded-tl-[0px]
                shadow-[-0px_0_0px_rgba(0,0,0,0.08)]
                overflow-y-auto
                border-l-[0.8px]
            "
          >
            <div className="flex flex-col h-full">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-2 py-4">
                {normalizedSlashQuery && filteredSlashCommands.length === 0 && (
                  <div className="px-2 py-6 text-center text-[12px] text-text-secondary">
                    No commands found
                  </div>
                )}
                {/* CATEGORY: TEXT */}
                <div className="mb-4">
                  <div className="px-2 mb-2">
                    <p className="text-[12px] font-semibold text-text-secondary leading-[16.5px]">
                      Text
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    {textSlashCommands.map((command) => (
                        <button
                          key={command.type}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSlashCommand(command);
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-2
                            py-2
                            rounded-[8px]
                            text-left
                            hover:bg-surface-hover
                            transition-colors
                            group
                          "
                        >
                          <div
                            className="
                              w-8
                              h-8
                              rounded-[8px]
                              bg-surface
                              border
                              border-border-soft
                              flex
                              items-center
                              justify-center
                              text-text-muted
                              flex-shrink-0
                            "
                          >
                            {command.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-medium text-text-primary leading-[20px] truncate">
                              {command.label}
                            </div>

                            <div className="text-[11px] text-text-secondary leading-[16.5px] truncate">
                              {command.description}
                            </div>
                          </div>

                          <div className="flex gap-0.5 items-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                            <div className="text-[11px] text-text-secondary leading-[16.5px]">
                              {command.type[0]?.toUpperCase()}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* CATEGORY: LISTS */}
                <div className="mb-4">
                  <div className="px-2 mb-2">
                    <p className="text-[12px] font-semibold text-text-secondary leading-[16.5px]">
                      Lists
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    {listSlashCommands.map((command) => (
                        <button
                          key={command.type}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSlashCommand(command);
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-2
                            py-2
                            rounded-[8px]
                            text-left
                            hover:bg-surface-hover
                            transition-colors
                            group
                          "
                        >
                          <div
                            className="
                              w-8
                              h-8
                              rounded-[8px]
                              bg-surface-hover
                              flex
                              items-center
                              justify-center
                              text-text-muted
                              flex-shrink-0
                            "
                          >
                            {command.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-medium text-text-primary leading-[20px] truncate">
                              {command.label}
                            </div>

                            <div className="text-[11px] text-text-secondary leading-[16.5px] truncate">
                              {command.description}
                            </div>
                          </div>

                          <div className="flex gap-0.5 items-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                            <div className="text-[11px] text-text-secondary leading-[16.5px]">
                              {command.type[0]?.toUpperCase()}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* CATEGORY: ELEMENTS */}
                <div>
                  <div className="px-2 mb-2">
                    <p className="text-[12px] font-semibold text-text-secondary leading-[16.5px]">
                      Elements
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    {elementSlashCommands.map((command) => (
                        <button
                          key={command.type}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSlashCommand(command);
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-2
                            py-2
                            rounded-[8px]
                            text-left
                            hover:bg-surface-hover
                            transition-colors
                            group
                          "
                        >
                          <div
                            className="
                              w-8
                              h-8
                              rounded-[8px]
                              bg-surface-hover
                              flex
                              items-center
                              justify-center
                              text-text-muted
                              flex-shrink-0
                            "
                          >
                            {command.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-medium text-text-primary leading-[20px] truncate">
                              {command.label}
                            </div>

                            <div className="text-[11px] text-text-secondary leading-[16.5px] truncate">
                              {command.description}
                            </div>
                          </div>

                          <div className="flex gap-0.5 items-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                            <div className="text-[11px] text-text-secondary leading-[16.5px]">
                              {command.type[0]?.toUpperCase()}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>,
          window.document.body
        )}

      {document.blocks.map(
        (block, index) => (
          <div
            key={block.id}
            data-editor-block={block.id}
            data-editor-block-id={block.id}
            className="
              relative
              w-full
              mb-1.5
              group
            "
          >
            <EditorBlockComponent
              block={block}
              isFirstBlock={index === 0}
              autoFocusBlockId={focusBlockId}
              listIndex={listIndexes[index] ?? 1}
              onChange={handleBlockChange}
              onEnter={handleEnter}
              onBackspace={handleBackspace}
              onFocus={handleFocus}
              onToggleTodo={handleToggleTodo}
              onToggleOpen={handleToggleOpen}
              openToggles={openToggles}
              readOnly={readOnly}
            />
          </div>
        )
      )}
    </div>
  );
}