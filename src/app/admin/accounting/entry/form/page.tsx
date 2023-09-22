import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import EntryForm from "@rms/widgets/form/entry-form";
import { notFound } from "next/navigation";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id: string };
}) {
  const user = await getUserInfo();

  var id: number, entry: Prisma.EntryGetPayload<{ include: { media: true } }>;

  if (props.searchParams.id && !Number.isInteger(+props.searchParams.id)) {
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  } else if (props.searchParams.id) {
    id = +props.searchParams.id;
    entry = await prisma.entry.findUnique({
      where: { id: id, status: user.type === "Admin" ? undefined : "Enable" },
      include: {
        media: true,
      },
    });
    if (!entry) {
      return (
        <>
          <BackButton />
          <div>Not Found</div>
        </>
      );
    }
  }

  const three_digit = await prisma.three_Digit.findMany({
    where: {
      status: user.type === "Admin" ? undefined : "Enable",
      two_digit: { status: user.type === "Admin" ? undefined : "Enable" },
    },
    select: {
      two_digit: { select: { name: true, id: true } },
      name: true,
      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const more_than_four_digit = await prisma.more_Than_Four_Digit.findMany({
    where: {
      status: user.type === "Admin" ? undefined : "Enable",
      three_digit: { status: user.type === "Admin" ? undefined : "Enable" },
    },
    select: {
      three_digit: { select: { name: true, id: true } },
      name: true,
      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const two_digits = await prisma.two_Digit.findMany({
    where: { status: user.type === "Admin" ? undefined : "Enable" },

    orderBy: { modified_date: "desc" },
  });
  const account_entry = await prisma.account_Entry.findMany({
    where: { status: user.type === "Admin" ? undefined : "Enable" },
    select: {
      username: true,

      id: true,
    },
    orderBy: { modified_date: "desc" },
  });
  const currencies = await prisma.currency.findMany({
    orderBy: { modified_date: "desc" },
  });

  return (
    <div>
      <BackButton />

      <EntryForm
        id={id}
        isEditMode={id ? true : false}
        entry={entry}
        currencies={currencies}
        three_digit={three_digit}
        account_entry={account_entry}
        more_than_four_digit={more_than_four_digit}
        two_digit={two_digits}
      />
    </div>
  );
}
