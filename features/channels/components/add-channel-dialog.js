"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FieldError } from "@/components/shared/field-error";
import { FormError } from "@/components/shared/form-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addChannelInputSchema } from "@/features/channels/schemas";
import { AddChannelDialogStep } from "@/features/channels/components/add-channel-dialog-step";
import { ChannelPreviewCard } from "@/features/channels/components/channel-preview-card";
import { useAddChannelMutation } from "@/features/channels/hooks/use-add-channel-mutation";
import { applyChannelMutationError } from "@/features/channels/hooks/apply-channel-mutation-error";
import { usePreviewChannelMutation } from "@/features/channels/hooks/use-preview-channel-mutation";
import { useUiStore } from "@/stores/ui-store";

export function AddChannelDialog() {
  const isOpen = useUiStore((state) => state.isAddChannelDialogOpen);
  const closeAddChannelDialog = useUiStore((state) => state.closeAddChannelDialog);
  const [step, setStep] = useState(AddChannelDialogStep.Input);
  const [formError, setFormError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addChannelInputSchema),
    defaultValues: {
      input: "",
    },
  });

  const {
    previewChannel,
    isPending: isPreviewPending,
    reset: resetPreviewMutation,
  } = usePreviewChannelMutation();

  const {
    addChannel,
    isPending: isAddPending,
    reset: resetAddMutation,
  } = useAddChannelMutation();

  function resetDialogState() {
    setStep(AddChannelDialogStep.Input);
    setFormError("");
    setConfirmError("");
    setPreview(null);
    reset({ input: "" });
    resetPreviewMutation();
    resetAddMutation();
  }

  function handleOpenChange(open) {
    if (!open) {
      closeAddChannelDialog();
      resetDialogState();
    }
  }

  async function handlePreviewSubmit(data) {
    setFormError("");
    setConfirmError("");

    try {
      const result = await previewChannel(data);
      setPreview(result.preview);
      setStep(AddChannelDialogStep.Confirm);
    } catch (error) {
      setFormError(applyChannelMutationError(error, setError));
    }
  }

  function handleBack() {
    setConfirmError("");
    resetAddMutation();
    setPreview(null);
    setStep(AddChannelDialogStep.Input);
    reset({ input: getValues("input") });
  }

  async function handleConfirmAdd() {
    if (!preview) {
      return;
    }

    setConfirmError("");

    try {
      await addChannel(preview);
      resetDialogState();
    } catch (error) {
      setConfirmError(
        error?.message ?? "Something went wrong. Please try again.",
      );
    }
  }

  const isBusy = isPreviewPending || isAddPending || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent aria-label="Add a channel">
        {step === AddChannelDialogStep.Input ? (
          <>
            <DialogHeader>
              <p className="text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
                Step 1 of 2
              </p>
              <DialogTitle>Add a channel</DialogTitle>
              <DialogDescription>
                Enter a YouTube handle such as @Fireship or a supported channel
                URL.
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={handleSubmit(handlePreviewSubmit)}
              noValidate
            >
              <div className="grid gap-2">
                <Label htmlFor="add-channel-input">Channel handle or URL</Label>
                <Input
                  id="add-channel-input"
                  placeholder="@Fireship or https://www.youtube.com/channel/UC..."
                  aria-invalid={Boolean(errors.input)}
                  disabled={isBusy}
                  {...register("input")}
                />
                <FieldError message={errors.input?.message} />
              </div>

              {formError ? <FormError message={formError} /> : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isBusy}>
                  {isPreviewPending ? "Loading preview…" : "Preview channel"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <p className="text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
                Step 2 of 2
              </p>
              <DialogTitle>Is this the right channel?</DialogTitle>
              <DialogDescription>
                We found this channel from the identifier you entered. Confirm
                to add it to your library.
              </DialogDescription>
            </DialogHeader>

            <ChannelPreviewCard preview={preview} />

            {confirmError ? <FormError message={confirmError} /> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={isBusy}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmAdd}
                disabled={isBusy}
              >
                {isAddPending ? "Adding channel…" : "Add channel"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
