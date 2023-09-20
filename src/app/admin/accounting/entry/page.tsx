import React from "react";
import moment from "moment";
import { $Enums, Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { writeFileSync } from "fs";
import Loading from "@rms/components/ui/loading";
import EntryDataTable from "@rms/widgets/table/entry-table";
export default async function Entry(props: {
  params: {};
  searchParams: {
    from_date?: string;
    to_date?: string;

    id?: string;
    two_digit_id?: string;
    three_digit_id?: string;
    more_digit_id?: string;
    account_id?: string;
    debit?: $Enums.EntryType;
    type?: $Enums.DidgitType;
  };
}) {
  var debit: $Enums.EntryType | undefined = undefined,
    type: $Enums.DidgitType | undefined = undefined,
    two_digit_id: number | undefined = undefined,
    id: number | undefined = undefined,
    three_digit_id: number | undefined = undefined,
    more_digit_id: number | undefined = undefined,
    account_id: number | undefined = undefined;

  if ((props.searchParams.type as any) !== "undefined") {
    type = props.searchParams.type;
  }
  if ((props.searchParams.debit as any) !== "undefined") {
    debit = props.searchParams.debit;
  }

  if (!Number.isNaN(+props.searchParams.account_id)) {
    account_id = +props.searchParams.account_id;
  }
  if (!Number.isNaN(+props.searchParams.more_digit_id)) {
    more_digit_id = +props.searchParams.more_digit_id;
  }
  if (!Number.isNaN(+props.searchParams.two_digit_id)) {
    two_digit_id = +props.searchParams.two_digit_id;
  }
  if (!Number.isNaN(+props.searchParams.three_digit_id)) {
    three_digit_id = +props.searchParams.three_digit_id;
  }
  if (!Number.isNaN(+props.searchParams.id)) {
    id = +props.searchParams.id;
  }

  const startDate = parseInt(props.searchParams.from_date);
  const endDate = parseInt(props.searchParams.to_date);

  const date: [Date, Date] = [
    moment(Number.isNaN(startDate) ? undefined : startDate)
      .startOf("day")
      .toDate(),
    moment(Number.isNaN(endDate) ? undefined : endDate)
      .endOf("day")
      .toDate(),
  ];
  const two_digits = await prisma.two_Digit.findMany({
      where: { status: "Enable" },
    }),
    three_digits = await prisma.three_Digit.findMany({
      where: { status: "Enable" },
      include: { two_digit: true },
    }),
    more_digits = await prisma.more_Than_Four_Digit.findMany({
      where: { status: "Enable" },
      include: { three_digit: true },
    }),
    accounts = await prisma.account_Entry.findMany({
      where: { status: "Enable" },
    });

  var entries: Prisma.EntryGetPayload<{
    include: {
      currency: true;

      sub_entries: {
        include: {
          account_entry: true;
          more_than_four_digit: true;
          reference: true;
          three_digit: true;
          two_digit: true;
        };
      };
    };
  }>[] = [];

  if (two_digit_id) {
    entries = await prisma.entry
      .findMany({
        where: {
          id,
          to_date: {
            gte: date[0],
            lte: date[1],
          },
          sub_entries: {
            some: {
              OR: [
                {
                  two_digit_id,
                },
                {
                  three_digit: {
                    two_digit_id,
                  },
                },
                { more_than_four_digit: { three_digit: { two_digit_id } } },
                {
                  account_entry: {
                    OR: [
                      {
                        two_digit_id,
                      },
                      {
                        three_digit: {
                          two_digit_id,
                        },
                      },
                      {
                        more_than_four_digit: {
                          three_digit: {
                            two_digit_id,
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  reference: {
                    OR: [
                      {
                        two_digit_id,
                      },
                      {
                        three_digit: {
                          two_digit_id,
                        },
                      },
                      {
                        more_than_four_digit: {
                          three_digit: {
                            two_digit_id,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          status: "Enable",
        },
        orderBy: {
          to_date: "desc",
        },
        include: {
          currency: true,
          sub_entries: {
            include: {
              account_entry: true,
              more_than_four_digit: true,
              reference: true,
              three_digit: true,
              two_digit: true,
            },
          },
        },
      })
      .then((res) => {
        writeFileSync("t.json", JSON.stringify(res), "utf-8");
        return res;
      });
  } else if (three_digit_id) {
    entries = await prisma.entry
      .findMany({
        where: {
          id,
          to_date: {
            gte: date[0],
            lte: date[1],
          },
          sub_entries: {
            some: {
              OR: [
                {
                  three_digit_id,
                },

                { more_than_four_digit: { three_digit_id } },
                {
                  account_entry: {
                    OR: [
                      {
                        three_digit_id,
                      },
                      {
                        more_than_four_digit: {
                          three_digit_id,
                        },
                      },
                    ],
                  },
                },
                {
                  reference: {
                    OR: [
                      {
                        three_digit_id,
                      },

                      {
                        more_than_four_digit: {
                          three_digit_id,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          status: "Enable",
        },
        orderBy: {
          to_date: "desc",
        },
        include: {
          currency: true,
          sub_entries: {
            include: {
              account_entry: true,
              more_than_four_digit: true,
              reference: true,
              three_digit: true,
              two_digit: true,
            },
          },
        },
      })
      .then((res) => {
        writeFileSync("t.json", JSON.stringify(res), "utf-8");
        return res;
      });
  } else if (more_digit_id) {
    entries = await prisma.entry
      .findMany({
        where: {
          id,
          to_date: {
            gte: date[0],
            lte: date[1],
          },
          sub_entries: {
            some: {
              OR: [
                {
                  more_than_four_digit_id: more_digit_id,
                },

                {
                  account_entry: {
                    more_than_four_digit_id: more_digit_id,
                  },
                },
                {
                  reference: {
                    more_than_four_digit_id: more_digit_id,
                  },
                },
              ],
            },
          },
          status: "Enable",
        },
        orderBy: {
          to_date: "desc",
        },
        include: {
          currency: true,
          sub_entries: {
            include: {
              account_entry: true,
              more_than_four_digit: true,
              reference: true,
              three_digit: true,
              two_digit: true,
            },
          },
        },
      })
      .then((res) => {
        writeFileSync("t.json", JSON.stringify(res), "utf-8");
        return res;
      });
  } else {
    entries = await prisma.entry
      .findMany({
        where: {
          id,
          to_date: {
            gte: date[0],
            lte: date[1],
          },

          status: "Enable",
        },
        orderBy: {
          to_date: "desc",
        },
        include: {
          currency: true,
          sub_entries: {
            include: {
              account_entry: true,
              more_than_four_digit: true,
              reference: true,
              three_digit: true,
              two_digit: true,
            },
          },
        },
      })
      .then((res) => {
        writeFileSync("t.json", JSON.stringify(res), "utf-8");
        return res;
      });
  }
  if (account_id) {
    entries = entries.filter((res) => {
      return (
        res.sub_entries.filter(
          (res) =>
            res.account_entry_id === account_id ||
            res.reference_id === account_id
        ).length > 0
      );
    });
  }

  return (
    <div>
      {/* <EntryTableComponent
        data={entries}
        date={date}
        account_id={account_id}
        debit={debit}
        id={id}
        more_digit_id={more_digit_id}
        three_digit_id={three_digit_id}
        two_digit_id={two_digit_id}
        type={type}
        accounts={accounts}
        more_digits={more_digits}
        three_digits={three_digits}
        two_digits={two_digits}
      /> */}
      <EntryDataTable
        data={entries}
        date={date}
        account_id={account_id}
        debit={debit}
        id={id}
        more_digit_id={more_digit_id}
        three_digit_id={three_digit_id}
        two_digit_id={two_digit_id}
        type={type}
        accounts={accounts}
        more_digits={more_digits}
        three_digits={three_digits}
        two_digits={two_digits}
      />
    </div>
  );
}
