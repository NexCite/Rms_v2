import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getUserInfo } from "@rms/lib/auth";

import prisma from "@rms/prisma/prisma";
import AccountEntryForm from "@rms/widgets/form/account-entry-form";
import DigitForm from "@rms/widgets/form/digit-form";

import React from "react";
type CommonNode = "two" | "three" | "more";

export default async function page(props: {
  params: { node: CommonNode };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value:
    | Prisma.Two_DigitGetPayload<{}>
    | Prisma.Three_DigitGetPayload<{ include: { two_digit: true } }>
    | Prisma.More_Than_Four_DigitGetPayload<{ include: { three_digit: true } }>;
  var relation:
    | Prisma.Two_DigitGetPayload<{}>[]
    | Prisma.Three_DigitGetPayload<{}>[];
  const user = await getUserInfo();
  switch (props.params.node) {
    case "two":
      if (isEditMode) {
        value = await prisma.two_Digit.findFirst({
          where: { id, status: user.type === "Admin" ? undefined : "Enable" },
        });
      }

      break;

    case "three":
      if (isEditMode) {
        value = await prisma.three_Digit.findFirst({
          where: { id, status: user.type === "Admin" ? undefined : "Enable" },
          include: {
            more_than_four_digit: true,
          },
        });
      }
      relation = await prisma.two_Digit.findMany({
        where: { status: user.type === "Admin" ? undefined : "Enable" },
      });
      break;
    case "more":
      if (isEditMode) {
        value = await prisma.more_Than_Four_Digit.findFirst({
          where: { id, status: user.type === "Admin" ? undefined : "Enable" },
          include: {
            three_digit: true,
          },
        });
      }
      relation = await prisma.three_Digit.findMany({
        where: { status: user.type === "Admin" ? undefined : "Enable" },
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
      <BackButton />
      <DigitForm
        node={props.params.node}
        value={value as any}
        relations={relation as any}
      />
    </>
  );
}
