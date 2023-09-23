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
// import { deleteAccountById } from "@rms/services/Trading/AccountService";
// import { deleteBrokerById } from "@rms/services/Trading/BrokerService";
// import { deleteTraderById } from "@rms/services/Trading/TraderService";

// type Props =
//   | {
//       node: "account";
//       data: Prisma.AccountGetPayload<{ include: { trader: true } }>[];
//     }
//   | {
//       node: "trader";
//       data: Prisma.TraderGetPayload<{ include: { broker: true } }>[];
//     }
//   | {
//       node: "broker";
//       data: Prisma.BrokerGetPayload<{}>[];
//     };

// export default function AccountTableComponent(props: Props) {
//   const pathName = usePathname();
//   const [isPadding, setTransition] = useTransition();
//   const columns = useMemo<
//     MRT_ColumnDef<
//       | Prisma.BrokerGetPayload<{}>
//       | Prisma.TraderGetPayload<{}>
//       | Prisma.AccountGetPayload<{}>
//     >[]
//   >(
//     () =>
//       [
//         {
//           accessorKey: "id", //simple recommended way to define a column
//           header: "ID",
//         },
//         {
//           accessorKey: "username", //simple recommended way to define a column
//           header: "UserName",
//         },
//       ]
//         .concat(
//           props.node !== "account"
//             ? [
//                 {
//                   accessorKey: "first_name", //simple recommended way to define a column
//                   header: "First Name",
//                 },
//                 {
//                   accessorKey: "last_name", //simple recommended way to define a column
//                   header: "Last Name",
//                 },
//                 {
//                   accessorKey: "phone_number", //simple recommended way to define a column
//                   header: "Phone number",
//                 },
//                 {
//                   accessorKey: "email", //simple recommended way to define a column
//                   header: "Email",
//                 },
//                 {
//                   accessorKey: "gender", //simple recommended way to define a column
//                   header: "Gender",
//                 },
//                 {
//                   accessorKey: "country", //simple recommended way to define a column
//                   header: "Country",
//                 },
//                 {
//                   accessorKey: "address1", //simple recommended way to define a column
//                   header: "Address 1",
//                 },
//                 {
//                   accessorKey: "address2", //simple recommended way to define a column
//                   header: "Address 2",
//                 },
//               ]
//             : ([] as any)
//         )
//         .concat(
//           props.node !== "broker"
//             ? [
//                 {
//                   accessorKey:
//                     props.node === "trader"
//                       ? "trader.username"
//                       : "broker.username",
//                   header: props.node === "trader" ? "Trader" : "Broker",
//                 },
//               ]
//             : []
//         )
//         .concat([
//           {
//             accessorKey: "create_date", //simple recommended way to define a column
//             header: "Create Date",
//             accessorFn: (e) => e.create_date.toLocaleDateString(),
//           },

//           {
//             accessorKey: "modified_date", //simple recommended way to define a column
//             header: "Modified Date",
//             accessorFn: (e) => e.modified_date.toLocaleDateString(),
//           },
//         ] as any) as any,
//     []
//   );
//   const table = useMantineReactTable({
//     columns: columns,
//     data: props.data,
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
//                 const { id, username } = res.row.original;
//                 const isConfirm = confirm(
//                   `Do You sure you want to delete ${username} id:${id} `
//                 );
//                 if (isConfirm) {
//                   setTransition(async () => {
//                     var result;

//                     switch (props.node) {
//                       case "account": {
//                         result = await deleteAccountById(id);
//                         break;
//                       }
//                       case "broker": {
//                         result = await deleteBrokerById(id);
//                         break;
//                       }
//                       case "trader": {
//                         result = await deleteTraderById(id);
//                         break;
//                       }
//                     }

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
//               {props.node === "account"
//                 ? "Account"
//                 : props.node === "broker"
//                 ? "Broker"
//                 : "Trader"}{" "}
//               Table
//             </Title>
//           </Flex>
//           <Link href={{ pathname: pathName + "/form", query: {} }}>
//             <Button className="bg-black" color="dark">
//               Add
//             </Button>
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
