import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface InviteModalProps {
  joinCode: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteModal = ({
  joinCode,
  name,
  open,
  onOpenChange,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will generate a new join code and deactivate the previous one.",
  );

  const { mutate: newJoinCode, isPending } = useNewJoinCode();

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast.success("Invite link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy invite link");
      });
  };

  const handleNewCode = async () => {
    const ok = await confirm();
    if (!ok) return;

    newJoinCode(
      { workspaceId },
      {
        onSuccess: () => {
          toast.success("New join code regenerated");
        },
        onError: () => {
          toast.error("Failed to regenerate join code");
        },
      },
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite people to {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4 items-center justify-center py-10">
            <p className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </p>
            <Button size="sm" variant="ghost" onClick={handleCopy}>
              Copy Link <CopyIcon className="size-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              variant="outline"
              onClick={handleNewCode}
            >
              New code
              <RefreshCcwIcon className="size-4 ml-2" />
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
