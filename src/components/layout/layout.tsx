"use client";
import RouteModel from "@rms/models/RouteModel";

import React, { useCallback, useRef } from "react";

import AppBar from "./app-bar";

interface Props {
  route: RouteModel[];
  children: React.ReactNode;
  config: {
    logo: string;
    name: string;
  };
}
export default function Layout(props: Props) {
  return (
    <AppBar routes={props.route} config={props.config}>
      <main className="w-full">
        <div className="p-3">{props.children}</div>
      </main>
    </AppBar>
  );
}
