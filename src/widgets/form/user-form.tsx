"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import { createUser, updateUser } from "@rms/service/user-service";

import { useRouter } from "next/navigation";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "@rms/hooks/toast-hook";
import Countries from "@rms/lib/country";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  user?: {
    username: string;
    id: number;
    first_name: string;
    last_name: string;
    permissions: $Enums.UserPermission[];
    type: $Enums.UserType;
  };
  roles: Prisma.RoleGetPayload<{}>[];
  value?: Prisma.UserGetPayload<{
    select: {
      username: true;
      role: true;
      id: true;
      first_name: true;
      last_name: true;
      email: true;
      country: true;
      address1: true;
      address2: true;
      gender: true;
      permissions: true;
      phone_number: true;
    };
  }>;
};

export default function UserFormComponent(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    return z.object({
      username: z
        .string()
        .min(4, { message: "Username must be at least 3 characters" }),
      password: props.value ? z.string().min(4).optional() : z.string().min(4),
      first_name: z
        .string()
        .min(3, { message: "First Name must be at least 3 characters" }),
      last_name: z
        .string()
        .min(3, { message: "Last Name must be at least 3 characters" }),
      phone_number: z
        .string()
        .regex(
          new RegExp(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
          ),
          {
            message: "Invalid phone number",
          }
        ),
      gender: z.enum([
        $Enums.Gender.Male,
        $Enums.Gender.Female,
        $Enums.Gender.Other,
      ]),
      address1: z.string().optional().nullable(),
      address2: z.string().optional().nullable(),
      country: z.string(),
      email: z.string().optional().nullable(),
      permissions: z.array(z.enum(Object.keys($Enums.UserPermission) as any)),
      role_id: z.number(),
      status: z
        .enum([
          $Enums.Status.Enable,
          $Enums.Status.Disable,
          $Enums.Status.Deleted,
        ])
        .optional(),
    });
  }, [props.value]);
  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.value,
  });
  const store = useStore();
  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await updateUser(props.value.id, value2).then((res) => {
            store.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await createUser(value2).then((res) => {
            store.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              back();
            }
          });
        });
      }
    },
    [back, store, form, props.value]
  );
  const defaultRole = useMemo(() => {
    const role = props.roles.find((res) => res.id === props.value?.role?.id);
    return role ? { label: role.name, id: role.id } : undefined;
  }, [props.roles]);
  return (
    <form
      className=""
      autoComplete="off"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Card className="max-w-[450px] m-auto p-2">
        <CardHeader title={<Typography variant="h5">User Form</Typography>}>
          {" "}
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Username"
                placeholder="username"
                autoComplete="off"
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                autoComplete="off"
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Password"
                type="password"
                placeholder="password"
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="first_name"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="First Name"
                placeholder="first name"
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="last_name"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Last Name"
                placeholder="last name"
                required
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="phone_number"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                required
                label="Phone Number"
                placeholder="phonen number"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl
                fullWidth
                required
                size="small"
                error={Boolean(fieldState?.error?.message)}
              >
                <InputLabel className="mb-3" shrink placeholder="gender">
                  Gender
                </InputLabel>
                <Select
                  {...field}
                  error={Boolean(fieldState.error)}
                  size="small"
                  label="Gender"
                  notched
                  fullWidth
                  placeholder="gender"
                  defaultValue={field.value}
                >
                  <MenuItem key={-1} value={undefined}>
                    None
                  </MenuItem>

                  {Object.keys($Enums.Gender).map((res) => (
                    <MenuItem key={res} value={res}>
                      {" "}
                      {res}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Email"
                placeholder="email"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />

          <Controller
            name={"role_id"}
            control={form.control}
            render={({ field, fieldState }) => (
              <Autocomplete
                disablePortal
                onChange={(e, v) => {
                  field.onChange(v?.id);
                }}
                defaultValue={props.value?.role}
                size="small"
                getOptionLabel={(e) => e.name}
                options={props.roles}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    InputLabelProps={{ shrink: true }}
                    label="Permissions"
                    placeholder="permissions"
                  />
                )}
              />
            )}
          />

          <Controller
            name={"country"}
            control={form.control}
            render={({ field, fieldState }) => (
              <Autocomplete
                disablePortal
                onChange={(e, v) => {
                  field.onChange(v);
                }}
                isOptionEqualToValue={(e) => e === props.value?.country}
                defaultValue={field.value}
                size="small"
                options={Countries}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    InputLabelProps={{ shrink: true }}
                    label="Country"
                    placeholder="country"
                  />
                )}
              />
            )}
          />
          <Controller
            control={form.control}
            name="address1"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Address 1"
                placeholder="address 1"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="address2"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
                size="small"
                label="Address 2"
                placeholder="address 2"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </CardContent>
        <LoadingButton
          variant="contained"
          fullWidth
          className={
            isPadding
              ? ""
              : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
          }
          disableElevation
          type="submit"
          loading={isPadding}
        >
          Save
        </LoadingButton>
      </Card>
    </form>
  );
}
