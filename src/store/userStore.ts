import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      user: {
        name: null,
        email: null,
        role: null,
      },
      setUser: () => set((state: any) => ({ user: state.user })),
      clear: () =>
        set((state: any) => ({
          user: {
            name: null,
            email: null,
            role: null,
          },
        })),
    }),
    {
      name: "user-storage",
    }
  )
);
