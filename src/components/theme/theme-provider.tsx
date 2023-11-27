"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { useServerInsertedHTML } from "next/navigation";
import { Next13ProgressBar } from "next13-progressbar";

import { ProgressLoader } from "nextjs-progressloader";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [styledComponentsStyleSheet] = React.useState(
    () => new ServerStyleSheet()
  );

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });
  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      <NextThemesProvider {...props}>
        <>
          {children}
          <Next13ProgressBar
            height="3px"
            style=""
            color="black"
            options={{ showSpinner: false }}
            showOnShallow
          />
        </>
      </NextThemesProvider>
    </StyleSheetManager>
  );
}
declare module "@mui/material/styles" {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}
