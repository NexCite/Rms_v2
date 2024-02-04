import { Prisma } from "@prisma/client";

export default interface IResources extends Prisma.ResourcesGetPayload<{}> {}
