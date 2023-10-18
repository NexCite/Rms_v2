"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { useServerInsertedHTML } from "next/navigation";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const theme = createTheme({
    components: {},
    palette: {
      background: {
        default: "rgb(255 255 255 / var(--tw-text-opacity)) !important",
      },

      primary: {
        main: "rgb(255 255 255 / var(--tw-text-opacity)) !important",
      },
    },
  });

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
        <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
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
