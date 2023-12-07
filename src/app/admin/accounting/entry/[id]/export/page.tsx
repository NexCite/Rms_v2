import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import { getConfig } from "@rms/service/config-service";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import MainExport from "@rms/widgets/export/main-export";
import { notFound } from "next/navigation";
import React from "react";

export default async function page(props: {
  params: {
    id: string;
  };
  searchParams: {
    id: string;
  };
}) {
  const config_id = await getConfigId();

  const auth = await getUserFullInfo();

  const entry = await prisma.entry.findFirst({
    where: {
      config_id,
      id: +props.params.id,
      status: await getUserStatus(),
    },
    include: {
      currency: true,
      sub_entries: {
        include: {
          account_entry: true,
          entry: true,
          two_digit: true,

          three_digit: true,
          more_than_four_digit: true,
        },
      },
    },
  });

  if (!entry) {
    return notFound();
  }
  return (
    <MainExport
      user={{
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
      }}
      entry={entry as any}
      config={auth.config}
    />
  );
}
