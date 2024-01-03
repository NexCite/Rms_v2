import { Prisma } from "@prisma/client";

import { getConfigId } from "@rms/lib/config";

import prisma from "@rms/prisma/prisma";
import getUserFullInfo, { getUserStatus } from "@rms/service/user-service";
import DigitForm from "@rms/widgets/form/digit-form";

import React from "react";
type CommonNode = "two" | "three" | "more";

export default async function page(props: {
  params: { node: CommonNode };
  searchParams: { id?: string };
}) {
  const info = await getUserFullInfo();
  const userStates = getUserStatus(info.user);
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
          where: { config_id, id, status: getUserStatus(info.user) },
        });
      }

      break;

    case "three":
      if (isEditMode) {
        value = await prisma.three_Digit.findFirst({
          where: { config_id: info.config.id, id, status: userStates },
          include: {
            more_than_four_digit: true,
          },
        });
      }
      relation = await prisma.two_Digit.findMany({
        where: { config_id: info.config.id, status: userStates },
      });
      break;
    case "more":
      if (isEditMode) {
        value = await prisma.more_Than_Four_Digit.findFirst({
          where: { config_id: info.config.id, id, status: userStates },
          include: {
            three_digit: true,
          },
        });
      }
      relation = await prisma.three_Digit.findMany({
        where: { config_id: info.config.id, status: userStates },
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
