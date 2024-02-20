import "./globals.css";

import { AlertProvider } from "@nexcite/hooks/toast-hook";
import { Metadata } from "next";
import { headers } from "next/headers";

import PageLoader from "@nexcite/components/other/PageLoader";
import procces from "process";
import { Cairo, Montserrat } from "next/font/google";
import UserStoreProvider from "@nexcite/store/UserStore";

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get("x-forwarded-host");
  const proto = headers().get("x-forwarded-proto");
  const url = new URL(`${proto}://${host}`);

  url.pathname = `/logo.png`;

  return {
    title: "Nexcite",
    description: "Nexcite",
    icons: [
      {
        rel: "icon",
        url: "/logo.png",
      },
    ],
  };
}
const cairo = Cairo({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-cairo",
});
const montserrat = Montserrat({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-montserrat",
});
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
      <body className={cairo.variable + " " + montserrat.variable}>
        <div className="absolute bottom-1 right-10 z-20    text-black">
          <h1 className="text-black">version {v}</h1>
        </div>
        <PageLoader />
        <UserStoreProvider>{children}</UserStoreProvider>
        <AlertProvider />
      </body>
    </html>
  );
}
function isIpAddress(input: string) {
  var ipWithPortRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+$/;

  return ipWithPortRegex.test(input);
}
export const dynamic = "force-dynamic";
