import "./globals.css";

import { AlertProvider } from "@rms/hooks/toast-hook";
import { Metadata } from "next";
import { headers } from "next/headers";

import PageLoader from "@rms/components/other/page-loader";
import procces from "process";
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
  const v = procces.env.vesrion;

  return (
    <html
      lang="en"
      suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
    >
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        <div className="absolute bottom-1 right-10 z-20    text-black">
          <h1 className="text-black">version {v}</h1>
        </div>
        <PageLoader />
        {children}

        <AlertProvider />
      </body>
    </html>
  );
}
