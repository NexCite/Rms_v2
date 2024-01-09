// Toast.tsx

"use client";
import { Alert } from "@mui/joy";
import Snackbar from "@mui/material/Snackbar";
import HttpStatusCode from "@rms/models/HttpStatusCode";
import React from "react";
import { create } from "zustand";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
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

const useToast = create<State & Actions>((set, value) => ({
  OpenAlert(args) {
    set({ ...args, open: true });
  },
  CloseAlert() {
    set({ open: false });
  },
}));

const AlertProvider: React.FC = () => {
  const store = useToast((state) => state);

  return (
    <Snackbar
      open={store.open ? true : false}
      autoHideDuration={6000}
      anchorOrigin={{ horizontal: "right", vertical: "top" }}
      onClose={store.CloseAlert}
    >
      <Alert
        variant="soft"
        startDecorator={store?.status === 200 ? <InfoIcon /> : <WarningIcon />}
        color={store?.status === 200 ? "primary" : "danger"}
      >
        <div
          className="text-lg"
          dangerouslySetInnerHTML={{
            __html: store.message,
          }}
        ></div>
      </Alert>
    </Snackbar>
  );
};
export { AlertProvider, useToast };
