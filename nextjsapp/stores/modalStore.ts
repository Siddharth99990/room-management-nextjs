import { create } from 'zustand';
import React from 'react';

interface PasswordModalState {
  isChangePasswordOpen: boolean;
  openChangePassword: () => void;
  closeChangePassword: () => void;
}

interface BookingModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

// Add this new interface and store
interface ViewBookingModalState {
  isViewBookingOpen: boolean;
  bookingId: number | null;
  openViewBooking: (bookingId: number) => void;
  closeViewBooking: () => void;
}


export const usePasswordModalStore = create<PasswordModalState>((set) => ({
  isChangePasswordOpen: false,
  openChangePassword: () => set({ isChangePasswordOpen: true }),
  closeChangePassword: () => set({ isChangePasswordOpen: false }),
}));

export const useBookingModalStore = create<BookingModalState>((set) => ({
  isOpen: false,
  content: null,
  openModal: (content) => set({ isOpen: true, content }),
  closeModal: () => set({ isOpen: false, content: null }),
}));

// Add this new store export
export const useViewBookingModalStore = create<ViewBookingModalState>((set) => ({
  isViewBookingOpen: false,
  bookingId: null,
  openViewBooking: (bookingId) => set({ isViewBookingOpen: true, bookingId }),
  closeViewBooking: () => set({ isViewBookingOpen: false, bookingId: null }),
}));