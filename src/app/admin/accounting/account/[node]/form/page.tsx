import { $Enums, Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";

import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import Account_EntryForm from "@rms/widgets/form/account-entry-form";

import React from "react";

export default async function page(props: {
  params: { node: $Enums.Account_Entry_Type };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

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
    value = await prisma.account_Entry.findFirst({
      where: { config_id, id },
      include: {
        more_than_four_digit: { include: { three_digit: true } },
        three_digit: { include: { two_digit: true } },
        two_digit: {},
      },
    });
  }
  const two_digit = await prisma.two_Digit.findMany({
    where: { config_id, status: await getUserStatus() },
    include: { three_digit: true },
  });
  const three_digit = await prisma.three_Digit.findMany({
    where: { config_id, status: await getUserStatus() },
    include: { two_digit: true },
  });
  const more_digit = await prisma.more_Than_Four_Digit.findMany({
    where: { config_id, status: await getUserStatus() },
    include: { three_digit: true },
  });

  return (
    <>
      <Account_EntryForm
        node={props.params.node}
        account={value}
        three_digit={three_digit}
        more_digit={more_digit}
        two_digit={two_digit}
      />
    </>
  );
}
