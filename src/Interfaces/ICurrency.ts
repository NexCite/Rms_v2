import { Prisma } from "@prisma/client";

export default interface ICurrency extends Prisma.CurrencyGetPayload<{}> {}
