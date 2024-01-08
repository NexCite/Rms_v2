// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { $Enums, Prisma } from "@prisma/client";

// import {
//   Autocomplete,
//   Card,
//   CardContent,
//   CardHeader,
//   FormControl,
//   FormHelperText,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import NexCiteButton from "@rms/components/button/nexcite-button";
// import { useToast } from "@rms/hooks/toast-hook";
// import { fileZod, mediaZod } from "@rms/lib/common";
// import { createVacation, updateVacation } from "@rms/service/vacation-service";
// import dayjs from "dayjs";
// import { MuiFileInput } from "mui-file-input";
// import { useRouter } from "next/navigation";
// import { useCallback, useMemo, useState, useTransition } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { MdAttachFile, MdClose } from "react-icons/md";
// import { z } from "zod";

// interface Props {
//   id?: number;
//   isEditMode?: boolean;
//   employees?: Prisma.EmployeeGetPayload<{
//     select: {
//       first_name: true;
//       last_name: true;
//       id: true;
//     };
//   }>[];
//   value: Prisma.VacationGetPayload<{ include: { media: true } }>;
// }

// export default function VacationForm(props: Props) {
//   const [isPadding, setTransition] = useTransition();
//   const { back } = useRouter();
//   const validation = useMemo(() => {
//     return z.object({
//       description: z
//         .string()
//         .min(1, { message: "Description must be at least 1 characters" })
//         .optional(),
//       from_date: z.date(),
//       to_date: z.date(),
//       employee_id: z.number().or(z.string().regex(/^\d+$/).transform(Number)),
//       type: z.enum(Object.keys($Enums.VacationType) as any),
//       status: z
//         .enum([
//           $Enums.Status.Enable,
//           $Enums.Status.Disable,
//           $Enums.Status.Deleted,
//         ])
//         .optional(),
//       media: mediaZod.optional().nullable(),
//       file: fileZod.optional().nullable(),
//     });
//   }, []);

//   const form = useForm<z.infer<typeof validation>>({
//     resolver: zodResolver(validation),
//     defaultValues: {
//       description: props.value?.description ?? "",
//       employee_id: props.value?.employee_id,
//       from_date: props.value?.from_date ?? dayjs().startOf("D").toDate(),
//       to_date: props.value?.to_date ?? dayjs().endOf("D").toDate(),
//       type: props.value?.type,
//       media: props.value?.media,
//     },
//   });

//   const [media, setMedia] = useState<Prisma.MediaGetPayload<{}>>();
//   const [error, setError] = useState("");

//   const toast = useToast();
//   const handleSubmit = useCallback(
//     (values: z.infer<any>) => {
//       const fileForm = values.file ? new FormData() : undefined;

//       fileForm?.append("file", values.file);
//       delete values.file;
//       delete values.media;

//       if (props.value) {
//         setTransition(async () => {
//           var value2 = JSON.parse(JSON.stringify({ ...values, media }));

//           await updateVacation(props.value.id, value2).then((res) => {
//             toast.OpenAlert(res);
//             Object.keys(res.errors ?? []).map((e) => {
//               form.setError(e as any, res[e]);
//             });

//             if (res.status === 200) {
//               back();
//             }
//           });
//         });
//       } else {
//         setTransition(async () => {
//           var value2 = JSON.parse(JSON.stringify({ ...values, media }));

//           await createVacation(value2, fileForm).then((res) => {
//             toast.OpenAlert(res);
//             Object.keys(res.errors ?? []).map((e) => {
//               form.setError(e as any, res[e]);
//             });

//             if (res.status === 200) {
//               back();
//             }
//           });
//         });
//       }
//     },
//     [back, toast, form, props.value]
//   );
//   return (
//     <>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <form
//           className=""
//           autoComplete="off"
//           noValidate
//           onSubmit={form.handleSubmit(handleSubmit)}
//         >
//           <Card className="max-w-[450px] m-auto p-2">
//             <CardHeader
//               title={<Typography variant="h5">Vacation Form</Typography>}
//             >
//               {" "}
//             </CardHeader>

//             <CardContent className="flex flex-col gap-5">
//               {error && (
//                 // <Alert color="red" className="mb-10" variant="destructive">
//                 //   <h4>{error}</h4>
//                 // </Alert>
//               )}
//               <Controller
//                 control={form.control}
//                 name="description"
//                 render={({ field, fieldState }) => (
//                   <TextField
//                     {...field}
//                     required
//                     multiline
//                     minRows={3}
//                     maxRows={5}
//                     error={Boolean(fieldState.error)}
//                     label="Description"
//                     size="small"
//                     InputLabelProps={{ shrink: true }}
//                     fullWidth
//                     value={field.value}
//                     helperText={fieldState?.error?.message}
//                   />
//                 )}
//               />

