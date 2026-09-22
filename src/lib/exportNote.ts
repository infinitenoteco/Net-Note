import type { Note } from "../types";
import type { EditorBlock, EditorDocument } from "../types/editorTypes";

function parseEditorDocument(content: string): EditorDocument {
  try {
    const parsed = JSON.parse(content);

    if (
      parsed &&
      parsed.version === 1 &&
      Array.isArray(parsed.blocks)
    ) {
      return parsed as EditorDocument;
    }
  } catch {
    // Keep plain-text notes exportable even if older content is not JSON.
  }

  return {
    version: 1,
    blocks: [
      {
        id: "legacy-content",
        type: "paragraph",
        content,
      },
    ],
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function safeFileName(title: string, extension: string): string {
  const normalized = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "")
    .slice(0, 120);

  return `${normalized || "Untitled Note"}.${extension}`;
}

function blockToHtml(block: EditorBlock): string {
  const content = escapeHtml(block.content).replace(/\n/g, "<br />");

  switch (block.type) {
    case "heading1":
      return `<h1>${content}</h1>`;
    case "heading2":
      return `<h2>${content}</h2>`;
    case "heading3":
      return `<h3>${content}</h3>`;
    case "heading4":
      return `<h4>${content}</h4>`;
    case "heading5":
      return `<h5>${content}</h5>`;
    case "heading6":
      return `<h6>${content}</h6>`;
    case "bulletedList":
      return `<ul><li>${content}</li></ul>`;
    case "numberedList":
      return `<ol><li>${content}</li></ol>`;
    case "todo":
      return `<div class="todo"><span class="checkbox">${block.checked ? "☑" : "☐"}</span><span>${content}</span></div>`;
    case "quote":
      return `<blockquote>${content}</blockquote>`;
    case "divider":
      return "<hr />";
    case "code":
      return `<pre><code>${escapeHtml(block.content)}</code></pre>`;
    case "callout":
      return `<div class="callout">${content}</div>`;
    case "toggle":
      return `<details open><summary>${content}</summary>${block.children?.length ? block.children.map(blockToHtml).join("") : ""}</details>`;
    case "image":
      return block.url
        ? `<figure><img src="${escapeHtml(block.url)}" alt="${content}" />${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}</figure>`
        : `<p>${content}</p>`;
    case "file":
      return block.url
        ? `<p><a href="${escapeHtml(block.url)}">${content || escapeHtml(block.url)}</a></p>`
        : `<p>${content}</p>`;
    case "link":
      return block.url
        ? `<p><a href="${escapeHtml(block.url)}">${content || escapeHtml(block.url)}</a></p>`
        : `<p>${content}</p>`;
    case "paragraph":
    default:
      return `<p>${content || "&nbsp;"}</p>`;
  }
}

function blocksToHtml(blocks: EditorBlock[]): string {
  return blocks.map(blockToHtml).join("\n");
}

function blockToMarkdown(block: EditorBlock, depth = 0): string {
  const indent = "  ".repeat(depth);

  switch (block.type) {
    case "heading1":
      return `# ${block.content}`;
    case "heading2":
      return `## ${block.content}`;
    case "heading3":
      return `### ${block.content}`;
    case "heading4":
      return `#### ${block.content}`;
    case "heading5":
      return `##### ${block.content}`;
    case "heading6":
      return `###### ${block.content}`;
    case "bulletedList":
      return `${indent}- ${block.content}`;
    case "numberedList":
      return `${indent}1. ${block.content}`;
    case "todo":
      return `${indent}- [${block.checked ? "x" : " "}] ${block.content}`;
    case "quote":
      return block.content
        .split("\n")
        .map(line => `${indent}> ${line}`)
        .join("\n");
    case "divider":
      return "---";
    case "code":
      return `\`\`\`${block.language || ""}\n${block.content}\n\`\`\``;
    case "callout":
      return `> **Note:** ${block.content}`;
    case "toggle": {
      const children = block.children?.length
        ? `\n\n${block.children
            .map(child => blockToMarkdown(child, depth + 1))
            .join("\n\n")}`
        : "";
      return `<details>\n<summary>${block.content}</summary>${children}\n\n</details>`;
    }
    case "image":
      return block.url
        ? `![${block.caption || block.content}](${block.url})`
        : block.content;
    case "file":
    case "link":
      return block.url
        ? `[${block.content || block.url}](${block.url})`
        : block.content;
    case "paragraph":
    default:
      return block.content;
  }
}

function blocksToMarkdown(blocks: EditorBlock[]): string {
  return blocks
    .map(block => blockToMarkdown(block))
    .filter(Boolean)
    .join("\n\n");
}

function flattenBlocks(
  blocks: EditorBlock[],
  depth = 0,
  rows: Array<{
    depth: number;
    type: string;
    content: string;
    checked: string;
    language: string;
    url: string;
    caption: string;
  }> = []
) {
  blocks.forEach(block => {
    rows.push({
      depth,
      type: block.type,
      content: block.content,
      checked:
        typeof block.checked === "boolean"
          ? String(block.checked)
          : "",
      language: block.language || "",
      url: block.url || "",
      caption: block.caption || "",
    });

    if (block.children?.length) {
      flattenBlocks(block.children, depth + 1, rows);
    }
  });

  return rows;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportNoteAsHtml(note: Note, includeStyling = true): void {
  const documentData = parseEditorDocument(note.content);
  const body = blocksToHtml(documentData.blocks);

  const styling = includeStyling
    ? `
      <style>
        :root { color-scheme: light; }
        body {
          margin: 0;
          padding: 48px;
          background: #ffffff;
          color: #111111;
          font-family: Inter, Arial, sans-serif;
          line-height: 1.65;
        }
        main { max-width: 900px; margin: 0 auto; }
        h1 { font-size: 42px; line-height: 1.15; margin: 0 0 32px; }
        h2 { font-size: 32px; line-height: 1.2; margin: 28px 0 14px; }
        h3 { font-size: 25px; line-height: 1.25; margin: 24px 0 12px; }
        h4 { font-size: 20px; margin: 20px 0 10px; }
        h5 { font-size: 17px; margin: 18px 0 8px; }
        h6 { font-size: 15px; margin: 16px 0 8px; }
        p { margin: 0 0 16px; white-space: normal; }
        ul, ol { margin: 0 0 16px; padding-left: 28px; }
        li { margin: 5px 0; }
        blockquote {
          margin: 16px 0;
          padding: 8px 0 8px 16px;
          border-left: 3px solid #d4d4d0;
          color: #666666;
        }
        pre {
          margin: 16px 0;
          padding: 16px;
          overflow-x: auto;
          border: 1px solid #d9d9d5;
          border-radius: 10px;
          background: #f7f7f5;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .todo { display: flex; gap: 10px; margin: 8px 0; }
        .checkbox { font-size: 18px; }
        .callout {
          margin: 16px 0;
          padding: 14px 16px;
          border: 1px solid #e2e2de;
          border-radius: 10px;
          background: #f8f8f6;
        }
        details { margin: 16px 0; }
        summary { cursor: pointer; font-weight: 600; }
        figure { margin: 16px 0; }
        img { max-width: 100%; height: auto; }
        figcaption { margin-top: 6px; color: #777777; font-size: 14px; }
        a { color: inherit; }
        hr { border: 0; border-top: 1px solid #ddddda; margin: 24px 0; }
        .meta { color: #777777; font-size: 14px; margin-bottom: 28px; }
      </style>
    `
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(note.title || "Untitled Note")}</title>
  ${styling}
</head>
<body>
  <main>
    <h1>${escapeHtml(note.title || "Untitled Note")}</h1>
    <div class="meta">
      Created: ${escapeHtml(note.createdAt)}
      <br />
      Last edited: ${escapeHtml(note.updatedAt)}
    </div>
    ${body}
  </main>
</body>
</html>`;

  downloadBlob(
    new Blob([html], { type: "text/html;charset=utf-8" }),
    safeFileName(note.title, "html")
  );
}

export function exportNoteAsMarkdown(note: Note): void {
  const documentData = parseEditorDocument(note.content);

  const markdown = [
    `# ${note.title || "Untitled Note"}`,
    "",
    `Created: ${note.createdAt}`,
    `Last edited: ${note.updatedAt}`,
    "",
    blocksToMarkdown(documentData.blocks),
    "",
  ].join("\n");

  downloadBlob(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    safeFileName(note.title, "md")
  );
}

