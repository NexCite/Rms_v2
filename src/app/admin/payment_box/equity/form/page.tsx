import { Prisma } from "@prisma/client";
import { getConfigId } from "@nexcite/lib/config";
import prisma from "@nexcite/prisma/prisma";
import EquityForm from "@nexcite/widgets/form/equity-form";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;

  var value: Prisma.EquityGetPayload<{
    select: {
      agent_boxes: true;
      manager_boxes: true;
      p_l: true;
      coverage_boxes: true;
      expensive_box: true;
      to_date: true;
      description: true;
      adjustment_boxes: true;
      credit_boxes: true;
    };
  }>;

  var Equities: Prisma.EquityGetPayload<{}>[];

  const config_id = await getConfigId();

  if (isEditMode) {
    value = await prisma.equity.findFirst({
      where: { config_id, id },
      select: {
        agent_boxes: true,
        manager_boxes: true,
        p_l: true,
        coverage_boxes: true,
        expensive_box: true,
        to_date: true,
        description: true,
        adjustment_boxes: true,
        credit_boxes: true,
      },
    });

    Equities = await prisma.equity.findMany({
      where: { config_id, NOT: { id } },
    });
  } else {
    Equities = await prisma.equity.findMany({ where: { config_id } });
  }

  return (
    <>
      <EquityForm
        id={id}
        value={value}
        isEditMode={isEditMode}
        Equities={Equities}
      />
    </>
  );
}
