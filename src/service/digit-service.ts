"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import prisma from "@rms/prisma/prisma";

/**
 *
 * Done
 *
 */
export async function createTwoDigit(
  props: Prisma.Two_DigitUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      await prisma.two_Digit.create({ data: props });
      return;
    },
    "Add_Two_Digit",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function updateTwoDigit(
  id: number,
  props: Prisma.Two_DigitUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      props.modified_date = new Date();
      await prisma.two_Digit.update({
        data: props,
        where: { id: id, config_id },
      });
      return;
    },
    "Edit_Two_Digit",
    true,
    props
  );
}
/**
 *
 * Done
 *
 */
export async function deleteTwoDigit(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.two_Digit.delete({ where: { id: id, config_id } });
    },
    "Delete_Two_Digit",
    true,
    { id }
  );
}

/**
 *
 * Done
 *
 */
export async function createThreeDigit(
  props: Prisma.Three_DigitUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      await prisma.three_Digit.create({ data: props });
      return;
    },
    "Add_Three_Digit",
    true,
    props
  );
}
/**
 *
 * Done
 *
 */

export async function updateThreeDigit(
  id: number,
  props: Prisma.Three_DigitUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      await prisma.three_Digit.update({
        data: props,
        where: { id: id, config_id },
      });
      return;
    },
    "Edit_Three_Digit",
    true,
    props
  );
}
/**
 *
 * Done
 *
 */
export async function deleteThreeDigit(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.three_Digit.delete({ where: { id: id, config_id } });
    },
    "Edit_Three_Digit",
    true,
    { id }
  );
}
/**
 *
 * Done
 *
 */
export async function createMoreDigit(
  props: Prisma.More_Than_Four_DigitUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      await prisma.more_Than_Four_Digit.create({ data: props });
      return;
    },
    "Add_More_Than_Four_Digit",
    true,
    props
  );
}
/**
 *
 * Done
 *
 */

export async function updateMoreDigit(
  id: number,
  props: Prisma.More_Than_Four_DigitUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;
      await prisma.more_Than_Four_Digit.update({
        data: props,
        where: { id: id, config_id },
      });
      return;
    },
    "Edit_More_Than_Four_Digit",
    true,
    props
  );
}
/**
 *
 * Done
 *
 */
export async function deleteMoreDigit(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.more_Than_Four_Digit.delete({
        where: { id: id, config_id },
      });
    },
    "Delete_More_Than_Four_Digit",
    true,
    { id }
  );
}
export async function resetDigit(id: number, node: "two" | "three" | "more") {
  return handlerServiceAction(
    async (info, config_id) => {
      await (
        prisma[
          node === "two"
            ? "two_Digit"
            : node === "three"
            ? "three_Digit"
            : "more_Than_Four_Digit"
        ] as any
      ).update({
        where: { id: id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}
