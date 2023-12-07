"use client";

import { Prisma } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Authorized from "@rms/components/ui/authorized";
import { Button } from "@rms/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import { Input } from "@rms/components/ui/input";
import { useToast } from "@rms/hooks/toast-hook";
import { deleteBrokerById } from "@rms/service/broker-service";
import { deleteTraderById } from "@rms/service/trader-service";
import { deleteAccountById } from "@rms/service/trading-account-service";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Props =
  | {
      node: "account";
      data: Prisma.AccountGetPayload<{ include: { trader: true } }>[];
    }
  | {
      node: "trader";
      data: Prisma.TraderGetPayload<{ include: { broker: true } }>[];
    }
  | {
      node: "broker";
      data: Prisma.BrokerGetPayload<{}>[];
    };

export default function TradingTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const toast = useToast();
  const { push } = useRouter();

  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      [
        {
          accessorKey: "action",
          cell(originalRow) {
            const { id, username } = originalRow.row.original;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <DotsHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Authorized permission="Edit_Trader">
                      <DropdownMenuItem
                        onClick={() => push(pathName + "/form?id=" + id)}
                        className="cursor-pointer"
                        disabled={isPadding}
                      >
                        Edit
                      </DropdownMenuItem>
                    </Authorized>
                    <Authorized permission="Delete_Trader">
                      <DropdownMenuItem
                        disabled={isPadding}
                        className="cursor-pointer"
                        onClick={() => {
                          const isConfirm = confirm(
                            `Do You sure you want to delete ${username} id:${id} `
                          );
                          if (isConfirm) {
                            setTransition(async () => {
                              var result;

                              switch (props.node) {
                                case "broker": {
                                  result = await deleteBrokerById(id);
                                  break;
                                }
                                case "trader": {
                                  result = await deleteTraderById(id);
                                  break;
                                }
                                case "account": {
                                  result = await deleteAccountById(id);
                                  break;
                                }
                              }

                              toast.OpenAlert(result);
                            });
                          }
                        }}
                      >
                        {isPadding ? <> deleting...</> : "Delete"}
                      </DropdownMenuItem>
                    </Authorized>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },

        {
          header: "Status",
          accessorKey: "status",
        },

        {
          accessorKey: "id",
          header: "ID",
          cell: ({ row: { original } }) => (
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
          accessorKey: "username",
          header: "UserName",
        },
      ]
        .concat(
          props.node !== "account"
            ? [
                {
                  accessorKey: "first_name",
                  header: "First Name",
                },
                {
                  accessorKey: "last_name",
                  header: "Last Name",
                },
                {
                  accessorKey: "phone_number",
                  header: "Phone number",
                },
                {
                  accessorKey: "email",
                  header: "Email",
                },
                {
                  accessorKey: "gender",
                  header: "Gender",
                },
                {
                  accessorKey: "country",
                  header: "Country",
                },
                {
                  accessorKey: "address1",
                  header: "Address 1",
                },
                {
                  accessorKey: "address2",
                  header: "Address 2",
                },
              ]
            : ([] as any)
        )
        .concat(
          props.node !== "broker"
            ? [
                {
                  accessorKey:
                    props.node === "trader"
                      ? "trader.username"
                      : "broker.username",
                  header: props.node === "trader" ? "Trader" : "Broker",
                },
              ]
            : []
        )
        .concat([
          {
            accessorKey: "create_date",
            header: "Create Date",
            accessorFn: (e) => e.create_date.toLocaleDateString(),
          },

          {
            accessorKey: "modified_date",
            header: "Modified Date",
            accessorFn: (e) => e.modified_date.toLocaleDateString(),
          },
        ] as any) as any,
    [toast.OpenAlert, props.node, , toast]
  );
  const table = useReactTable({
    data: props.data,
    columns: columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      globalFilter,
    },
  });

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-between items-center ">
        <h1>Result: {props.data.length}</h1>
      </div>
      <div className="max-w-xs">
        <Input
          placeholder="search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Using Vanilla Mantine Table component here */}
      <div className="h-full w-full overflow-auto  justify-between rms-container  ">
        <table className="w-full min-w-max table-auto text-left">
          {/* Use your own markup, customize however you want using the power of Tandiv Table */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header ??
                            header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-end space-x-2 py-4">
          <h5>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()} page(s).
          </h5>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
