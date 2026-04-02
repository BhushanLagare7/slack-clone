import { FaCaretDown } from "react-icons/fa";
import { useToggle } from "react-use";

import { PlusIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceSectionProps {
  children: React.ReactNode;
  hint: string;
  label: string;
  onNew?: () => void;
}

export const WorkspaceSection = ({
  children,
  hint,
  label,
  onNew,
}: WorkspaceSectionProps) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="flex flex-col px-2 mt-3">
      <div className="flex items-center px-3.5 group">
        <Button
          className="p-0.5 text-sm text-[#F9EDFFCC] shrink-0 size-6"
          variant="transparent"
          onClick={toggle}
        >
          <FaCaretDown
            className={cn("size-4 transition-transform", !on && "-rotate-90")}
          />
        </Button>
        <Button
          className="group px-1.5 text-sm text-[#F9EDFFCC] h-[28px] justify-start overflow-hidden items-center"
          size="sm"
          variant="transparent"
        >
          <span className="truncate">{label}</span>
        </Button>
        {onNew && (
          <Hint align="center" label={hint} side="top">
            <Button
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-0.5 text-[#F9EDFFCC] size-6 shrink-0"
              size="icon-sm"
              variant="transparent"
              onClick={onNew}
            >
              <PlusIcon className="size-5" />
            </Button>
          </Hint>
        )}
      </div>
      {on && children}
    </div>
  );
};
