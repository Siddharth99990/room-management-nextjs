import { create } from 'zustand';

interface ModalState {
  isChangePasswordOpen: boolean;
  openChangePassword: () => void;
  closeChangePassword: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isChangePasswordOpen: false,
  openChangePassword: () => set({ isChangePasswordOpen: true }),
  closeChangePassword: () => set({ isChangePasswordOpen: false }),
}));