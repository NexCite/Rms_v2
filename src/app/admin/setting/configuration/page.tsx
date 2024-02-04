import { Prisma } from "@prisma/client";
import prisma from "@nexcite/prisma/prisma";
import getAuth from "@nexcite/service/user-service";
import { UpdateConfig } from "@nexcite/widgets/config/Config";

export default async function page() {
  const info = await getAuth({ withRedirect: true, withMedia: true });
  var value: Prisma.ConfigGetPayload<{
    select: {
      name: true;
      logo: true;
      email: true;
      phone_number: true;
      media: true;
    };
  }> = await prisma.config.findFirst({
    where: { id: info.config.id },
    select: {
      name: true,
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
    where: { id: info.config.id },
    select: {
      first_name: true,
      last_name: true,
    },
  });

  return (
    <div>
      <UpdateConfig config={info.config as any} />
    </div>
  );
}
