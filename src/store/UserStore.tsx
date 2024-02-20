"use client";
import IUser from "@nexcite/Interfaces/IUser";
import { createContext, useCallback, useContext, useState } from "react";

type UserStoreState = {
  addUserStore: (user: IUser) => void;
  getUserStore: () => IUser | null;
  deleteUserStore: () => void;
};
const UserStoreContext = createContext<UserStoreState | undefined>(undefined);
export default function UserStoreProvider(props: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<IUser | null>(null);
  const addUserStore = useCallback((user: IUser) => setUser(user), []);
  const getUserStore = useCallback(() => user, [user]);
  const deleteUserStore = useCallback(() => setUser(null), []);
  return (
    <UserStoreContext.Provider
      value={{ addUserStore, getUserStore, deleteUserStore }}
    >
      {props.children}
    </UserStoreContext.Provider>
  );
}
export const useUserStore = () => {
  return useContext(UserStoreContext);
};
