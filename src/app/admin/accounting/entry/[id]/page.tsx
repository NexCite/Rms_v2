import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import EntryView from "@rms/widgets/view/entry-view";
import React from "react";

export default async function page(props: {
  params: { id: string };
  searchParams: {};
}) {
  var id: number,
    entry: Prisma.EntryGetPayload<{
      include: {
        currency: true;
        media: true;
        sub_entries: true;
        user: true;
      };
    }>;

  if (props.params.id && !Number.isInteger(+props.params.id)) {
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  } else if (props.params.id) {
    id = +props.params.id;
    entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        currency: true,
        media: true,
        sub_entries: {
          include: {
            account_entry: true,
            more_than_four_digit: true,
            three_digit: true,
            two_digit: true,
          },
        },
        user: true,
      },
    });
  }
  return (
    <div>
      <EntryView entry={entry as any} />
    </div>
  );
}
