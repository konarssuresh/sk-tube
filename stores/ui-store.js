import { create } from "zustand";

export const useUiStore = create((set) => ({
  isAddChannelDialogOpen: false,
  openAddChannelDialog: () => set({ isAddChannelDialogOpen: true }),
  closeAddChannelDialog: () => set({ isAddChannelDialogOpen: false }),
}));
