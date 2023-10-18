import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getUserInfo } from "@rms/lib/auth";
import { getConfigId } from "@rms/lib/config";

import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import Account_EntryForm from "@rms/widgets/form/account-entry-form";
import DigitForm from "@rms/widgets/form/digit-form";

import React from "react";
type CommonNode = "two" | "three" | "more";

export default async function page(props: {
  params: { node: CommonNode };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value:
    | Prisma.Two_DigitGetPayload<{}>
    | Prisma.Three_DigitGetPayload<{ include: { two_digit: true } }>
    | Prisma.More_Than_Four_DigitGetPayload<{ include: { three_digit: true } }>;
  var relation:
    | Prisma.Two_DigitGetPayload<{}>[]
    | Prisma.Three_DigitGetPayload<{}>[];
  switch (props.params.node) {
    case "two":
      if (isEditMode) {
        value = await prisma.two_Digit.findFirst({
          where: { config_id, id, status: await getUserStatus() },
        });
      }

      break;

    case "three":
      if (isEditMode) {
        value = await prisma.three_Digit.findFirst({
          where: { config_id, id, status: await getUserStatus() },
          include: {
            more_than_four_digit: true,
          },
        });
      }
      relation = await prisma.two_Digit.findMany({
        where: { config_id, status: await getUserStatus() },
      });
      break;
    case "more":
      if (isEditMode) {
        value = await prisma.more_Than_Four_Digit.findFirst({
          where: { config_id, id, status: await getUserStatus() },
          include: {
            three_digit: true,
          },
        });
      }
      relation = await prisma.three_Digit.findMany({
        where: { config_id, status: await getUserStatus() },
        include: {
          two_digit: true,
        },
      });

      break;
    default:
      break;
  }

  return (
    <>
      <DigitForm
        node={props.params.node}
        value={value as any}
        relations={relation as any}
      />
    </>
  );
}
