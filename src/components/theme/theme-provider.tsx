"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider as ThemeMaterialTailwindProvider } from "@material-tailwind/react";

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
        <ThemeMaterialTailwindProvider>
          {children}
        </ThemeMaterialTailwindProvider>
      </NextThemesProvider>
    </StyleSheetManager>
  );
}
