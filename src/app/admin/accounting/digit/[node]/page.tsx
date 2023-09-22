import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import prisma from "@rms/prisma/prisma";
import DigitTable from "@rms/widgets/table/digit-table";
import React from "react";

type CommonNode = "two" | "three" | "more";
const CommonNode = ["two", "three", "more"];

export default async function page(props: {
  params: { node: CommonNode };
  searchParams: {};
}) {
  if (CommonNode.filter((res) => res === props.params.node).length === 0)
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  var {
    two,
    three,
    more,
  }: {
    two?: Prisma.Two_DigitGetPayload<{}>[];
    three?: Prisma.Three_DigitGetPayload<{}>[];
    more?: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  } = {};

  switch (props.params.node) {
    case "two":
      two = await prisma.two_Digit.findMany({
        where: { status: "Enable" },
        orderBy: { modified_date: "desc" },
      });
      break;

    case "three":
      three = await prisma.three_Digit.findMany({
        where: { status: "Enable" },
        include: { two_digit: true },
        orderBy: { modified_date: "desc" },
      });
      break;
    case "more":
      more = await prisma.more_Than_Four_Digit.findMany({
        where: { status: "Enable" },
        include: { three_digit: true },
        orderBy: { modified_date: "desc" },
      });

      break;
    default:
      break;
  }
  return <DigitTable value={{ two, three, more }} node={props.params.node} />;
}
