"use server";

import { $Enums, Prisma } from "@prisma/client";
import { FileMapper } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";
import { ActivityStatus } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
const CommonFindInclud = {
  include: {
    currency: true,
    sub_entries: {
      include: {
        three_digit: true,
        two_digit: true,
        account_entry: { include: { currency: true } },
        more_than_four_digit: true,
        reference: { include: { currency: true } },
      },
    },
  },
  orderBy: {
    id: "desc",
  },
};
type CommonFindInclud = {
  include: {
    currency: true;
    sub_entries: {
      include: {
        three_digit: true;
        two_digit: true;
        account_entry: { include: { currency: true } };
        more_than_four_digit: true;
        reference: { include: { currency: true } };
      };
    };
  };
  orderBy: {
    id: "desc";
  };
};
const CommonFindIncludT = {
  include: {
    currency: true,
    sub_entries: {
      include: {
        three_digit: true,
        two_digit: true,
        account_entry: { include: { currency: true } },
        more_than_four_digit: true,
        reference: { include: { currency: true } },
      },
    },
  },
};
export async function findEnteris(props: {
  two_digit?: Prisma.Two_DigitGetPayload<{}>[];
  three_digit?: Prisma.Three_DigitGetPayload<{}>[];
  account?: Prisma.Account_EntryGetPayload<{}>[];
  type?: $Enums.DigitType;
  more_than_four_digit?: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  include_reference?: boolean;
  debit?: $Enums.DebitCreditType;
  currency?: Prisma.CurrencyGetPayload<{}>[];
  id?: number;
  from: Date;
  to: Date;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      const sub_entries = props.include_reference
        ? {
            some:
              props.account?.length > 0
                ? {
                    OR: [
                      {
                        account_entry_id: {
                          in: props.account.map((res) => res.id),
                        },
                      },
                      {
                        reference_id: {
                          in: props.account.map((res) => res.id),
                        },
                      },
                    ],
                  }
                : undefined,
          }
        : {
            some:
              props.account?.length > 0
                ? {
                    account_entry_id: {
                      in: props.account.map((res) => res.id),
                    },
                  }
                : undefined,
            every: {
              reference_id: null,
            },
          };

      if (props.two_digit?.length > 0) {
        //done

        return await prisma.entry.findMany({
          where: {
            config_id,
            id: props.id,
            to_date: {
              gte: props.from,
              lte: props.to,
            },
            currency_id:
              props.currency?.length > 0
                ? {
                    in: props.currency.map((res) => res.id),
                  }
                : undefined,

            AND: [
              {
                sub_entries: {
                  some: {
                    OR: [
                      {
                        two_digit_id: {
                          in: props.two_digit.map((res) => res.id),
                        },
                      },
                      {
                        three_digit: {
                          two_digit_id: {
                            in: props.two_digit.map((res) => res.id),
                          },
                        },
                      },
                      {
                        more_than_four_digit: {
                          three_digit: {
                            two_digit_id: {
                              in: props.two_digit.map((res) => res.id),
                            },
                          },
                        },
                      },

                      {
                        account_entry: {
                          OR: [
                            {
                              two_digit_id: {
                                in: props.two_digit.map((res) => res.id),
                              },
                            },

                            {
                              three_digit: {
                                two_digit_id: {
                                  in: props.two_digit.map((res) => res.id),
                                },
                              },
                            },
                            {
                              more_than_four_digit: {
                                three_digit: {
                                  two_digit_id: {
                                    in: props.two_digit.map((res) => res.id),
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        reference: props.include_reference
                          ? {
                              OR: [
                                {
                                  two_digit_id: {
                                    in: props.two_digit.map((res) => res.id),
                                  },
                                },

                                {
                                  three_digit: {
                                    two_digit_id: {
                                      in: props.two_digit.map((res) => res.id),
                                    },
                                  },
                                },
                                {
                                  more_than_four_digit: {
                                    three_digit: {
                                      two_digit_id: {
                                        in: props.two_digit.map(
                                          (res) => res.id
                                        ),
                                      },
                                    },
                                  },
                                },
                              ],
                            }
                          : undefined,
                      },
                    ],
                  },
                },
              },
              {
                sub_entries,
              },
            ],
          },
          ...(CommonFindInclud as any),
        });

        // const result = await prisma.$transaction(
        //   props.two_digit.map((two_digit) => {
        //     if (props.two_digit && props.account) {
        //       return prisma.entry.findMany({
        //         where: {
        //           config_id,
        //           id: props.id,
        //           to_date: {
        //             gte: props.from,
        //             lte: props.to,
        //           },
        //           currency_id:
        //             props.currency?.length > 0
        //               ? {
        //                   in: props.currency.map((res) => res.id),
        //                 }
        //               : undefined,

        //           AND: [
        //             {
        //               sub_entries: {
        //                 some: {
        //                   OR: [
        //                     {
        //                       two_digit_id: two_digit?.id,
        //                     },
        //                     {
        //                       three_digit: {
        //                         two_digit_id: two_digit?.id,
        //                       },
        //                     },
        //                     {
        //                       more_than_four_digit: {
        //                         three_digit: {
        //                           two_digit_id: two_digit?.id,
        //                         },
        //                       },
        //                     },
        //                   ],
        //                 },
        //               },
        //             },
        //             {
        //               sub_entries: props.include_reference
        //                 ? {
        //                     some:
        //                       props.account?.length > 0
        //                         ? {
        //                             OR: [
        //                               {
        //                                 OR: props.account.map((res) => ({
        //                                   account_entry_id: res.id,
        //                                 })),
        //                               },
        //                               {
        //                                 OR: props.account.map((res) => ({
        //                                   reference_id: res.id,
        //                                 })),
        //                               },
        //                             ],
        //                           }
        //                         : undefined,
        //                   }
        //                 : {
        //                     some:
        //                       props.account?.length > 0
        //                         ? {
        //                             OR: props.account.map((res) => ({
        //                               account_entry_id: res.id,
        //                             })),
        //                           }
        //                         : undefined,
        //                   },
        //             },
        //           ],
        //         },
        //         ...(CommonFindInclud as any),
        //       });
        //     } else {
        //       //done
        //       return prisma.entry.findMany({
        //         where: {
        //           config_id,
        //           id: props.id,
        //           to_date: {
        //             gte: props.from,
        //             lte: props.to,
        //           },
        //           currency_id:
        //             props.currency?.length > 0
        //               ? {
        //                   in: props.currency.map((res) => res.id),
        //                 }
        //               : undefined,

        //           AND: [
        //             {
        //               sub_entries: {
        //                 some: props.include_reference
        //                   ? {
        //                       OR: [
        //                         {
        //                           reference: {
        //                             OR: [
        //                               {
        //                                 two_digit_id: two_digit?.id,
        //                               },
        //                               {
        //                                 three_digit: {
        //                                   two_digit_id: two_digit?.id,
        //                                 },
        //                               },
        //                               {
        //                                 more_than_four_digit: {
        //                                   three_digit: {
        //                                     two_digit_id: two_digit?.id,
        //                                   },
        //                                 },
        //                               },
        //                             ],
        //                           },
        //                         },
        //                         {
        //                           account_entry: {
        //                             OR: [
        //                               {
        //                                 two_digit_id: two_digit?.id,
        //                               },
        //                               {
        //                                 three_digit: {
        //                                   two_digit_id: two_digit?.id,
        //                                 },
        //                               },
        //                               {
        //                                 more_than_four_digit: {
        //                                   three_digit: {
        //                                     two_digit_id: two_digit?.id,
        //                                   },
        //                                 },
        //                               },
        //                             ],
        //                           },
        //                         },
        //                         {
        //                           two_digit_id: two_digit?.id,
        //                         },
        //                         {
        //                           three_digit: {
        //                             two_digit_id: two_digit?.id,
        //                           },
        //                         },
        //                         {
        //                           more_than_four_digit: {
        //                             three_digit: {
        //                               two_digit_id: two_digit?.id,
        //                             },
        //                           },
        //                         },
        //                       ],
        //                     }
        //                   : {
        //                       OR: [
        //                         {
        //                           account_entry: {
        //                             OR: [
        //                               {
        //                                 two_digit_id: two_digit?.id,
        //                               },
        //                               {
        //                                 three_digit: {
        //                                   two_digit_id: two_digit?.id,
        //                                 },
        //                               },
        //                               {
        //                                 more_than_four_digit: {
        //                                   three_digit: {
        //                                     two_digit_id: two_digit?.id,
        //                                   },
        //                                 },
        //                               },
        //                             ],
        //                           },
        //                         },
        //                         {
        //                           two_digit_id: two_digit?.id,
        //                         },
        //                         {
        //                           three_digit: {
        //                             two_digit_id: two_digit?.id,
        //                           },
        //                         },
        //                         {
        //                           more_than_four_digit: {
        //                             three_digit: {
        //                               two_digit_id: two_digit?.id,
        //                             },
        //                           },
        //                         },
        //                       ],
        //                       reference: null,
        //                     },
        //               },
        //             },
        //           ],
        //         },
        //         ...(CommonFindInclud as any),
        //       });
        //     }
        //   })
        // );

        // return entires;
      } else if (props.three_digit?.length > 0) {
        //done
        return await prisma.entry.findMany({
          where: {
            config_id,
            id: props.id,
            to_date: {
              gte: props.from,
              lte: props.to,
            },
            currency_id:
              props.currency?.length > 0
                ? {
                    in: props.currency.map((res) => res.id),
                  }
                : undefined,

            AND: [
              {
                sub_entries: {
                  some: {
                    OR: [
                      {
                        three_digit_id: {
                          in: props.three_digit.map((res) => res.id),
                        },
                      },
                      {
                        more_than_four_digit: {
                          three_digit_id: {
                            in: props.three_digit.map((res) => res.id),
                          },
                        },
                      },

                      {
                        account_entry: {
                          OR: [
                            {
                              three_digit_id: {
                                in: props.three_digit.map((res) => res.id),
                              },
                            },
                            {
                              more_than_four_digit: {
                                three_digit_id: {
                                  in: props.three_digit.map((res) => res.id),
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        reference: props.include_reference
                          ? {
                              OR: [
                                {
                                  three_digit_id: {
                                    in: props.three_digit.map((res) => res.id),
                                  },
                                },
                                {
                                  more_than_four_digit: {
                                    three_digit_id: {
                                      in: props.three_digit.map(
                                        (res) => res.id
                                      ),
                                    },
                                  },
                                },
                              ],
                            }
                          : undefined,
                      },
                    ],
                  },
                },
              },
              {
                sub_entries,
              },
            ],
          },
          ...(CommonFindInclud as any),
        });
      } else if (props.more_than_four_digit?.length > 0) {
        return await prisma.entry.findMany({
          where: {
            config_id,
            id: props.id,
            to_date: {
              gte: props.from,
              lte: props.to,
            },
            currency_id:
              props.currency?.length > 0
                ? {
                    in: props.currency.map((res) => res.id),
                  }
                : undefined,

            AND: [
              {
                sub_entries: {
                  some: {
                    OR: [
                      {
                        more_than_four_digit_id: {
                          in: props.more_than_four_digit.map((res) => res.id),
                        },
                      },

                      {
                        account_entry: {
                          more_than_four_digit_id: {
                            in: props.more_than_four_digit.map((res) => res.id),
                          },
                        },
                      },
                      {
                        reference: props.include_reference
                          ? {
                              more_than_four_digit_id: {
                                in: props.more_than_four_digit.map(
                                  (res) => res.id
                                ),
                              },
                            }
                          : undefined,
                      },
                    ],
                  },
                },
              },
              {
                sub_entries,
              },
            ],
          },
          ...(CommonFindInclud as any),
        });
      }

      return await prisma.entry.findMany({
        where: {
          config_id,
          id: props.id,
          to_date: {
            gte: props.from,
            lte: props.to,
          },
          currency_id:
            props.currency?.length > 0
              ? {
                  in: props.currency.map((res) => res.id),
                }
              : undefined,

          AND: [
            {
              sub_entries,
            },
          ],
        },
        ...(CommonFindInclud as any),
      });
    },
    "View_Entries",
    false
  );

  // const config = await prisma.config.findFirst({
  //   where: {
  //     id: config_id,
  //   },
  //   select: {
  //     logo: true,
  //     name: true,
  //   },
  // });

  // const currencies = await prisma.currency.findMany({ where: { config_id } });
}

export async function findTwoDigitSubEnteris(props: {
  two_digit_id?: number;
  include_reference?: boolean;
  from: Date;
  to: Date;
  currency_id: number;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      const { two_digit_id, include_reference } = props;

      return prisma.entry.findMany({
        where: {
          config_id,

          to_date: {
            gte: props.from,
            lte: props.to,
          },
          currency_id: props.currency_id,

          AND: [
            {
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
                    {
                      more_than_four_digit: { three_digit: { two_digit_id } },
                    },
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
                              three_digit: { two_digit_id },
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
                              three_digit: { two_digit_id },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            props.include_reference
              ? {}
              : {
                  sub_entries: {
                    every: { reference_id: null },
                  },
                },
          ],
        },
        include: {
          sub_entries: {
            where: {
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
                  more_than_four_digit: { three_digit: { two_digit_id } },
                },
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
                          three_digit: { two_digit_id },
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
                          three_digit: { two_digit_id },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });
    },
    "View_Entries",
    false
  );
}
export async function findTwoDigitsEntry(props: {
  two_digit_ids?: number[];
  include_reference?: boolean;
  from: Date;
  to: Date;
  currency_id: number;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      const { two_digit_ids, include_reference } = props;

      return prisma.entry.findMany({
        where: {
          config_id,

          to_date: {
            gte: props.from,
            lte: props.to,
          },
          currency_id: props.currency_id,

          AND: [
            {
              sub_entries: {
                some: {
                  OR: [
                    {
                      two_digit_id: {
                        in: two_digit_ids,
                      },
                    },
                    {
                      three_digit: {
                        two_digit_id: { in: two_digit_ids },
                      },
                    },
                    {
                      more_than_four_digit: {
                        three_digit: {
                          two_digit_id: { in: two_digit_ids },
                        },
                      },
                    },
                    {
                      account_entry: {
                        OR: [
                          {
                            two_digit_id: { in: two_digit_ids },
                          },
                          {
                            three_digit: {
                              two_digit_id: { in: two_digit_ids },
                            },
                          },
                          {
                            more_than_four_digit: {
                              three_digit: {
                                two_digit_id: { in: two_digit_ids },
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
                            two_digit_id: { in: two_digit_ids },
                          },
                          {
                            three_digit: {
                              two_digit_id: { in: two_digit_ids },
                            },
                          },
                          {
                            more_than_four_digit: {
                              three_digit: {
                                two_digit_id: { in: two_digit_ids },
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // props.include_reference
            //   ? {}
            //   : {
            //       sub_entries: {
            //         every: { reference_id: null },
            //       },
            //     },
          ],
        },
        include: {
          sub_entries: {
            where: {
              OR: [
                {
                  two_digit_id: { in: two_digit_ids },
                },
                {
                  three_digit: {
                    two_digit_id: { in: two_digit_ids },
                  },
                },
                {
                  more_than_four_digit: {
                    three_digit: { two_digit_id: { in: two_digit_ids } },
                  },
                },
                {
                  account_entry: {
                    OR: [
                      {
                        two_digit_id: { in: two_digit_ids },
                      },
                      {
                        three_digit: {
                          two_digit_id: { in: two_digit_ids },
                        },
                      },
                      {
                        more_than_four_digit: {
                          three_digit: {
                            two_digit_id: { in: two_digit_ids },
                          },
                        },
                      },
                    ],
                  },
                },
                include_reference
                  ? {
                      reference: {
                        OR: [
                          {
                            two_digit_id: { in: two_digit_ids },
                          },
                          {
                            three_digit: {
                              two_digit_id: { in: two_digit_ids },
                            },
                          },
                          {
                            more_than_four_digit: {
                              three_digit: {
                                two_digit_id: { in: two_digit_ids },
                              },
                            },
                          },
                        ],
                      },
                    }
                  : {
                      reference_id: null,
                    },
              ],
            },
          },
        },
      });
    },
    "View_Entries",
    false
  );
}

export async function findThreeDigitSubEnteris(props: {
  three_digit_id?: number;
  include_reference?: boolean;
  from: Date;
  to: Date;
  currency_id: number;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      const { three_digit_id, include_reference } = props;

      return prisma.entry.findMany({
        where: {
          config_id,

          to_date: {
            gte: props.from,
            lte: props.to,
          },
          currency_id: props.currency_id,

          AND: [
            {
              sub_entries: {
                some: {
                  OR: [
                    {
                      three_digit_id,
                    },

                    {
                      more_than_four_digit: { three_digit_id },
                    },
                    {
                      account_entry: {
                        OR: [
                          {
                            three_digit_id,
                          },

                          {
                            more_than_four_digit: { three_digit_id },
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
                            more_than_four_digit: { three_digit_id },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            props.include_reference
              ? {}
              : {
                  sub_entries: {
                    every: { reference_id: null },
                  },
                },
          ],
        },
        include: {
          sub_entries: {
            where: {
              OR: [
                {
                  three_digit_id,
                },

                {
                  more_than_four_digit: { three_digit_id },
                },
                {
                  account_entry: {
                    OR: [
                      {
                        three_digit_id,
                      },

                      {
                        more_than_four_digit: { three_digit_id },
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
                        more_than_four_digit: { three_digit_id },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });
    },
    "View_Entries",
    false
  );
}
export async function findMoreDigitSubEnteris(props: {
  more_than_four_digit_id?: number;
  include_reference?: boolean;
  from: Date;
  to: Date;
  currency_id: number;
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      const { more_than_four_digit_id, include_reference } = props;

      return prisma.entry.findMany({
        where: {
          config_id,

          to_date: {
            gte: props.from,
            lte: props.to,
          },
          currency_id: props.currency_id,

          AND: [
            {
              sub_entries: {
                some: {
                  OR: [
                    {
                      more_than_four_digit_id,
                    },

                    {
                      account_entry: {
                        OR: [
                          {
                            more_than_four_digit_id,
                          },
                        ],
                      },
                    },
                    {
                      reference: {
                        OR: [
                          {
                            more_than_four_digit_id,
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            props.include_reference
              ? {}
              : {
                  sub_entries: {
                    every: { reference_id: null },
                  },
                },
          ],
        },
        include: {
          sub_entries: {
            where: {
              OR: [
                {
                  more_than_four_digit_id,
                },

                {
                  account_entry: {
                    OR: [
                      {
                        more_than_four_digit_id,
                      },
                    ],
                  },
                },
                {
                  reference: {
                    OR: [
                      {
                        more_than_four_digit_id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      });
    },
    "View_Entries",
    false
  );
}
type CommonSearchData = {
  name: string;
  id: number;
  debit: number;
  credit: number;
  total_rate: number;
  type?: $Enums.DigitType | "Others";
  debit_credit?: $Enums.DebitCreditType;
};

export async function findTwoDigitsSubEntries(props: {
  from: Date;
  to: Date;
  include_reference: boolean;
  currency: Prisma.CurrencyGetPayload<{}>;
  two_digits: Prisma.Two_DigitGetPayload<{}>[];
}) {
  return handlerServiceAction(
    async (_, config_id) => {
      const digits = props.two_digits.map<{
        name: string;
        id: number;
        type: $Enums.DigitType;

        debit_credit: $Enums.DebitCreditType;
        subEntires: Prisma.SubEntryGetPayload<{}>[];
      }>((res) => ({
        name: res.name,
        id: res.id,
        type: res.type,
        debit_credit: res.debit_credit,
        subEntires: [],
        total_rate: 0,
        total_credit: 0,
        total_debit: 0,
      }));

      const result = await prisma.$transaction(
        digits.map((two_digit) => {
          const commonOr = [
            {
              two_digit_id: two_digit.id,
            },
            {
              three_digit: {
                two_digit_id: two_digit.id,
              },
            },
            {
              more_than_four_digit: {
                three_digit: {
                  two_digit_id: two_digit.id,
                },
              },
            },
            {
              account_entry: {
                OR: [
                  {
                    two_digit_id: two_digit.id,
                  },
                  {
                    three_digit: {
                      two_digit_id: two_digit.id,
                    },
                  },
                  {
                    more_than_four_digit: {
                      three_digit: {
                        two_digit_id: two_digit.id,
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
                    two_digit_id: two_digit.id,
                  },
                  {
                    three_digit: {
                      two_digit_id: two_digit.id,
                    },
                  },
                  {
                    more_than_four_digit: {
                      three_digit: {
                        two_digit_id: two_digit.id,
                      },
                    },
                  },
                ],
              },
            },
          ];
          return prisma.entry.findMany({
            where: {
              config_id,

              to_date: {
                gte: props.from,
                lte: props.to,
              },
              currency_id: props.currency.id,

              AND: [
                {
                  sub_entries: {
                    some: {
                      OR: commonOr,
                    },
                  },
                },
                props.include_reference
                  ? {}
                  : {
                      sub_entries: {
                        every: {
                          reference_id: null,
                        },
                      },
                    },
              ],
            },
            include: {
              sub_entries: {
                where: {
                  OR: commonOr,
                },
              },
            },
          });
        })
      );

      return digits.map((digit, i) => {
        const subEntires = result[i];
        subEntires.map((entry) => {
          entry.sub_entries.map((subEntries) => {
            digit.subEntires = digit.subEntires.concat(subEntries);
          });
        });

        return digit;
      });
    },
    "View_Entries",
    false
  );
}
export async function findTwoDigitsSubEntriesWithAccounts(props: {
  from: Date;
  to: Date;
  include_reference: boolean;
  currency: Prisma.CurrencyGetPayload<{}>;
  two_digits: Prisma.Two_DigitGetPayload<{}>[];
  account: Prisma.Account_EntryGetPayload<{}>;
}) {
  return handlerServiceAction(
    async (_, config_id) => {
      const digits = props.two_digits.map<{
        name: string;
        id: number;
        type: $Enums.DigitType;

        debit_credit: $Enums.DebitCreditType;
        subEntires: Prisma.SubEntryGetPayload<{}>[];
      }>((res) => ({
        name: res.name,
        id: res.id,
        type: res.type,
        debit_credit: res.debit_credit,
        subEntires: [],
        total_rate: 0,
        total_credit: 0,
        total_debit: 0,
      }));

      const result = await prisma.$transaction(
        digits.map((two_digit) => {
          const commonOr = [
            {
              two_digit_id: two_digit.id,
            },
            {
              three_digit: {
                two_digit_id: two_digit.id,
              },
            },
            {
              more_than_four_digit: {
                three_digit: {
                  two_digit_id: two_digit.id,
                },
              },
            },
          ];
          return prisma.entry.findMany({
            where: {
              // config_id,
              // currency_id: props.currency.id,
            },
            include: {
              sub_entries: true,
            },
          });
        })
      );
      // console.log(result);

      return digits.map((digit, i) => {
        const subEntires = result[i];
        subEntires.map((entry) => {
          entry.sub_entries.map((subEntries) => {
            digit.subEntires = digit.subEntires.concat(subEntries);
          });
        });

        return digit;
      });
    },
    "View_Entries",
    false
  );
}

export async function findThreeDigitsSubEntries(props: {
  from: Date;
  to: Date;
  include_reference: boolean;
  currency: Prisma.CurrencyGetPayload<{}>;
  three_digits: Prisma.Two_DigitGetPayload<{}>[];
}) {
  return handlerServiceAction(
    async (_, config_id) => {
      const digits = props.three_digits.map<{
        name: string;
        id: number;
        type: $Enums.DigitType;

        debit_credit: $Enums.DebitCreditType;
        subEntires: Prisma.SubEntryGetPayload<{}>[];
      }>((res) => ({
        name: res.name,
        id: res.id,
        type: res.type,
        debit_credit: res.debit_credit,
        subEntires: [],
        total_rate: 0,
        total_credit: 0,
        total_debit: 0,
      }));

      const result = await prisma.$transaction(
        digits.map((three_digit) => {
          const commonOr = [
            {
              three_digit_id: three_digit.id,
            },

            {
              more_than_four_digit: {
                three_digit_id: three_digit.id,
              },
            },
            {
              account_entry: {
                OR: [
                  {
                    three_digit_id: three_digit.id,
                  },

                  {
                    more_than_four_digit: {
                      three_digit_id: three_digit.id,
                    },
                  },
                ],
              },
            },
            {
              reference: {
                OR: [
                  {
                    three_digit_id: three_digit.id,
                  },

                  {
                    more_than_four_digit: {
                      three_digit_id: three_digit.id,
                    },
                  },
                ],
              },
            },
          ];
          return prisma.entry.findMany({
            where: {
              config_id,

              to_date: {
                gte: props.from,
                lte: props.to,
              },
              currency_id: props.currency.id,

              AND: [
                {
                  sub_entries: {
                    some: {
                      OR: commonOr,
                    },
                  },
                },
                props.include_reference
                  ? {}
                  : {
                      sub_entries: {
                        every: {
                          reference_id: null,
                        },
                      },
                    },
              ],
            },
            include: {
              sub_entries: {
                where: {
                  OR: commonOr,
                },
              },
            },
          });
        })
      );

      return digits.map((digit, i) => {
        const subEntires = result[i];
        subEntires.map((entry) => {
          entry.sub_entries.map((subEntries) => {
            digit.subEntires = digit.subEntires.concat(subEntries);
          });
        });

        return digit;
      });
    },
    "View_Entries",
    false
  );
}
export async function findMoreDigitsSubEntries(props: {
  from: Date;
  to: Date;
  include_reference: boolean;
  currency: Prisma.CurrencyGetPayload<{}>;
  more_digits: Prisma.Two_DigitGetPayload<{}>[];
}) {
  return handlerServiceAction(
    async (_, config_id) => {
      const digits = props.more_digits.map<{
        name: string;
        id: number;
        type: $Enums.DigitType;

        debit_credit: $Enums.DebitCreditType;
        subEntires: Prisma.SubEntryGetPayload<{}>[];
      }>((res) => ({
        name: res.name,
        id: res.id,
        type: res.type,
        debit_credit: res.debit_credit,
        subEntires: [],
      }));

      const result = await prisma.$transaction(
        digits.map((more_digit) => {
          const commonOr = [
            {
              more_than_four_digit_id: more_digit.id,
            },

            {
              account_entry: {
                OR: [
                  {
                    more_than_four_digit_id: more_digit.id,
                  },
                ],
              },
            },
            {
              reference: {
                OR: [
                  {
                    more_than_four_digit_id: more_digit.id,
                  },
                ],
              },
            },
          ];

          return prisma.entry.findMany({
            where: {
              config_id,

              to_date: {
                gte: props.from,
                lte: props.to,
              },
              currency_id: props.currency.id,

              AND: [
                {
                  sub_entries: {
                    some: {
                      OR: commonOr,
                    },
                  },
                },
                props.include_reference
                  ? {}
                  : {
                      sub_entries: {
                        every: {
                          reference_id: null,
                        },
                      },
                    },
              ],
            },
            include: {
              sub_entries: {
                where: {
                  OR: commonOr,
                },
              },
            },
          });
        })
      );

      return digits.map((digit, i) => {
        const subEntires = result[i];
        subEntires.map((entry) => {
          entry.sub_entries.map((subEntries) => {
            digit.subEntires = digit.subEntires.concat(subEntries);
          });
        });

        return digit;
      });
    },
    "View_Entries",
    false
  );
}

export async function handleFindExport(search: {
  two_digit: Prisma.Two_DigitGetPayload<{}>[];
  three_digit: Prisma.Three_DigitGetPayload<{}>[];
  more_digit: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  currency?: Prisma.CurrencyGetPayload<{}>;
  include_reference: boolean;
  account?: Prisma.Account_EntryGetPayload<{}>;
  from: Date;
  to: Date;
}) {
  return handlerServiceAction(async () => {
    var data: CommonSearchData[] = [];

    const { result } = await findTwoDigitsEntry({
      currency_id: search.currency?.id,
      from: search.from,
      to: search.to,
      two_digit_ids: search.two_digit.map((res) => res.id),
      include_reference: search.include_reference,
    });

    const digits = search.two_digit.map<CommonSearchData>((res) => ({
      name: res.name,
      id: res.id,
      type: res.type,
      debit_credit: res.debit_credit,
      credit: 0,
      debit: 0,
      total_rate: 0,
    }));

    prisma.two_Digit.findMany({
      where: {
        id: {
          in: search.two_digit.map((res) => res.id),
        },
        sub_entries: {},
      },
    });

    if (search.two_digit.length > 0) {
      digits.map((digit) => {
        var temp: CommonSearchData = {
          name: digit.name,
          credit: 0,
          debit: 0,
          id: digit.id,
          debit_credit: digit.debit_credit,
          type: digit.type ?? "Others",

          total_rate: 0,
        };
        findTwoDigitSubEnteris({
          include_reference: search.include_reference,
          two_digit_id: digit.id,
          from: search.from,
          to: search.to,
          currency_id: search.currency?.id,
        })
          .then((res) => {
            return res.result;
          })
          .then((res) => {
            const sub: (Prisma.SubEntryGetPayload<{}> & { rate?: number })[] =
              [];
            res.map((entry) =>
              entry.sub_entries.map((res) =>
                sub.push({ ...res, rate: entry.rate })
              )
            );
            return sub;
          })
          .then((res) => {
            res.map((res) => {
              if (res.type === "Debit") {
                temp.debit += res.amount;
                if (res.rate) {
                  temp.total_rate += temp.debit / res.rate;
                }
              } else {
                temp.credit += res.amount;
                if (res.rate) {
                  temp.total_rate = temp.credit / res.rate;
                }
              }
            });
          })
          .then((res) => {
            data.push(temp);
          });
      });
    } else if (search.three_digit.length > 0) {
      await Promise.all(
        search.three_digit.map((digit) => {
          var temp: CommonSearchData = {
            name: digit.name,
            credit: 0,
            debit: 0,
            id: digit.id,
            debit_credit: digit.debit_credit,
            type: digit.type ?? "Others",
            total_rate: 0,
          };
          findThreeDigitSubEnteris({
            include_reference: search.include_reference,
            three_digit_id: digit.id,
            from: search.from,
            to: search.to,
            currency_id: search.currency?.id,
          })
            .then((res) => {
              return res.result;
            })
            .then((res) => {
              const sub: (Prisma.SubEntryGetPayload<{}> & { rate?: number })[] =
                [];
              res.map((entry) =>
                entry.sub_entries.map((res) =>
                  sub.push({ ...res, rate: entry.rate })
                )
              );
              return sub;
            })
            .then((res) => {
              res.map((res) => {
                if (res.type === "Debit") {
                  temp.debit += res.amount;
                  temp.credit += res.amount;
                  if (res.rate) {
                    temp.total_rate += temp.debit / res.rate;
                  }
                } else {
                  temp.credit += res.amount;
                  if (res.rate) {
                    temp.total_rate = temp.credit / res.rate;
                  }
                }
              });
            })
            .then((res) => {
              data.push(temp);
            });
        })
      );
    } else if (search.more_digit.length > 0) {
      await Promise.all(
        search.more_digit.map((digit) => {
          var temp: CommonSearchData = {
            name: digit.name,
            credit: 0,
            debit: 0,
            id: digit.id,
            type: digit.type ?? "Others",
            debit_credit: digit.debit_credit,

            total_rate: 0,
          };
          findMoreDigitSubEnteris({
            include_reference: search.include_reference,
            more_than_four_digit_id: digit.id,
            from: search.from,
            to: search.to,
            currency_id: search.currency?.id,
          })
            .then((res) => {
              return res.result;
            })
            .then((res) => {
              const sub: (Prisma.SubEntryGetPayload<{}> & { rate?: number })[] =
                [];
              res.map((entry) =>
                entry.sub_entries.map((res) =>
                  sub.push({ ...res, rate: entry.rate })
                )
              );
              return sub;
            })
            .then((entry) => {
              entry.map((res) => {
                if (res.type === "Debit") {
                  temp.debit += res.amount;
                  if (res.rate) {
                    temp.total_rate += temp.debit / res.rate;
                  }
                } else {
                  temp.credit += res.amount;
                  if (res.rate) {
                    temp.total_rate = temp.credit / res.rate;
                  }
                }
              });
            })
            .then((res) => {
              data.push(temp);
            });
        })
      );
    }
    return data;
  }, "View_Entries");
}

// export async function findSubEnteris(props: {
//   two_digit?: Prisma.Two_DigitGetPayload<{}>;
//   three_digit?: Prisma.Three_DigitGetPayload<{}>;
//   account?: Prisma.Account_EntryGetPayload<{}>;
//   type?: $Enums.DigitType;
//   more_than_four_digit?: Prisma.More_Than_Four_DigitGetPayload<{}>;
//   include_reference?: boolean;
//   debit?: $Enums.DebitCreditType;
//   currency?: Prisma.CurrencyGetPayload<{}>[];
//   id?: number;
//   from: Date;
//   to: Date;
// }) {
//   handlerServiceAction(async (info, config_id) => {
//     prisma.subEntry.findMany({
//       where: {
//         entry: {
//           currency_id:
//             props.currency.length > 0
//               ? {
//                   in: props.currency.map((res) => res.id),
//                 }
//               : undefined,
//           config_id,
//           id: props.id,
//           to_date: {
//             gte: props.from,
//             lte: props.to,
//           },
//         },
//         // entry:{
//         // currency_id:{
//         //   in:props.currency.map(res=>res.id)

//         // },
//         //   config_id,
//         //   id: props.id,
//         //   to_date: {
//         //     gte: props.from,
//         //     lte: props.to,

//         // },

//         OR: [
//           {
//             two_digit_id: props.two_digit.id,
//           },
//           {
//             three_digit: {
//               two_digit_id: props.two_digit.id,
//             },
//           },
//           {
//             more_than_four_digit: {
//               three_digit: {
//                 two_digit_id: props.two_digit.id,
//               },
//             },
//           },
//           {
//             account_entry: {
//               OR: [
//                 {
//                   two_digit_id: props.two_digit.id,
//                 },
//                 {
//                   three_digit: {
//                     two_digit_id: props.two_digit.id,
//                   },
//                 },
//                 {
//                   more_than_four_digit: {
//                     three_digit: {
//                       two_digit_id: props.two_digit.id,
//                     },
//                   },
//                 },

//               ],
//             },
//           },
//         ],
//       },
//     });
//   }, "View_Entries");
// }
/**
 *
 * Done
 *
 */
export async function saveEntry(props: {
  entry: Prisma.EntryUncheckedCreateInput;
  media?: Prisma.MediaUncheckedCreateInput;
  subEntries: Prisma.SubEntryUncheckedCreateInput[];
  includeRate?: boolean;
  file?: FormData;
  id?: number;
  activity?: {
    id: number;
    status?: ActivityStatus;
  };
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.entry.user_id = info.user.id;
      props.entry.config_id = config_id;
      if (!props.includeRate) {
        props.entry.rate = null;
      }
      if (props.file) {
        props.media = await FileMapper({
          config_id,
          file: props.file,
          title: props.entry.title,
        });
      }

      if (props.activity) props.activity.status = ActivityStatus.Provided;

      const currency = await prisma.currency.findUnique({
        where: { id: props.entry.currency_id, rate: { gt: 0 } },
      });

      if (currency && props.includeRate) {
        props.entry.rate = props.entry.rate ?? currency.rate;
      } else {
      }
      var media: Prisma.MediaGetPayload<{}>;
      if (props.id) {
        var tempEntry = await prisma.entry.findUnique({
          where: { id: props.id },
          select: { media: true },
        });
        media = tempEntry.media;
      }

      const entry = props.id
        ? await prisma.entry[`update`]({
            where: { id: props.id },
            data: {
              ...props.entry,

              media: props.media
                ? media?.path === props.media.path
                  ? {}
                  : {
                      connect: {
                        id: props.media?.id,
                      },
                    }
                : media
                ? { delete: {} }
                : {},
            },
          })
        : await prisma.entry[`create`]({
            data: {
              ...props.entry,
              media: props.media
                ? {
                    connect: { id: props.media.id },
                  }
                : undefined,
            },
          });
      if (props.id) {
        await prisma.subEntry.deleteMany({ where: { entry_id: props.id } });
      }
      props.subEntries = props.subEntries.map((res, i) => {
        res.config_id = config_id;
        res.entry_id = entry.id;
        return res;
      });
      await prisma.subEntry.createMany({ data: props.subEntries });
      props.activity ? await confirmActivity(props.activity) : undefined;
      return;
    },
    "Add_Entry",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.entry.delete({ where: { id: id, config_id } });
    },
    "Delete_Entry",
    true,
    { id }
  );
}
export async function resetEntry(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.entry.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}

type CommonInclude = {
  currency: true;

  sub_entries: {
    include: {
      account_entry: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } };
            };
          };

          three_digit: {
            include: {
              two_digit: true;
            };
          };
          two_digit: true;
        };
      };
      reference: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } };
            };
          };

          three_digit: {
            include: {
              two_digit: true;
            };
          };
          two_digit: true;
        };
      };
      more_than_four_digit: {
        include: {
          three_digit: { include: { two_digit: true } };
        };
      };

      three_digit: {
        include: {
          two_digit: true;
        };
      };
      two_digit: true;
    };
  };
};
const CommonInclude = {
  currency: true,

  sub_entries: {
    include: {
      account_entry: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } },
            },
          },

          three_digit: {
            include: {
              two_digit: true,
            },
          },
          two_digit: true,
        },
      },
      reference: {
        include: {
          more_than_four_digit: {
            include: {
              three_digit: { include: { two_digit: true } },
            },
          },

          three_digit: {
            include: {
              two_digit: true,
            },
          },
          two_digit: true,
        },
      },
      more_than_four_digit: {
        include: {
          three_digit: { include: { two_digit: true } },
        },
      },

      three_digit: {
        include: {
          two_digit: true,
        },
      },
      two_digit: true,
    },
  },
};
