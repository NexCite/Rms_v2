import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import MainExport from "@rms/widgets/export/main-export";
import { notFound } from "next/navigation";

export default async function page(props: {
  params: {
    id: string;
  };
  searchParams: {
    id: string;
  };
}) {
  const info = await getUserFullInfo();
  const userStates = getUserStatus(info.user);

  const entry = await prisma.entry.findFirst({
    where: {
      config_id: info.config.id,
      id: +props.params.id,
      status: userStates,
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
        first_name: info.user.first_name,
        last_name: info.user.last_name,
      }}
      entry={entry as any}
      config={info.config}
    />
  );
}
