"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useMemo, useRef, useState, useTransition } from "react";
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
  PaginationState,
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
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@rms/components/ui/table";
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
import { deleteCurrency } from "@rms/service/currency-service";
import Authorized from "@rms/components/ui/authorized";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();

  const columns = useMemo<ColumnDef<Prisma.CurrencyGetPayload<{}>>[]>(
    () => [
      {
        accessorKey: "action",
        cell(originalRow) {
          const { id, name } = originalRow.row.original;

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
                  <Authorized permission="Edit_Currency">
                    <DropdownMenuItem
                      onClick={() => push(pathName + "/form?id=" + id)}
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Authorized>
                  <Authorized permission="Delete_Currency">
                    <DropdownMenuItem
                      disabled={isActive}
                      className="cursor-pointer"
                      onClick={() => {
                        const isConfirm = confirm(
                          `Do You sure you want to delete ${name} id:${id} `
                        );
                        if (isConfirm) {
                          setActiveTransition(async () => {
                            const result = await deleteCurrency(id);
                            createAlert(result);
                          });
                        }
                      }}
                    >
                      {isActive ? <> deleting...</> : "Delete"}
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
              original.create_date.toLocaleTimeString() !==
              original.modified_date.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "symbol", header: "Symbol" },
      {
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },
    ],
    [createAlert, isActive, pathName, push]
  );
  const table = useReactTable({
    data: props.currencies,
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
        <h1>Result: {props.currencies.length}</h1>
      </div>
      <div className="max-w-xs">
        <Input
          placeholder="search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Using Vanilla Mantine Table component here */}
      <div className="p-2">
        <Table>
          {/* Use your own markup, customize however you want using the power of Tandiv Table */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ minWidth: "200px" }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header ??
                            header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

// "use client";
// import {
//   Button,
//   Flex,
//   Menu,
//   ScrollArea,
//   Stack,
//   Table,
//   Title,
// } from "@mantine/core";
// import createNotification from "@rms/lib/notification";

// import {
//   MRT_ColumnDef,
//   MRT_GlobalFilterTextInput,
//   MRT_TablePagination,
//   MRT_ToolbarAlertBanner,
//   flexRender,
//   useMantineReactTable,
// } from "mantine-react-table";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React, { useMemo, useTransition } from "react";
// import styled from "styled-components";
// import { Prisma } from "@prisma/client";
// import { deleteCurrencyById } from "@rms/services/Config/CurrencyService";

// type Props = {
//   currencies: Prisma.CurrencyGetPayload<{}>[];
// };

// export default function SettingCurrencyTableComponent(props: Props) {
//   const pathName = usePathname();
//   const [isPadding, setTransition] = useTransition();
//   const columns = useMemo<MRT_ColumnDef<Prisma.CurrencyGetPayload<{}>>[]>(
//     () => [
//       {
//         accessorKey: "id",
//         header: "ID",
//       },
//       {
//         accessorKey: "name",
//         header: "Name",
//       },
//       {
//         accessorKey: "symbol",
//         header: "Symbol",
//       },

//       {
//         accessorKey: "create_date",
//         header: "Create Date",
//         accessorFn: (e) => e.create_date.toLocaleDateString(),
//       },

//       {
//         accessorKey: "modified_date",
//         header: "Modified Date",
//         accessorFn: (e) => e.modified_date.toLocaleDateString(),
//       },
//     ],
//     []
//   );
//   const table = useMantineReactTable({
//     columns: columns,
//     data: props.currencies,
//     enableStickyHeader: true,
//     enableRowActions: true,

//     state: { isLoading: isPadding, showGlobalFilter: true },
//     renderRowActionMenuItems: (res) => {
//       return (
//         <>
//           <Menu>
//             <Link
//               style={{ textDecoration: "none", color: "black" }}
//               href={{
//                 pathname: pathName + "/form",
//                 query: {
//                   id: res.row.original.id,
//                 },
//               }}
//             >
//               <Menu.Item>Edit</Menu.Item>
//             </Link>

//             <Menu.Item
//               onClick={() => {
//                 const { id, name } = res.row.original;
//                 const isConfirm = confirm(
//                   `Do You sure you want to delete ${name} id:${id} `
//                 );
//                 if (isConfirm) {
//                   setTransition(async () => {
//                     var result = await deleteCurrencyById(id);
//                     createNotification(result);
//                   });
//                 }
//               }}
//             >
//               Delete
//             </Menu.Item>
//           </Menu>
//         </>
//       );
//     },
//   });

//   return (
//     <Style>
//       <Stack>
//         <Flex align={"center"} gap={5} justify={"space-between"}>
//           <Flex align={"center"} gap={5}>
//             <Title order={2} style={{ textTransform: "capitalize" }}>
//               Account Table
//             </Title>
//           </Flex>
//           <Link href={{ pathname: pathName + "/form", query: {} }}>
//             <Button color="dark">Add</Button>
//           </Link>
//         </Flex>
//         <Flex justify="space-between" align="center">
//           <MRT_GlobalFilterTextInput table={table} />
//         </Flex>
//         {/* Using Vanilla Mantine Table component here */}
//         <ScrollArea w={"100%"} scrollHideDelay={0}>
//           <Table
//             captionSide="top"
//             fontSize="md"
//             highlightOnHover
//             horizontalSpacing="xl"
//             striped
//             verticalSpacing="xs"
//             withBorder
//             withColumnBorders
//             m="0"
//           >
//             {/* Use your own markup, customize however you want using the power of TanStack Table */}
//             <thead>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <th key={header.id} style={{ minWidth: "200px" }}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.Header ??
//                               header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody>
//               {table.getRowModel().rows.map((row) => (
//                 <tr key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <td key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.Cell ??
//                           cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </ScrollArea>
//         <Flex justify={"end"}>
//           <MRT_TablePagination table={table} />
//         </Flex>
//         <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
//       </Stack>
//     </Style>
//   );
// }
// const Style = styled.div``;
