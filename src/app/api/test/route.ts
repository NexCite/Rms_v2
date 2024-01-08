import prisma from "@rms/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  await prisma.voucherItem.deleteMany({});
  await prisma.voucher.deleteMany({});

  // const result = await prisma.voucher.findMany({});
  // const resultT = await prisma.voucherItem.findMany({ take: 2 });
  // const t = result[0];
  // delete t.id;

  // var te = Array.from({ length: 10000 }).map((res, index) => {
  //   result.forEach((res) => {
  //     delete res.id;
  //   });
  //   return res;
  // });
  // for (let index = 0; index < te.length; index++) {
  //   const m = await prisma.voucher.create({ data: t });
  //   await prisma.voucherItem.createMany({
  //     data: resultT.map((res) => {
  //       delete res.id;
  //       res.voucher_id = m.id;
  //       return res;
  //     }),
  //   });
  // }

  return NextResponse.json({});
}
