import "./globals.css";

import { AlertProvider } from "@rms/hooks/toast-hook";
import { Metadata } from "next";
import { headers } from "next/headers";

import PageLoader from "@rms/components/other/page-loader";
import procces from "process";
export async function generateMetadata({ params }): Promise<Metadata> {
  var reqUrl = headers().get("url") || headers().get("host");

  const url = new URL(isIpAddress(reqUrl) ? "http://" + reqUrl : reqUrl);
  url.pathname = `/logo.png`;
  console.log(url);
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
  // Regular expression to match an IPv4 address
  var ipWithPortRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+$/;

  // Check if the input matches the IPv4 regex
  return ipWithPortRegex.test(input);
}
