"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useTransition } from "react";
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useAlertHook from "@rms/hooks/alert-hooks";
import { Button } from "@rms/components/ui/button";
import { Input } from "@rms/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteMoreDigit, deleteTwoDigit } from "@rms/service/digit-service";
import Authorized from "@rms/components/ui/authorized";
import { Typography } from "@material-tailwind/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { MenuItem } from "@mui/material";

type Props = {
  node: CommonNode;
  value: {
    two: Prisma.Two_DigitGetPayload<{}>[];
    three: Prisma.Three_DigitGetPayload<{}>[];
    more: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  };
};
type CommonNode = "two" | "three" | "more";

export default function DigitTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      [
        {
          accessorKey: "id",
          header: "ID",
          Cell: ({ row: { original } }) => (
            <div
              className={`text-center rounded-sm ${
                original.status === "Deleted"
                  ? "bg-red-500"
                  : original.create_date.toLocaleTimeString() !==
                    original.modified_date.toLocaleTimeString()
                  ? "bg-yellow-400"
                  : ""
              }`}
            >
              {original.id}
            </div>
          ),
        },

        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "type",
          header: "Type",
        },
        {
          accessorKey: "debit_credit",
          header: "Debit/Credit",
        },
      ]
        .concat(
          props.node !== "two"
            ? ([
                {
                  accessorKey: props.node === "three" ? "two" : "three",
                  header: props.node === "three" ? "Two Digit" : "Three Digit",
                  accessorFn: (p) =>
                    `(${p.two_digit?.id ?? ""}${p.three_digit?.id ?? ""}) ${
                      p.two_digit?.name ?? ""
                    }${p.three_digit?.name ?? ""}  `,
                },
              ] as any)
            : []
        )
        .concat([
          {
            accessorKey: "create_date",
            header: "Create Date",
            columnDefType: "data",
            id: "create_date",
            accessorFn: (p) => p.create_date?.toLocaleDateString(),
          },

          {
            accessorKey: "modified_date",
            header: "Modified Date",
            columnDefType: "data",
            id: "modified_date",
            accessorFn: (p) => p.modified_date?.toLocaleDateString(),
          },
        ] as any),
    [createAlert, props.node, isActive, pathName, push]
  );
  // const table = useReactTable({
  //   data: props.value[props.node],
  //   columns: columns,

  //   getCoreRowModel: getCoreRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),

  //   state: {
  //     globalFilter,
  //   },
  // });

  return (
    <div className="flex gap-6 flex-col ">
      <MaterialReactTable
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, username },
          },
        }) => [
          <Authorized
            key={1}
            permission={
              props.node === "two"
                ? "Edit_Two_Digit"
                : props.node === "three"
                ? "Edit_Three_Digit"
                : "Edit_More_Than_Four_Digit"
            }
          >
            <MenuItem
              onClick={() => push(pathName + "/form?id=" + id)}
              className="cursor-pointer"
              disabled={isActive}
            >
              Edit
            </MenuItem>
          </Authorized>,
          <Authorized
            key={2}
            permission={
              props.node === "two"
                ? "Delete_Two_Digit"
                : props.node === "three"
                ? "Delete_Three_Digit"
                : "Delete_More_Than_Four_Digit"
            }
          >
            <MenuItem
              disabled={isActive}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${username} id:${id} `
                );
                if (isConfirm) {
                  setActiveTransition(async () => {
                    const result =
                      props.node === "two"
                        ? await deleteTwoDigit(id)
                        : props.node === "three"
                        ? await deleteTwoDigit(id)
                        : await deleteMoreDigit(id);

                    createAlert(result);
                  });
                }
              }}
            >
              {isActive ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.value[props.node]}
      />
    </div>
  );
}
