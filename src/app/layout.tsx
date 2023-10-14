import { ThemeProvider } from "@rms/components/theme/theme-provider";
import "./globals.css";
import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import { env } from "process";
import NextTopLoader from "nextjs-toploader";
import prisma from "@rms/prisma/prisma";
import { AlertProvider } from "@rms/hooks/toast-hook";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  var result = await prisma.config.findFirst({});

  const v = env.vesrion;

  return (
    <html
      lang="en"
      suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="icon" href={`/api/media/${result?.logo}?v=${env.v}`} />
        <title>{result ? result.name : "Setup"}</title>
      </head>
      <body className={inter.className}>
        <NextTopLoader showSpinner={false} color="#090808" />

        <ThemeProvider
          attribute="class"
          defaultTheme="ligth"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute bottom-0 right-5 z-20">
            <h1>version {v}</h1>
          </div>

          {children}
          <AlertProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
