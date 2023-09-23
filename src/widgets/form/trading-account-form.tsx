// "use client";
// import {
//   Button,
//   Grid,
//   LoadingOverlay,
//   NumberInput,
//   Select,
//   TextInput,
// } from "@mantine/core";
// import { useForm, zodResolver } from "@mantine/form";
// import { Gender, Prisma } from "@prisma/client";
// import Countries from "@rms/assets/country";
// import createNotification from "@rms/lib/notification";
// import {
//   createAccount,
//   updateAccount,
// } from "@rms/services//Trading/AccountService";
// import {
//   createTrader,
//   updateTrader,
// } from "@rms/services/Trading/TraderService";
// import {
//   createBroker,
//   updateBroker,
// } from "@rms/services/Trading/BrokerService";
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

// type Props = {
//   node: "account" | "broker" | "trader";
//   relations?: {
//     traders: Prisma.TraderGetPayload<{}>[];
//     currencies: Prisma.CurrencyGetPayload<{}>[];
//     brokers: Prisma.BrokerGetPayload<{}>[];
//   };
//   value?:
//     | Prisma.AccountGetPayload<{}>
//     | Prisma.BrokerGetPayload<{}>
//     | Prisma.TraderGetPayload<{}>;
// };

// export default function AccountFormComponent(props: Props) {
//   const [isPadding, setTransition] = useTransition();
//   const { back } = useRouter();
//   const validation = useMemo(() => {
//     switch (props.node) {
//       case "trader":
//       case "broker": {
//         return z.object({
//           first_name: z
//             .string()
//             .min(3, { message: "First Name must be at least 3 characters" }),
//           last_name: z
//             .string()
//             .min(3, { message: "Last Name must be at least 3 characters" }),
//           username: z
//             .string()
//             .min(3, { message: "Username must be at least 3 characters" }),
//           phone_number: z
//             .string()
//             .regex(
//               new RegExp(
//                 /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
//               ),
//               {
//                 message: "Invalid phone number",
//               }
//             ),
//           gender: z.enum([Gender.Male, Gender.Female]),
//           address1: z.string().optional().nullable(),
//           address2: z.string().optional().nullable(),
//           country: z.string(),
//           email: z.string().optional().nullable(),
//           [props.node === "trader" ? "broker_id" : "id"]: z
//             .number()
//             .or(z.string().regex(/^\d+$/).transform(Number)),
//         });
//       }
//       case "account": {
//         return z.object({
//           id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
//           username: z
//             .string()
//             .min(3, { message: "Username must be at least 3 characters" }),
//           trader_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
//         });
//       }
//     }
//   }, [props.node]);
//   const { getInputProps, onSubmit, setValues, setErrors } = useForm({
//     validate: zodResolver(validation),
//     initialValues: {},
//   });
//   useEffect(() => {
//     setValues(props.value);
//   }, [props.value, props.node]);
//   const handleSubmit = useCallback((values) => {
//     if (values.currency_id) {
//       values.currency_id = parseInt(values.currency_id);
//     }
//     if (values.broker_id) {
//       values.broker_id = parseInt(values.broker_id);
//     }
//     if (values.trader_id) {
//       values.trader_id = parseInt(values.trader_id);
//     }

