// "use client";
// import { Button, Grid, LoadingOverlay, Select, TextInput } from "@mantine/core";
// import { useForm, zodResolver } from "@mantine/form";
// import { Prisma } from "@prisma/client";
// import createNotification from "@rms/lib/notification";
// import { useRouter } from "next/navigation";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useTransition,
// } from "react";
// import styled from "styled-components";
// import { z } from "zod";
// import {
//   createCategory,
//   updateCategory,
// } from "@rms/services/Category/CategoryService";
// import {
//   createSubCategory,
//   updateSubCategory,
// } from "@rms/services/Category/SubCategoryService";

// type Props = {
//   node: "category" | "sub_category";
//   relations?: Prisma.CategoryGetPayload<{}>[];
//   value?: Prisma.CategoryGetPayload<{}> | Prisma.SubCategoryGetPayload<{}>;
// };

// export default function CategoryFormComponent(props: Props) {
//   const [isPadding, setTransition] = useTransition();
//   const { back } = useRouter();
//   const validation = useMemo(() => {
//     const zodObj = {
//       name: z
//         .string()
//         .min(3, { message: "First Name must be at least 3 characters" }),
//     };

//     if (props.node === "sub_category") {
//       zodObj["category_id"] = z
//         .number()
//         .or(z.string().regex(/^\d+$/).transform(Number));
//     }

//     return z.object(zodObj);
//   }, [props.node]);
//   const { getInputProps, onSubmit, setValues, setErrors } = useForm({
//     validate: zodResolver(validation),
//     initialValues: {},
//   });
//   useEffect(() => {
//     setValues(props.value);
//   }, [props.value, props.node]);
//   const handleSubmit = useCallback((values) => {
//     if (values.category_id) {
//       values.category_id = parseInt(values.category_id);
//     }

//     if (props.value) {
//       setTransition(async () => {
//         var value2 = JSON.parse(JSON.stringify(values));
//         switch (props.node) {
//           case "category": {
//             await updateCategory(props.value.id, value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "sub_category": {
//             await updateSubCategory(props.value.id, value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//         }
//       });
//     } else {
//       setTransition(async () => {
//         var value2 = JSON.parse(JSON.stringify(values));
//         switch (props.node) {
//           case "category": {
//             await createCategory(value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "sub_category": {
//             await createSubCategory(value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//         }
//       });
//     }
//   }, []);
//   const ref = useRef<HTMLFormElement>();
//   return (
//     <>
//       <Style className="card" onSubmit={onSubmit(handleSubmit)} ref={ref}>
//         <LoadingOverlay
//           visible={isPadding}
//           overlayBlur={2}
//           w={ref.current?.offsetWidth}
//           top={ref.current?.offsetTop}
//           h={ref.current?.offsetHeight}
//           left={ref.current?.offsetLeft}
//         />
//         <h3>Form {props.node === "category" ? "Category" : "SubCategory"}</h3>
//         <Grid>
//           <Grid.Col xs={12}>
//             <TextInput
//               withAsterisk
//               variant="filled"
//               placeholder="name"
//               label="Name"
//               {...getInputProps("name")}
//             />
//           </Grid.Col>
//           {props.node === "sub_category" && (
//             <Grid.Col xs={12}>
//               <Select
//                 searchable
//                 {...getInputProps("broker_id")}
//                 clearable
//                 variant="filled"
//                 data={
//                   props.relations?.map((res) => ({
//                     value: res.id.toString(),
//                     label: `(${res.id}) ${res.name} `,
//                   })) || []
//                 }
//                 label="Categories"
//                 placeholder="select category"
//               ></Select>
//             </Grid.Col>
//           )}
//         </Grid>
//         <Button color="dark" type="submit" mt={10}>
//           {props.value ? "Update" : "Add"}
//         </Button>
//       </Style>
//     </>
//   );
// }
// const Style = styled.form`
//   max-width: 100%;
//   margin: auto;
//   margin-top: 10px;
//   text-transform: capitalize;
//   h3 {
//     font-weight: bold;
//     font-size: 18pt;
//     margin-bottom: 10px;
//   }
//   max-width: 450px;
// `;
