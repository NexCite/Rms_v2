import "./globals.css";

import { AlertProvider } from "@nexcite/hooks/toast-hook";
import { Metadata } from "next";
import { headers } from "next/headers";

import PageLoader from "@nexcite/components/other/PageLoader";
import procces from "process";
export async function generateMetadata({ params }): Promise<Metadata> {
  var reqUrl = headers().get("url") || headers().get("host");

  const url = new URL(isIpAddress(reqUrl) ? "http://" + reqUrl : reqUrl);
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
function isIpAddress(input: string) {
  var ipWithPortRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+$/;

  return ipWithPortRegex.test(input);
}
