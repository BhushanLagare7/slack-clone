import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useChannelId } from "@/hooks/use-channel-id";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel?",
    "You are about to delete this channel. This action cannot be undone.",
  );

  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  const handleEditOpen = (open: boolean) => {
    if (member?.role !== "admin") {
      toast.error("You are not authorized to edit this channel");
      return;
    }
    setEditOpen(open);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      {
        id: channelId,
        name: value,
        workspaceId,
      },
      {
        onSuccess: () => {
          toast.success("Channel updated successfully");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update channel");
        },
      },
    );
  };

  const handleRemoveChannel = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel removed successfully");
          router.replace(`/workspace/${workspaceId}`);
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to remove channel");
        },
      },
    );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="overflow-hidden px-2 w-auto text-lg font-semibold"
            size="sm"
            variant="ghost"
          >
            <span className="truncate"># {title}</span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-hidden p-0 bg-gray-50">
          <DialogHeader className="p-4 bg-white border-b">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-y-2 px-4 pb-4">
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">Channel name</p>
                    {member?.role === "admin" && (
                      <p className="text-sm text-[#1264A3] hover:underline font-semibold">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename channel</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input
                    autoFocus
                    disabled={isUpdatingChannel}
                    maxLength={80}
                    minLength={3}
                    placeholder="e.g. plan-budget"
                    required
                    value={value}
                    onChange={handleChange}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button disabled={isUpdatingChannel} variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingChannel} type="submit">
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {member?.role === "admin" && (
              <button
                className="flex gap-x-2 items-center px-5 py-4 text-rose-600 bg-white rounded-lg border cursor-pointer hover:bg-gray-50"
                disabled={isRemovingChannel}
                onClick={handleRemoveChannel}
              >
                <TrashIcon className="size-4" />
                <p className="text-sm font-semibold">Delete channel</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
