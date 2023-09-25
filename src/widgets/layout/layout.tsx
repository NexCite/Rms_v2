"use client";
import RouteModel from "@rms/models/RouteModel";

import React, { useCallback, useRef } from "react";
import { ThemeProvider } from "@material-tailwind/react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [scrollRef]);

  return (
    <ThemeProvider>
      <AppBar routes={props.route} config={props.config}>
        <main className="w-full">
          <div className="p-3" ref={scrollRef}>
            {props.children}
          </div>
        </main>
      </AppBar>
    </ThemeProvider>
  );
}
