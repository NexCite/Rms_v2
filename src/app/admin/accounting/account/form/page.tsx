import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";

import prisma from "@rms/prisma/prisma";
import AccountEntryForm from "@rms/widgets/form/account-entry-form";

import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.Account_EntryGetPayload<{
    include: {
      more_than_four_digit: { include: { three_digit: true } };
      three_digit: { include: { two_digit: true } };
      two_digit: {};
    };
  }>;
  if (isEditMode) {
    value = await prisma.account_Entry.findUnique({
      where: { id },
      include: {
        more_than_four_digit: { include: { three_digit: true } },
        three_digit: { include: { two_digit: true } },
        two_digit: {},
      },
    });
  }
  const two_digit = await prisma.two_Digit.findMany({
    where: { status: "Enable" },
    include: { three_digit: true },
  });
  const three_digit = await prisma.three_Digit.findMany({
    where: { status: "Enable" },
    include: { two_digit: true },
  });
  const more_digit = await prisma.more_Than_Four_Digit.findMany({
    where: { status: "Enable" },
    include: { three_digit: true },
  });

  return (
    <>
      <BackButton />
      <AccountEntryForm
        account={value}
        three_digit={three_digit}
        more_digit={more_digit}
        two_digit={two_digit}
      />
    </>
  );
}
