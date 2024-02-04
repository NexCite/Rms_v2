import { Prisma } from "@prisma/client";

export default interface IConfig extends Prisma.ConfigGetPayload<{}> {}
