"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedFilterFields } from "@/features/feed/components/feed-filters";

export function FeedFiltersSheet({ channels }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] border-border bg-[#1a1a22] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feed filters</DialogTitle>
          </DialogHeader>
          <FeedFilterFields channels={channels} />
          <Button type="button" variant="primary" onClick={() => setOpen(false)}>
            Apply filters
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
