import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import type { EditorBlock as EditorBlockType } from "../types/editorTypes";
import { useLocale } from "../lib/locale";
import {
  CircleAlert,
  ChevronRight,
} from "lucide-react";

interface EditorBlockProps {
  block: EditorBlockType;
  isFirstBlock: boolean;

  onChange: (blockId: string, content: string) => void;
  onEnter: (blockId: string) => void;
  onBackspace: (blockId: string) => void;
  onFocus?: (blockId: string) => void;
  onToggleOpen?: (blockId: string) => void;
  openToggles?: Record<string, boolean>;
  listIndex?: number;
  onToggleTodo?: (blockId: string) => void;
  readOnly?: boolean;
  autoFocusBlockId?: string | null;
}

function areEditorBlockPropsEqual(
  previous: EditorBlockProps,
  next: EditorBlockProps
) {
  const previousOpen =
    previous.block.type === "toggle"
      ? previous.openToggles?.[previous.block.id]
      : undefined;

  const nextOpen =
    next.block.type === "toggle"
      ? next.openToggles?.[next.block.id]
      : undefined;

  return (
    previous.block === next.block &&
    previous.isFirstBlock === next.isFirstBlock &&
    previous.onChange === next.onChange &&
    previous.onEnter === next.onEnter &&
    previous.onBackspace === next.onBackspace &&
    previous.onFocus === next.onFocus &&
    previous.onToggleOpen === next.onToggleOpen &&
    previousOpen === nextOpen &&
    previous.listIndex === next.listIndex &&
    previous.onToggleTodo === next.onToggleTodo &&
    previous.readOnly === next.readOnly &&
    previous.autoFocusBlockId === next.autoFocusBlockId
  );
}

function EditorBlockComponent({
  block,
  isFirstBlock,
  onChange,
  onEnter,
  onBackspace,
  onFocus,
  onToggleOpen,
  openToggles,
  listIndex = 1,
  onToggleTodo,
  readOnly = false,
  autoFocusBlockId = null,
}: EditorBlockProps) {
  const { t } = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    let frameId = requestAnimationFrame(() => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [block.content]);

  useLayoutEffect(() => {
    if (autoFocusBlockId !== block.id) return;

    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.focus();

    const length = textarea.value.length;
    textarea.setSelectionRange(length, length);
  }, [autoFocusBlockId, block.id]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(block.id, event.target.value);
    },
    [block.id, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onEnter(block.id);
        return;
      }

      if (
        event.key === "Backspace" &&
        block.content.length === 0 &&
        !isFirstBlock
      ) {
        event.preventDefault();
        onBackspace(block.id);
      }
    },
    [block.content.length, block.id, isFirstBlock, onBackspace, onEnter]
  );

  const handleFocus = useCallback(() => {
    onFocus?.(block.id);
  }, [block.id, onFocus]);

  const handleToggleOpen = useCallback(() => {
    onToggleOpen?.(block.id);
  }, [block.id, onToggleOpen]);

  const handleToggleTodo = useCallback(() => {
    onToggleTodo?.(block.id);
  }, [block.id, onToggleTodo]);

  const commonProps = {
    ref: textareaRef,
    value: block.content,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    spellCheck: true,
    rows: 1,
    readOnly,
  };

  if (block.type === "heading1") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 1")}
        className="
          w-full
          bg-transparent
          text-3xl
          md:text-4xl
          font-bold
          leading-tight
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

  if (block.type === "heading2") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 2")}
        className="
          w-full
          bg-transparent
          text-2xl
          md:text-3xl
          font-semibold
          leading-tight
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

  if (block.type === "heading3") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 3")}
        className="
          w-full
          bg-transparent
          text-xl
          md:text-2xl
          font-semibold
          leading-snug
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

    if (block.type === "heading4") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 4")}
        className="
          w-full
          bg-transparent
          text-lg
          md:text-xl
          font-semibold
          leading-snug
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

    if (block.type === "heading5") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 5")}
        className="
          w-full
          bg-transparent
          text-base
          md:text-lg
          font-semibold
          leading-snug
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

    if (block.type === "heading6") {
    return (
      <textarea
        {...commonProps}
        placeholder={t("Heading 6")}
        className="
          w-full
          bg-transparent
          text-sm
          md:text-base
          font-semibold
          leading-snug
          text-text-primary
          placeholder:text-text-muted/50
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    );
  }

  if (block.type === "bulletedList") {
    return (
      <div className="flex items-center gap-3 w-full">
      <span className="text-text-primary text-lg shrink-0 leading-none">
        •
      </span>

        <textarea
          {...commonProps}
          placeholder={t("List item")}
          className="
            w-full
            bg-transparent
            text-base
            md:text-lg
            text-text-primary
            placeholder:text-text-muted/60
            focus:outline-none
            resize-none
            overflow-hidden
            border-0
            p-0
            m-0
            leading-relaxed
          "
        />
      </div>
    );
  }

  if (block.type === "numberedList") {
    return (
      <div className="flex items-center gap-3 w-full">
      <span className="text-text-primary text-base md:text-lg shrink-0 min-w-[20px] leading-none">
        {listIndex}.
      </span>

        <textarea
          {...commonProps}
          placeholder={t("List item")}
          className="
            w-full
            bg-transparent
            text-base
            md:text-lg
            text-text-primary
            placeholder:text-text-muted/60
            focus:outline-none
            resize-none
            overflow-hidden
            border-0
            p-0
            m-0
            leading-relaxed
          "
        />
      </div>
    );
  }

  if (block.type === "todo") {
  const isChecked = block.checked ?? false;

  return (
    <div className="flex items-start gap-3 w-full py-0.5">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggleTodo?.(block.id)}
        disabled={readOnly}
        className="
            mt-2
            h-[17px]
            w-[17px]
            shrink-0
            cursor-pointer
            accent-control-accent
            rounded-[4px]
        "
        aria-label={t("Toggle task")}
      />

      <textarea
        {...commonProps}
        placeholder={t("To-do")}
        className={`
          w-full
          bg-transparent
          text-base
          md:text-lg
          leading-relaxed
          placeholder:text-text-muted/60
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
          ${
            isChecked
              ? "text-text-muted line-through"
              : "text-text-primary"
          }
        `}
      />
    </div>
  );
}
  


