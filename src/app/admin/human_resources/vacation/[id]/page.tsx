import React from "react";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getConfigId } from "@rms/lib/config";
import BackButton from "@rms/components/ui/back-button";
import VacationView from "@rms/widgets/view/vacation-view";

export default async function page(props: { params: { id: string } }) {
  if (props.params.id && !Number.isInteger(+props.params.id)) {
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  }
  {
    const config_id = await getConfigId();

    var value: Prisma.VacationGetPayload<{
      include: { media: true; employee: true };
    }> = await prisma.vacation.findUnique({
      where: {
        id: +props.params.id,
        config_id,
      },
      include: {
        media: true,
        employee: true,
      },
    });

    console.log(value);

    return (
      <>
        <VacationView value={value} />
      </>
    );
  }
}
