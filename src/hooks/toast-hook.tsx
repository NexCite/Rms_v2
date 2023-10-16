// Toast.tsx

"use client";
import React, { ReactNode, createContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import { Alert, AlertTitle } from "@mui/material";
import { create } from "zustand";

type State = {
  message?: string;
  id?: string;
  loading?: boolean;
  status?: HttpStatusCode;
  replace?: string;
  open?: boolean;
};

type Actions = {
  OpenAlert: (args: State) => void;
  CloseAlert: () => void;
};

const useStore = create<State & Actions>((set, value) => ({
  OpenAlert(args) {
    set({ ...args, open: true });
  },
  CloseAlert() {
    set({ open: false });
  },
}));

const AlertProvider: React.FC = () => {
  const store = useStore((state) => state);

  return (
    <Snackbar
      open={store.open ? true : false}
      autoHideDuration={6000}
      anchorOrigin={{ horizontal: "right", vertical: "top" }}
      onClose={store.CloseAlert}
    >
      <div>
        <Alert
          elevation={5}
          variant="standard"
          onClose={store?.CloseAlert}
          severity={store?.status === 200 ? "info" : "error"}
        >
          <AlertTitle>
            {store?.status === 200
              ? store?.message ?? "Operation Successful"
              : store?.message ?? "Operation Error"}
          </AlertTitle>
        </Alert>
      </div>
    </Snackbar>
  );
};
export { useStore, AlertProvider };
