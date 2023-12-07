import { ThemeProvider } from "@rms/components/theme/theme-provider";
import "./globals.css";

import { env } from "process";

import { AlertProvider } from "@rms/hooks/toast-hook";
import { headers } from "next/headers";
import { Metadata } from "next";

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
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="ligth"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute bottom-1 right-10 z-20    text-black">
            <h1 className="text-black">version {v}</h1>
          </div>

          {children}
          <AlertProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
