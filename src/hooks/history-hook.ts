import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type State<T> = {
  data?: T;
};
type setDataFunc<T> = (prev: T) => T;

type Actions<T> = {
  set: (value: T | setDataFunc<T>) => void;
};

function useHistoryStore<T>(key: string, defaultData?: T) {
  return create(
    persist<State<T> & Actions<T>>(
      (setState, getState) => ({
        data: defaultData,
        set(value) {
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
              setState({ ...getState(), data: value });

              break;
            case "function":
              const newData = (value as (prev: T) => T)(getState().data); // or value(prevValue) if you have a 'prevValue'
              setState({ data: newData });
              break;
            default:
              setState({ data: undefined });

              break;
          }
        },
      }),
      {
        name: "rms-store-" + key, // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => localStorage),
        skipHydration: false,
        // (optional) by default, 'localStorage' is used
      }
    )
  );
}

export default useHistoryStore;
