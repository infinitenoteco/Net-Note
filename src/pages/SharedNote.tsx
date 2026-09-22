import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { BlockEditor } from "../components/BlockEditor";

interface SharedNoteData {
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function SharedNote() {
  const { shareId } = useParams<{ shareId: string }>();

  const [note, setNote] = useState<SharedNoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSharedNote() {
      if (!shareId) {
        setError("Invalid share link.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.getSharedNote(shareId);

        if (!response.success || !response.note) {
          setError(response.message || "This shared note is not available.");
          return;
        }

        setNote(response.note);
      } catch (err) {
        console.error("Shared note error:", err);
        setError("Unable to load this shared note.");
      } finally {
        setLoading(false);
      }
    }

    loadSharedNote();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="text-sm text-[#6B6B68]">
          Loading note...
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E4E0] bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#1A1A18]">
            Note unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6B6B68]">
            {error || "This shared note could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <article className="rounded-2xl border border-[#E5E4E0] bg-white px-7 py-8 shadow-sm">
          <h1 className="text-3xl font-semibold leading-tight text-[#1A1A18]">
            {note.title || "Untitled Note"}
          </h1>

          <div className="mt-8">
            <BlockEditor
              content={note.content || ""}
              readOnly={true}
            />
          </div>
        </article>
      </main>
    </div>
  );
}