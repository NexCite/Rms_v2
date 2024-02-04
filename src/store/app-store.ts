"use client";
import AppStoreModel from "@nexcite/models/AppStoreMoodel";
import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
const appStore = createStore();
const appStorage = atomWithStorage<AppStoreModel>("appStore", {});

appStore.set(appStorage, {});
export default appStore;
export { appStorage };