if (block.type === "quote") {
  return (
    <div
      className="
        w-full
        border-l-[3px]
        border-editor-quote-border
        pl-4
        py-1
      "
    >
      <textarea
        {...commonProps}
        placeholder={t("Quote")}
        className="
          w-full
          bg-transparent
          text-base
          md:text-lg
          italic
          leading-relaxed
          text-text-secondary
          placeholder:text-text-muted/60
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    </div>
  );
}

  if (block.type === "divider") {
    return (
      <div className="w-full py-3">
        <div className="w-full h-px bg-border" />
      </div>
    );
  }

  if (block.type === "code") {
  return (
    <div
      className="
        w-full
        rounded-[10px]
        border
        border-editor-code-border
        bg-editor-code-surface
        px-4
        py-3.5
        shadow-[0_1px_2px_rgba(0,0,0,0.03)]
      "
    >
      <textarea
        {...commonProps}
        placeholder={t("Write code...")}
        spellCheck={false}
        className="
          w-full
          bg-transparent
          text-[14px]
          md:text-[15px]
          font-mono
          leading-[1.65]
          text-editor-code-text
          placeholder:text-editor-code-placeholder
          focus:outline-none
          resize-none
          overflow-hidden
          border-0
          p-0
          m-0
        "
      />
    </div>
  );
}

    if (block.type === "callout") {
  return (
    <div
      className="
        w-full
        rounded-[10px]
        border
        border-editor-callout-border
        bg-editor-callout-surface
        px-4
        py-3.5
      "
    >
      <div className="flex items-start gap-3">
        <CircleAlert
          className="
            w-[18px]
            h-[18px]
            mt-[6px]
            shrink-0
            text-editor-callout-icon
          "
        />

        <textarea
          {...commonProps}
          placeholder={t("Write an important note...")}
          className="
            w-full
            bg-transparent
            text-base
            md:text-lg
            leading-relaxed
            text-text-primary
            placeholder:text-text-muted/60
            focus:outline-none
            resize-none
            overflow-hidden
            border-0
            p-0
            m-0
          "
        />
      </div>
    </div>
  );
}

   if (block.type === "toggle") {
  const isOpen = openToggles?.[block.id] ?? true;
  return (
    <div className="w-full">
      <div className="flex items-start gap-2 w-full">
        <button
          type="button"
          onClick={() => onToggleOpen?.(block.id)}
          className="
            mt-1
            w-5
            h-5
            shrink-0
            flex
            items-center
            justify-center
            text-text-secondary
            hover:text-text-primary
            transition-colors
          "
          aria-label={isOpen ? t("Collapse toggle") : t("Expand toggle")}
        >
          <ChevronRight
            className={`
              w-4
              h-4
              transition-transform
              ${isOpen ? "rotate-90" : ""}
            `}
          />
        </button>

        <textarea
          {...commonProps}
          placeholder={t("Toggle title")}
          className="
            w-full
            bg-transparent
            text-base
            md:text-lg
            font-medium
            text-text-primary
            placeholder:text-text-muted/60
            focus:outline-none
            resize-none
            overflow-hidden
            border-0
            p-0
            m-0
            leading-relaxed
          "
        />
      </div>

      {isOpen && (
  <div className="ml-7 mt-2 border-l border-border pl-4">
    {block.children?.length ? (
      block.children.map((child, index) => (
        <EditorBlock
          key={child.id}
          block={child}
          isFirstBlock={index === 0}
          onChange={onChange}
          autoFocusBlockId={autoFocusBlockId}
          onEnter={onEnter}
          onBackspace={onBackspace}
          onFocus={onFocus}
          onToggleOpen={onToggleOpen}
          onToggleTodo={onToggleTodo}
          openToggles={openToggles}
          readOnly={readOnly}
        />
      ))
    ) : (
      <div className="text-sm text-text-muted/60">
        {t("Click here and start writing...")}
      </div>
    )}
  </div>
)}
    </div>
  );
}

  return (
    <textarea
      {...commonProps}
      placeholder={
        isFirstBlock
          ? "Start writing..."
          : "Type something..."
      }
      className="
        w-full
        bg-transparent
        text-base
        md:text-lg
        text-text-primary
        placeholder:text-text-muted/60
        focus:outline-none
        resize-none
        overflow-hidden
        border-0
        p-0
        m-0
        leading-relaxed
      "
    />
  );
}
export const EditorBlock = memo(
  EditorBlockComponent,
  areEditorBlockPropsEqual
);