//               <Controller
//                 control={form.control}
//                 name={"from_date"}
//                 render={({ field, fieldState }) => (
//                   <FormControl {...field}>
//                     <DateTimePicker
//                       minDate={dayjs().subtract(7, "day")}
//                       label="From DateTime"
//                       slotProps={{
//                         textField: {
//                           InputLabelProps: { shrink: true },
//                           size: "small",
//                           required: true,
//                           error: Boolean(fieldState?.error),
//                           helperText: fieldState?.error?.message,
//                         },
//                       }}
//                       defaultValue={dayjs(field.value)}
//                       onChange={(e) => {
//                         field.onChange(e?.toDate());
//                       }}
//                     />
//                   </FormControl>
//                 )}
//               />

//               <Controller
//                 control={form.control}
//                 name={"to_date"}
//                 render={({ field, fieldState }) => (
//                   <FormControl {...field}>
//                     <DateTimePicker
//                       minDate={dayjs().subtract(7, "day")}
//                       label="To DateTime"
//                       slotProps={{
//                         textField: {
//                           InputLabelProps: { shrink: true },
//                           size: "small",
//                           required: true,
//                           error: Boolean(fieldState?.error),
//                           helperText: fieldState?.error?.message,
//                         },
//                       }}
//                       defaultValue={dayjs(field.value)}
//                       onChange={(e) => {
//                         field.onChange(e?.toDate());
//                       }}
//                     />
//                   </FormControl>
//                 )}
//               />

//               <Controller
//                 name="type"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <FormControl
//                     fullWidth
//                     required
//                     size="small"
//                     error={Boolean(fieldState?.error?.message)}
//                   >
//                     {/* <InputLabel className="mb-3" shrink placeholder="type"> */}
//                       Type
//                     </InputLabel>
//                     <Select
//                       {...field}
//                       error={Boolean(fieldState.error)}
//                       size="small"
//                       label="Type"
//                       notched
//                       fullWidth
//                       placeholder="type"
//                       defaultValue={field.value}
//                     >
//                       <MenuItem key={-1} value={undefined}>
//                         None
//                       </MenuItem>

//                       {Object.keys($Enums.VacationType).map((res) => (
//                         <MenuItem key={res} value={res}>
//                           {" "}
//                           {res}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     <FormHelperText>{fieldState.error?.message}</FormHelperText>
//                   </FormControl>
//                 )}
//               />

//               <Controller
//                 name={"employee_id"}
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Autocomplete
//                     disablePortal
//                     onChange={(e, v) => {
//                       field.onChange(v?.value);
//                     }}
//                     isOptionEqualToValue={(e) => e.value === props.value?.id}
//                     defaultValue={(() => {
//                       const result = props.employees.find(
//                         (res) => res.id === field.value
//                       );

//                       return result
//                         ? {
//                             label: `(${result.id}) ${result.first_name} ${result.last_name}`,
//                             value: result.id,
//                           }
//                         : undefined;
//                     })()}
//                     size="small"
//                     options={props.employees.map((res) => ({
//                       label: `(${res.id}) ${res.first_name} ${res.last_name}`,
//                       value: res.id,
//                     }))}
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         required
//                         error={Boolean(fieldState.error)}
//                         helperText={fieldState.error?.message}
//                         InputLabelProps={{ shrink: true }}
//                         label="Employee"
//                         placeholder="employee"
//                       />
//                     )}
//                   />
//                 )}
//               />

//               {/* {
//                 props.isEditMode && props.isAdmin && (

//               <Controller
//               name={"status"}
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Autocomplete
//                   disablePortal
//                   onChange={(e, v) => {
//                     field.onChange(v);
//                   }}
//                   isOptionEqualToValue={(e) => e === props.value?.id}
//                   defaultValue={''}
//                   size="small"
//                   options={[
//                     $Enums.Status.Enable,
//                     $Enums.Status.Disable,
//                     $Enums.Status.Deleted,
//                   ]}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       required
//                       error={Boolean(fieldState.error)}
//                       helperText={fieldState.error?.message}
//                       InputLabelProps={{ shrink: true }}
//                       label="Status"
//                       placeholder="status"
//                     />
//                   )}
//                 />
//               )}
//             />

//                 )
//               } */}

//               <div>
//                 <Controller
//                   control={form.control}
//                   name="file"
//                   render={({ field, fieldState }) => (
//                     <>
//                       <MuiFileInput
//                         {...field}
//                         value={field.value}
//                         label={"Append File"}
//                         clearIconButtonProps={{
//                           children: <MdClose fontSize="small" />,
//                         }}
//                         error={Boolean(fieldState.error)}
//                         helperText={fieldState?.error?.message}
//                         InputProps={{
//                           inputProps: {
//                             accept: ".pdf",
//                           },
//                           startAdornment: <MdAttachFile />,
//                         }}
//                       />
//                     </>
//                   )}
//                 />
//               </div>
//             </CardContent>
//             <NexCiteButton isPadding={isPadding} />
//           </Card>
//         </form>
//       </LocalizationProvider>
//     </>
//   );
// }
