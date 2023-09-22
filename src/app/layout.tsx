import { ThemeProvider } from "@rms/components/theme/theme-provider";
import "./globals.css";
import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@rms/components/ui/toaster";
import { env } from "process";
import NextTopLoader from "nextjs-toploader";
import { GlobalStyle } from "@rms/components/theme/global-style";
import prisma from "@rms/prisma/prisma";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(
  c,
  parent: ResolvingMetadata
): Promise<Metadata> {
  var result = await prisma.config.findFirst({});

  if (result) {
    return {
      title: result.name,

      icons: [`/api/media/${result.logo}`],
    };
  }

  return {
    title: "Config",
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const v = env.vesrion;
  return (
    <html lang="en" suppressHydrationWarning>
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
          <Toaster />
          <GlobalStyle> {children}</GlobalStyle>
        </ThemeProvider>
      </body>
    </html>
  );
}
