import {
  MessageSquareTextIcon,
  PencilIcon,
  SmileIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "./ui/button";
import { EmojiPopover } from "./emoji-popover";
import { Hint } from "./hint";

interface ToolbarProps {
  handleDelete: () => void;
  handleEdit: () => void;
  handleReaction: (value: string) => void;
  handleThread: () => void;
  hideThreadButton?: boolean;
  isAuthor: boolean;
  isPending: boolean;
}

export const Toolbar = ({
  handleDelete,
  handleEdit,
  handleReaction,
  handleThread,
  hideThreadButton,
  isAuthor,
  isPending,
}: ToolbarProps) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="bg-white rounded-md border shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button disabled={isPending} size="icon-sm" variant="ghost">
            <SmileIcon className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              disabled={isPending}
              size="icon-sm"
              variant="ghost"
              onClick={handleThread}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <Hint label="Edit message">
            <Button
              disabled={isPending}
              size="icon-sm"
              variant="ghost"
              onClick={handleEdit}
            >
              <PencilIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <Hint label="Delete message">
            <Button
              disabled={isPending}
              size="icon-sm"
              variant="ghost"
              onClick={handleDelete}
            >
              <TrashIcon className="size-4" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );
};
