import React, { useEffect, useRef, useState } from "react";
import { X, Copy } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { useLocale } from "../lib/locale";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  const { t } = useLocale();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync if user data changes elsewhere
  useEffect(() => {
    setDisplayName(user?.name || "");
    setAvatarPreview(user?.avatarUrl || null);
  }, [user?.name, user?.avatarUrl]);

  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingName]);

  const saveDisplayName = async () => {
    if (!user?.token) return;
    const newName = displayName.trim();
    if (!newName) {
      setDisplayName(user.name);
      return;
    }
    if (newName === user.name) return;

    try {
      const response = await api.updateProfileName(user.token, newName);
      if (response.success) {
        updateUser({ name: newName });
      } else {
        setDisplayName(user.name);
        alert(response.message);
      }
    } catch (err) {
      console.error(err);
      setDisplayName(user.name);
      alert("Unable to update name.");
    }
  };

  if (!open) return null;

  const handleCopyEmail = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      alert("Email copied successfully.");
    } catch {
      alert("Unable to copy email.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-strong backdrop-blur-sm">
      <div className="w-full max-w-[448px] rounded-[24px] bg-surface shadow-[0_25px_25px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Header — px-24 py-12 to match Figma exactly */}
        <div className="flex items-center justify-between border-b-[0.8px] border-border-soft px-[24px] py-[12px]">
          <h2 className="text-[18px] font-semibold leading-[28px] tracking-tight text-text-primary">
            {t("Edit Profile")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-[8px] p-[8px] transition-colors hover:bg-surface-hover"
          >
            <X className="h-5 w-5 text-icon-secondary" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-[27px] p-[24px]">
          {/* Avatar — 92px per Figma, not 96px */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative size-[92px] overflow-hidden rounded-full border-[1.2px] border-border-default bg-surface-subtle transition-all"
            >
              <div className="flex h-full w-full items-center justify-center text-[39px] font-normal text-text-primary">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={t("Profile")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-overlay-strong opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="text-sm font-medium text-action-on-primary">
                  {t("Change Photo")}
                </span>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                if (!allowedTypes.includes(file.type)) {
                  alert(t("Please select a JPG, PNG, or WebP image."));
                  return;
                }
                if (file.size > 2 * 1024 * 1024) {
                  alert(t("Profile image must be 2 MB or smaller."));
                  return;
                }

                const previewUrl = URL.createObjectURL(file);
                setAvatarPreview(previewUrl);

                try {
                  if (!user?.token) throw new Error(t("You are not logged in."));

                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result !== "string") {
                        reject(new Error(t("Unable to read image.")));
                        return;
                      }
                      resolve(reader.result);
                    };
                    reader.onerror = () => reject(new Error(t("Unable to read image.")));
                    reader.readAsDataURL(file);
                  });

                  const response = await api.uploadAvatar(
                    user.token,
                    base64,
                    file.name,
                    file.type
                  );

                  if (!response.success) {
                    throw new Error(response.message || t("Avatar upload failed."));
                  }

                  updateUser({ avatarUrl: response.avatarUrl });
                  URL.revokeObjectURL(previewUrl);
                } catch (err: any) {
                  console.error("Avatar upload failed:", err);
                  alert(err?.message || t("Unable to upload avatar."));
                  setAvatarPreview(user?.avatarUrl || null);
                }
              }}
            />
          </div>

          {/* Fields — gap-21px between fields, matching Figma */}
          <div className="flex w-full flex-col items-center gap-[21px]">
            {/* Display Name */}
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="flex w-full max-w-[400px] flex-col gap-[8px] rounded-[16px] border-[0.8px] border-border-default bg-surface px-[16px] py-[14px] text-left transition-colors hover:border-border-strong"
            >
              <p className="text-[12px] font-normal leading-[16px] text-text-secondary">
                {t("Display name")}
              </p>

              {editingName ? (
                <input
                  ref={inputRef}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={async () => {
                    setEditingName(false);
                    await saveDisplayName();
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setEditingName(false);
                      await saveDisplayName();
                    }
                  }}
                  className="w-full border-none bg-transparent text-[14px] font-medium leading-[16px] text-text-primary outline-none"
                />
              ) : (
                <p className="text-[14px] font-medium leading-[16px] text-text-primary">
                  {displayName}
                </p>
              )}
            </button>

            {/* Email */}
            <div className="relative flex w-full max-w-[400px] flex-col gap-[8px] rounded-[16px] border-[0.8px] border-border-default bg-surface px-[16px] py-[14px]">
              <p className="text-[12px] font-normal leading-[16px] text-text-secondary">
                {t("Email Id")}
              </p>
              <p className="pr-[28px] text-[14px] font-medium leading-[16px] text-text-secondary">
                {user?.email}
              </p>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="absolute right-[16px] top-1/2 size-[18px] -translate-y-1/2 text-icon-muted transition-colors hover:text-icon-secondary"
              >
                <Copy className="h-full w-full" />
              </button>
            </div>

            {/* Footer note */}
            <p className="text-center text-[12px] font-normal leading-[16px] text-text-primary">
              {t("Your profile helps people recognize you in group chats.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}