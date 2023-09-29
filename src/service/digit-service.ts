"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import prisma from "@rms/prisma/prisma";

export async function createTwoDigit(props: Prisma.Two_DigitCreateInput) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      await prisma.two_Digit.create({ data: props });
      return;
    },
    "Add_Two_Digit",
    true
  );
}

export async function updateTwoDigit(
  id: number,
  props: Prisma.Two_DigitUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      props.modified_date = new Date();
      await prisma.two_Digit.update({ data: props, where: { id: id } });
      return;
    },
    "Edit_Two_Digit",
    true
  );
}
export async function deleteTwoDigit(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.two_Digit.delete({ where: { id: id } });
      else
        await prisma.two_Digit.update({
          where: { id: id },
          data: { status: "Disable", user_id: auth.id },
        });
    },
    "Delete_Two_Digit",
    true
  );
}

export async function createThreeDigit(
  props: Prisma.Three_DigitUncheckedCreateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;

      await prisma.three_Digit.create({ data: props });
      return;
    },
    "Add_Three_Digit",
    true
  );
}

export async function updateThreeDigit(
  id: number,
  props: Prisma.Three_DigitUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      props.modified_date = new Date();
      delete props.more_than_four_digit;
      await prisma.three_Digit.update({ data: props, where: { id: id } });
      return;
    },
    "Edit_Three_Digit",
    true
  );
}
export async function deleteThreeDigit(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.three_Digit.delete({ where: { id: id } });
      else
        await prisma.three_Digit.update({
          where: { id: id },
          data: { status: "Deleted", user_id: auth.id },
        });
    },
    "Edit_Three_Digit",
    true
  );
}
export async function createMoreDigit(
  props: Prisma.More_Than_Four_DigitUncheckedCreateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;

      await prisma.more_Than_Four_Digit.create({ data: props });
      return;
    },
    "Add_More_Than_Four_Digit",
    true
  );
}

export async function updateMoreDigit(
  id: number,
  props: Prisma.More_Than_Four_DigitUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      props.modified_date = new Date();
      await prisma.more_Than_Four_Digit.update({
        data: props,
        where: { id: id },
      });
      return;
    },
    "Edit_More_Than_Four_Digit",
    true
  );
}
export async function deleteMoreDigit(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.more_Than_Four_Digit.delete({ where: { id: id } });
      else
        await prisma.more_Than_Four_Digit.update({
          where: { id: id },
          data: { status: "Disable", user_id: auth.id },
        });
    },
    "Delete_More_Than_Four_Digit",
    true
  );
}
