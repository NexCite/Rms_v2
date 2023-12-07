import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State<T> = {
  data?: T;
};
type setDataFunc<T> = (prev: T) => T;

type Actions<T> = {
  setData: (value: T | setDataFunc<T>) => void;
};

function useHistoryStore<T>(key: string, defaultData?: T) {
  return create(
    persist<State<T> & Actions<T>>(
      (set, get) => ({
        data: defaultData,
        setData(value) {
          switch (typeof value) {
            case "string":
              break;
            case "number":
              break;
            case "bigint":
              break;
            case "boolean":
              break;
            case "symbol":
              break;
            case "undefined":
              break;
            case "object":
              set({ ...get(), data: value });
              console.log(value);
              break;
            case "function":
              const newData = (value as (prev: T) => T)(get().data); // or value(prevValue) if you have a 'prevValue'
              set({ ...get(), data: newData });
              break;
            default:
              set({ ...get(), data: undefined });

              break;
          }
        },
      }),
      {
        name: "rms-store-" + key, // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage),
        // (optional) by default, 'localStorage' is used
      }
    )
  );
}

export default useHistoryStore;
