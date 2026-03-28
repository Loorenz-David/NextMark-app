import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { PlusIcon } from "@/assets/icons";
import { StateCard } from "@/shared/layout/StateCard";
import { FloatingPopover } from "@/shared/popups/FloatingPopover/FloatingPopover";

import type { RouteGroupRailItem } from "./types";
import { RouteGroupRailPopoverContent } from "./RouteGroupRailPopoverContent";

type RouteGroupRailAvatarProps = {
  item: RouteGroupRailItem;
  onClick: (item: RouteGroupRailItem) => void;
  isDropTarget?: boolean;
};

export const RouteGroupRailAvatar = ({
  item,
  onClick,
  isDropTarget = false,
}: RouteGroupRailAvatarProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const completionRatio = Math.round(item.completionRatio);
  const progressStyle = {
    background: `conic-gradient(rgba(172,228,244,0.92) ${completionRatio}%, rgba(172,228,244,0.14) ${completionRatio}% 100%)`,
  };

  const avatarButton = (
    <button
      type="button"
      className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-light-blue-r),0.55)] ${
        item.isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
      }`}
      onClick={() => onClick(item)}
      onMouseEnter={() => setIsPopoverOpen(true)}
      onMouseLeave={() => setIsPopoverOpen(false)}
      onFocus={() => setIsPopoverOpen(true)}
      onBlur={() => setIsPopoverOpen(false)}
    >
      <span className="relative flex h-12 w-12 items-center justify-center">
        <motion.span
          aria-hidden="true"
          animate={
            isDropTarget
              ? {
                  scale: 1.12,
                  boxShadow: "0px 0px 0px 6px rgba(0,197,49,0.20)",
                }
              : {
                  scale: 1,
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px rgba(29,74,102,0.14)",
                }
          }
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          className={`flex h-12 w-12 items-center justify-center rounded-full border p-[3px] ${
            isDropTarget
              ? "border-[#00c531]"
              : item.isActive
                ? "border-[rgb(var(--color-light-blue-r),0.58)]"
                : "border-[rgb(var(--color-light-blue-r),0.22)]"
          }`}
          style={
            isDropTarget
              ? {
                  backgroundColor: "#00c5311A",
                }
              : progressStyle
          }
        />
        <span className="pointer-events-none absolute flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[rgba(11,21,24,0.92)] text-[11px] font-semibold text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <AnimatePresence mode="wait" initial={false}>
            {isDropTarget ? (
              <motion.span
                key="plus"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1.08, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                <PlusIcon
                  className="h-4 w-4"
                  style={{ color: "#00c531" }}
                />
              </motion.span>
            ) : (
              <motion.span
                key="progress"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {completionRatio}%
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
      <span
        className={`line-clamp-2 text-xs font-medium leading-4 ${
          item.isActive
            ? "text-[var(--color-text)]"
            : "text-[var(--color-text)]/80"
        }`}
      >
        {item.label}
      </span>
      {item.stateLabel ? (
        <StateCard
          label={item.stateLabel}
          color={item.stateColor}
          style={{ transform: "scale(0.92)" }}
        />
      ) : null}
    </button>
  );

  return (
    <FloatingPopover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      reference={avatarButton}
      placement="right"
      offSetNum={10}
      renderInPortal={true}
      classes="w-full !flex-none"
      floatingClassName="z-[220]"
    >
      <div
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
      >
        <RouteGroupRailPopoverContent item={item} />
      </div>
    </FloatingPopover>
  );
};
