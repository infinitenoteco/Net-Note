import React, { memo, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Folder, X } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { useLocale } from "../lib/locale";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_BACKDROP_INITIAL = { opacity: 0 };
const MODAL_BACKDROP_ANIMATE = { opacity: 1 };
const MODAL_BACKDROP_EXIT = { opacity: 0 };
const MODAL_CONTENT_INITIAL = { opacity: 0, scale: 0.94, y: 16 };
const MODAL_CONTENT_ANIMATE = { opacity: 1, scale: 1, y: 0 };
const MODAL_CONTENT_EXIT = { opacity: 0, scale: 0.96, y: 10 };
const MODAL_CONTENT_TRANSITION = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};
const LOADER_ANIMATION = { rotate: 360 };
const LOADER_TRANSITION = {
  duration: 0.8,
  repeat: Infinity,
  ease: "linear" as const,
};

function CreateGroupModal({
  isOpen,
  onClose,
}: CreateGroupModalProps) {
  const { addGroup } = useAppContext();
  const { t } = useLocale();

  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const cleanGroupName = groupName.trim();
  const canCreate = cleanGroupName.length > 0 && !isCreating;

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isCreating) return;

    setGroupName("");
    onClose();
  }, [isCreating, onClose]);

  const handleGroupNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGroupName(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canCreate) return;

      setIsCreating(true);

      try {
        const created = await addGroup(cleanGroupName);

        if (created) {
          setGroupName("");
          onClose();
        }
      } catch (error) {
        console.error("CREATE GROUP MODAL ERROR:", error);
      } finally {
        setIsCreating(false);
      }
    },
    [addGroup, canCreate, cleanGroupName, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
            fixed inset-0 z-[200]
            flex items-center justify-center
            bg-overlay-soft
            backdrop-blur-[3px]
            p-6
          "
          initial={MODAL_BACKDROP_INITIAL}
          animate={MODAL_BACKDROP_ANIMATE}
          exit={MODAL_BACKDROP_EXIT}
          onClick={handleClose}
        >
          <motion.div
            initial={MODAL_CONTENT_INITIAL}
            animate={MODAL_CONTENT_ANIMATE}
            exit={MODAL_CONTENT_EXIT}
            transition={MODAL_CONTENT_TRANSITION}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full
              max-w-[520px]
              rounded-2xl
              border border-border-default
              bg-surface
              shadow-[0_24px_70px_rgba(0,0,0,0.16)]
              overflow-hidden
            "
          >
            {/* Header */}
            <div
              className="
                flex items-center justify-between
                px-5 py-4
                border-b border-border-default
              "
            >
              <div>
                <h2 className="text-[17px] font-medium text-text-primary">
                  Create Group
                </h2>

                <p className="text-xs text-text-muted mt-1">
                  Create a group to organize your notes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  text-text-secondary
                  hover:text-text-primary
                  hover:bg-surface-hover
                  transition-colors
                  disabled:opacity-40
                "
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-5">
                <label
                  htmlFor="create-group-name"
                  className="block text-xs font-medium text-text-secondary mb-2"
                >
                  Group name
                </label>

                <div
                  className="
                    flex items-center gap-2
                    h-11
                    px-3
                    rounded-xl
                    border border-border-default
                    bg-surface
                    focus-within:border-border-focus
                    transition-colors
                  "
                >
                  <Folder className="w-4 h-4 text-icon-secondary shrink-0" />

                  <input
                    id="create-group-name"
                    autoFocus
                    type="text"
                    value={groupName}
                    onChange={handleGroupNameChange}
                    placeholder={t("e.g. Work, Personal, Travel")}
                    disabled={isCreating}
                    className="
                      flex-1
                      min-w-0
                      bg-transparent
                      text-sm
                      text-text-primary
                      outline-none
                      placeholder:text-text-muted
                    "
                  />
                </div>

                <div
                  className="
                    mt-4
                    flex items-start gap-3
                    rounded-xl
                    bg-surface-subtle
                    px-4 py-3.5
                  "
                >
                  <div className="text-icon-secondary mt-0.5">
                    <Folder className="w-4 h-4" />
                  </div>

                  <p className="text-xs leading-5 text-text-secondary">
                    Groups help you organize related notes in one place.
                    You can move notes between groups anytime.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                className="
                  flex items-center justify-end gap-2
                  px-5 py-4
                  border-t border-border-default
                "
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="
                    h-10
                    px-4
                    rounded-xl
                    text-sm
                    font-medium
                    text-text-secondary
                    hover:bg-surface-hover
                    transition-colors
                    disabled:opacity-40
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!canCreate}
                  className={`
                    h-10
                    min-w-[120px]
                    px-4
                    rounded-xl
                    text-sm
                    font-medium
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition-all
                    ${
                      canCreate
                        ? "bg-action-primary text-action-on-primary hover:bg-action-primary-hover"
                        : "bg-action-disabled text-action-on-primary cursor-not-allowed"
                    }
                  `}
                >
                  {isCreating ? (
                    <>
                      <motion.span
                        animate={LOADER_ANIMATION}
                        transition={LOADER_TRANSITION}
                        className="inline-block"
                      >
                        ◌
                      </motion.span>

                      Creating...
                    </>
                  ) : (
                    "Create group"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(CreateGroupModal);
