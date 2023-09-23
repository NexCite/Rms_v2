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
// import { deleteCategoryById } from "@rms/services/Category/CategoryService";
// import { deleteSubCategoryById } from "@rms/services/Category/SubCategoryService";

// type Props =
//   | {
//       node: "category";
//       data: Prisma.CategoryGetPayload<{}>[];
//     }
//   | {
//       node: "sub_category";
//       data: Prisma.SubCategoryGetPayload<{}>[];
//     };

// export default function CategoryTableComponent(props: Props) {
//   const pathName = usePathname();
//   const [isPadding, setTransition] = useTransition();
//   const columns = useMemo<
//     MRT_ColumnDef<
//       Prisma.CategoryGetPayload<{}> | Prisma.SubCategoryGetPayload<{}>
//     >[]
//   >(
//     () => [
//       {
//         accessorKey: "id", //simple recommended way to define a column
//         header: "ID",
//       },
//       {
//         accessorKey: "name", //simple recommended way to define a column
//         header: "Name",
//       },
//       {
//         accessorKey: "create_date", //simple recommended way to define a column
//         header: "Create Date",
//         accessorFn: (e) => e.create_date.toLocaleDateString(),
//       },

//       {
//         accessorKey: "modified_date", //simple recommended way to define a column
//         header: "Modified Date",
//         accessorFn: (e) => e.modified_date.toLocaleDateString(),
//       },
//     ],
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
//                 const { id, name } = res.row.original;
//                 const isConfirm = confirm(
//                   `Do You sure you want to delete ${name} id:${id} `
//                 );
//                 if (isConfirm) {
//                   setTransition(async () => {
//                     var result;

//                     switch (props.node) {
//                       case "category": {
//                         result = await deleteCategoryById(id);
//                         break;
//                       }
//                       case "sub_category": {
//                         result = await deleteSubCategoryById(id);
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
//               {props.node === "category" ? "Category" : "SubCategory"} Table
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
