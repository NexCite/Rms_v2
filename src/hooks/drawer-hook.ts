import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State = {
  open?: boolean;
};

type Actions = {
  set: (value: boolean) => void;
};

const useDrawerController = create(
  persist<State & Actions>(
    (set, get) => ({
      data: false,
      set(value) {
        set({ open: value });
      },
    }),
    {
      name: "rms-store-drawer", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage),
      // (optional) by default, 'localStorage' is used
    }
  )
);

export default useDrawerController;
