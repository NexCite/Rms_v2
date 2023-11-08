import { ThemeProvider } from "@rms/components/theme/theme-provider";
import "./globals.css";

import { env } from "process";
import NextTopLoader from "nextjs-toploader";
import prisma from "@rms/prisma/prisma";
import { AlertProvider } from "@rms/hooks/toast-hook";
import { getConfigId } from "@rms/lib/config";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config_id = await getConfigId();
  var logo = "/logo.png";

  if (config_id) {
    var result = await prisma.config.findUnique({ where: { id: config_id } });
    if (result) {
      logo = result.logo;
    }
  }

  const v = env.vesrion;

  return (
    <html
      lang="en"
      suppressContentEditableWarning={true}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="icon" href={logo} />
        <title>Rms System</title>
      </head>
      <body>
        <NextTopLoader showSpinner={false} color="#090808" />

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
