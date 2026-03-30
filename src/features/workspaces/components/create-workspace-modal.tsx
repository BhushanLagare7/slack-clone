import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useCreateWorkspace } from "../api/use-create-workspace";
import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {
  const router = useRouter();
  const [openCreateWorkspaceModal, setOpenCreateWorkspaceModal] =
    useCreateWorkspaceModal();
  const [name, setName] = useState("");

  const { mutate, isPending } = useCreateWorkspace();

  const handleClose = () => {
    setOpenCreateWorkspaceModal(false);
    setName("");
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      { name },
      {
        onSuccess: (id) => {
          toast.success("Workspace created successfully");
          router.push(`/workspace/${id}`);
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog open={openCreateWorkspaceModal} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            autoFocus
            disabled={isPending}
            minLength={3}
            placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
