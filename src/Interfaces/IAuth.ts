import { Prisma } from "@prisma/client";

export default interface IAuth
  extends Prisma.AuthGetPayload<{
    include: typeof AuthInclude;
  }> {}
export const AuthInclude = {
  config: true,
  user: {
    select: {
      first_name: true,
      last_name: true,
      id: true,
      username: true,
      type: true,
      status: true,
      role: true,
    },
  },
};
export type AuthInclude = typeof AuthInclude;
