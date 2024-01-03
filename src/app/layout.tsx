import "./globals.css";

import { env } from "process";
import "@mantine/core/styles.css";

import { AlertProvider } from "@rms/hooks/toast-hook";
import { headers } from "next/headers";
import { Metadata } from "next";
import {
  ColorSchemeScript,
  MantineProvider,
  MantineThemeProvider,
} from "@mantine/core";
import { Provider } from "jotai";
import Providers from "@rms/hooks/jotai-provider";

export async function generateMetadata({ params }): Promise<Metadata> {
  const url = new URL(
    headers().get("url") || headers().get("referer") || headers().get("host")
  );
  url.pathname = `/logo.png`;
  return {
    title: "RMS Systeam",
    icons: [url],
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const v = env.vesrion;

  return (
    <html
      lang="en"
      suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
    >
      <head>
        <meta charSet="UTF-8" />

        <ColorSchemeScript />
      </head>
      <body>
        <div className="absolute bottom-1 right-10 z-20    text-black">
          <h1 className="text-black">version {v}</h1>
        </div>
        <MantineThemeProvider>
          <MantineProvider forceColorScheme="light">
            <Providers>{children}</Providers>
          </MantineProvider>
        </MantineThemeProvider>
        <AlertProvider />
      </body>
    </html>
  );
}
