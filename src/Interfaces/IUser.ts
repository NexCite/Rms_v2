import { Prisma } from "@prisma/client";

export default interface IUser
  extends Prisma.UserGetPayload<{
    include: {
      //   authsSystem: true;
      role: true;
    };
  }> {}
