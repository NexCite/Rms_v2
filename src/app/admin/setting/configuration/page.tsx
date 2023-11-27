import { UpdateConfig } from "@rms/widgets/config/config-widget";
import { getConfigId } from "@rms/lib/config";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page() {
  const config_id = await getConfigId();

  var value: Prisma.ConfigGetPayload<{
    select: {
      name: true;
      username: true;
      logo: true;
      email: true;
      phone_number: true;
      media: true;
    };
  }> = await prisma.config.findFirst({
    where: { id: config_id },
    select: {
      name: true,
      username: true,
      logo: true,
      email: true,
      phone_number: true,
      media: true,
    },
  });

  var user: Prisma.UserGetPayload<{
    select: {
      first_name: true;
      last_name: true;
    };
  }> = await prisma.user.findFirst({
    where: { id: config_id },
    select: {
      first_name: true,
      last_name: true,
    },
  });

  return (
    <div>
      <UpdateConfig config={value} id={config_id} />
    </div>
  );
}
