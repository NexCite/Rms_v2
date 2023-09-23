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
// import { Currency, DidgitType, DebitCreditType, Prisma } from "@prisma/client";

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
// import BackButtonComponent from "../../BackButtonComponent";
// import {
//   createCurrency,
//   updateCurrency,
// } from "@rms/services/Config/CurrencyService";

// type Props = {
//   currency?: Currency;
// };
// export default function SettingCurrencyFormComponent(props: Props) {
//   const [isPadding, setTransition] = useTransition();
//   const { back } = useRouter();
//   const validation = useMemo(
//     () =>
//       z.object({
//         name: z.string().min(1),
//         symbol: z.string().min(1),
//       }),
//     []
//   );
//   const {
//     errors,
//     getInputProps,
//     onSubmit,
//     setValues,
//     setFieldValue,
//     setErrors,
//   } = useForm({
//     validate: zodResolver(validation),
//     initialValues: {},
//   });
//   useEffect(() => {
//     setValues(props.currency);
//   }, [props.currency]);
//   const handleSubmit = useCallback((values: Currency) => {
//     if (props.currency) {
//       setTransition(async () => {
//         updateCurrency({ where: { id: props.currency.id }, data: values }).then(
//           (res) => {
//             createNotification(res);
//             setErrors(res.errors);
//             if (res.status === 200) {
//               back();
//             }
//           }
//         );
//       });
//     } else {
//       createCurrency({ data: values }).then((res) => {
//         createNotification(res);
//         setErrors(res.errors);
//         if (res.status === 200) {
//           back();
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
//         <h3>Form Currency</h3>
//         <Grid>
//           <Grid.Col xs={12}>
//             <TextInput
//               withAsterisk
//               variant="filled"
//               label="Name"
//               placeholder="name"
//               {...getInputProps("name")}
//             />
//           </Grid.Col>
//           <Grid.Col xs={12}>
//             <TextInput
//               withAsterisk
//               variant="filled"
//               label="Symbol"
//               placeholder="symbol"
//               {...getInputProps("symbol")}
//             />
//           </Grid.Col>
//         </Grid>
//         <Button color="dark" type="submit" mt={10}>
//           {props.currency ? "Update" : "Add"}
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
//   }
//   max-width: 450px;
// `;