export function exportNoteAsCsv(note: Note): void {
  const documentData = parseEditorDocument(note.content);
  const rows = flattenBlocks(documentData.blocks);

  const csvRows = [
    [
      "Depth",
      "Block Type",
      "Content",
      "Checked",
      "Language",
      "URL",
      "Caption",
    ].map(escapeCsv).join(","),
    ...rows.map(row =>
      [
        String(row.depth),
        row.type,
        row.content,
        row.checked,
        row.language,
        row.url,
        row.caption,
      ]
        .map(escapeCsv)
        .join(",")
    ),
  ];

  downloadBlob(
    new Blob(["\uFEFF" + csvRows.join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    safeFileName(note.title, "csv")
  );
}

export function exportNoteAsPdf(
  note: Note,
  pageFormat: "A4" | "Letter" = "A4",
  scale = 100
): void {
  const documentData = parseEditorDocument(note.content);
  const body = blocksToHtml(documentData.blocks);

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("Unable to open the PDF export window.");
  }

  const pageSize = pageFormat === "Letter" ? "letter" : "A4";
  const safeScale = Math.min(200, Math.max(50, scale));

  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(note.title || "Untitled Note")}</title>
  <style>
    @page { size: ${pageSize}; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111;
      background: #fff;
      font-family: Inter, Arial, sans-serif;
      line-height: 1.65;
    }
    main {
      width: ${safeScale}%;
      margin: 0 auto;
      transform-origin: top left;
    }
    h1 { font-size: 36px; line-height: 1.15; margin: 0 0 24px; }
    h2 { font-size: 28px; line-height: 1.2; margin: 24px 0 12px; }
    h3 { font-size: 22px; margin: 20px 0 10px; }
    h4 { font-size: 18px; margin: 18px 0 8px; }
    h5 { font-size: 16px; margin: 16px 0 8px; }
    h6 { font-size: 14px; margin: 14px 0 8px; }
    p { margin: 0 0 14px; }
    ul, ol { margin: 0 0 14px; padding-left: 26px; }
    li { margin: 4px 0; }
    blockquote {
      margin: 14px 0;
      padding: 6px 0 6px 14px;
      border-left: 3px solid #d4d4d0;
      color: #666;
    }
    pre {
      padding: 14px;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
      border: 1px solid #d9d9d5;
      border-radius: 8px;
      background: #f7f7f5;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .todo { display: flex; gap: 9px; margin: 7px 0; }
    .callout {
      padding: 12px 14px;
      border: 1px solid #e2e2de;
      border-radius: 8px;
      background: #f8f8f6;
    }
    img { max-width: 100%; height: auto; }
    figure { margin: 14px 0; }
    figcaption { color: #777; font-size: 12px; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 20px 0; }
    .meta { color: #777; font-size: 12px; margin-bottom: 24px; }
    a { color: #111; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(note.title || "Untitled Note")}</h1>
    <div class="meta">
      Created: ${escapeHtml(note.createdAt)}
      <br />
      Last edited: ${escapeHtml(note.updatedAt)}
    </div>
    ${body}
  </main>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.print();
      }, 250);
    });
  </script>
</body>
</html>`);

  printWindow.document.close();
}
