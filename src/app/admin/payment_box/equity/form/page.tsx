import EquityForm from "@rms/widgets/form/equity-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React, { Suspense } from "react";
import { getConfigId } from "@rms/lib/config";
import getUserFullInfo from "@rms/service/user-service";
import Loading from "@rms/components/ui/loading";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const info = await getUserFullInfo();
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

  if (isEditMode) {
    value = await prisma.equity.findFirst({
      where: { config_id: info.config.id, id },
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
      where: { config_id: info.config.id, NOT: { id } },
    });
  } else {
    Equities = await prisma.equity.findMany({
      where: { config_id: info.config.id },
    });
  }

  return (
    <Suspense fallback={<Loading />}>
      <EquityForm
        id={id}
        value={value}
        isEditMode={isEditMode}
        Equities={Equities}
      />
    </Suspense>
  );
}