//     if (props.value) {
//       setTransition(async () => {
//         var value2 = JSON.parse(JSON.stringify(values));
//         switch (props.node) {
//           case "broker": {
//             await updateBroker(props.value.id, value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "account": {
//             await updateAccount(props.value.id, value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "trader": {
//             await updateTrader(props.value.id, value2).then((res) => {
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
//           case "broker": {
//             await createBroker(value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "account": {
//             await createAccount(value2).then((res) => {
//               createNotification(res);
//               setErrors(res.errors);
//               if (res.status === 200) {
//                 back();
//               }
//             });
//             break;
//           }
//           case "trader": {
//             await createTrader(value2).then((res) => {
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
//         <h3>
//           Form{" "}
//           {props.node === "broker"
//             ? "Broker"
//             : props.node === "account"
//             ? "Account"
//             : "Trader"}
//         </h3>
//         <Grid>
//           {(props.node === "account" || props.node === "broker") && (
//             <Grid.Col xs={12}>
//               <NumberInput
//                 withAsterisk
//                 placeholder="id"
//                 variant="filled"
//                 label="ID"
//                 {...getInputProps("id")}
//               />
//             </Grid.Col>
//           )}
//           <Grid.Col xs={12}>
//             <TextInput
//               withAsterisk
//               variant="filled"
//               placeholder="username"
//               label="Username"
//               {...getInputProps("username")}
//             />
//           </Grid.Col>
//           {(props.node === "trader" || props.node === "broker") && (
//             <>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   withAsterisk
//                   variant="filled"
//                   placeholder="first Name"
//                   label="First Name"
//                   {...getInputProps("first_name")}
//                 />
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   withAsterisk
//                   variant="filled"
//                   placeholder="last Name"
//                   label="Last Name"
//                   {...getInputProps("last_name")}
//                 />
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   withAsterisk
//                   variant="filled"
//                   placeholder="phone Number"
//                   label="Phone Number"
//                   type="number"
//                   {...getInputProps("phone_number")}
//                 />
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <Select
//                   searchable
//                   {...getInputProps("gender")}
//                   withAsterisk
//                   clearable
//                   variant="filled"
//                   data={Object.keys(Gender)}
//                   label="Gender"
//                   placeholder="gender"
//                 ></Select>
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   variant="filled"
//                   placeholder="email"
//                   label="Email"
//                   {...getInputProps("email")}
//                 />
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <Select
//                   searchable
//                   {...getInputProps("country")}
//                   withAsterisk
//                   clearable
//                   variant="filled"
//                   data={Countries}
//                   label="Country"
//                   placeholder="country"
//                 ></Select>
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   variant="filled"
//                   placeholder="address 1"
//                   label="Address 1"
//                   {...getInputProps("address1")}
//                 />
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <TextInput
//                   variant="filled"
//                   placeholder="address 2"
//                   label="Address 2"
//                   {...getInputProps("address2")}
//                 />
//               </Grid.Col>
//             </>
//           )}
//           {props.node === "account" && (
//             <>
//               <Grid.Col xs={12}>
//                 <Select
//                   searchable
//                   {...getInputProps("trader_id")}
//                   clearable
//                   variant="filled"
//                   data={
//                     props.relations?.traders?.map((res) => ({
//                       value: res.id.toString(),
//                       label: `(${res.id}) ${res.username} `,
//                     })) || []
//                   }
//                   label="Traders"
//                   placeholder="select trader"
//                 ></Select>
//               </Grid.Col>
//               <Grid.Col xs={12}>
//                 <Select
//                   searchable
//                   {...getInputProps("currency_id")}
//                   clearable
//                   variant="filled"
//                   data={
//                     props.relations?.currencies?.map((res) => ({
//                       value: res.id.toString(),
//                       label: `(${res.symbol}) ${res.name} `,
//                     })) || []
//                   }
//                   label="Currencies"
//                   placeholder="select currency"
//                 ></Select>
//               </Grid.Col>
//             </>
//           )}
//           {props.node === "trader" && (
//             <Grid.Col xs={12}>
//               <Select
//                 searchable
//                 {...getInputProps("broker_id")}
//                 clearable
//                 variant="filled"
//                 data={
//                   props.relations?.brokers?.map((res) => ({
//                     value: res.id.toString(),
//                     label: `(${res.id}) ${res.username} `,
//                   })) || []
//                 }
//                 label="Brokers"
//                 placeholder="select broker"
//               ></Select>
//             </Grid.Col>
//           )}
//         </Grid>
//         <Button className="bg-black" color="dark" type="submit" mt={10}>
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
