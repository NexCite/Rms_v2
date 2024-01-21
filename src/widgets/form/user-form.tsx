"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";
import { createUser, updateUser } from "@rms/service/user-service";

import { usePathname, useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import NexCiteButton from "@rms/components/button/nexcite-button";
import { useToast } from "@rms/hooks/toast-hook";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type Props = {
  user?: {
    username: string;
    id: number;
    first_name: string;
    last_name: string;
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
      role_id: true;
    };
  }>;
};

export default function UserFormComponent(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back, replace } = useRouter();
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
  const toast = useToast();
  const watch = useWatch({ control: form.control });
  const pathName = usePathname();

  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await updateUser(props.value.id, value2).then((res) => {
            toast.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
            }
          });
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));

          await createUser(value2).then((res) => {
            toast.OpenAlert(res);
            Object.keys(res.errors ?? []).map((e) => {
              form.setError(e as any, res[e]);
            });

            if (res.status === 200) {
              replace(pathName + "?id=" + res.result.id);
            }
          });
        });
      }
    },
    [props.value, toast, form, replace, pathName]
  );

  return (
    <form
      className="max-w-[450px] m-auto"
      autoComplete="off"
      noValidate
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Card variant="outlined">
        <CardContent className="flex flex-col gap-5">
          <Typography>User Form</Typography>
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Username</FormLabel>
                <Input
                  placeholder="username"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="password"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="first_name"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>First Name</FormLabel>
                <Input
                  placeholder="first name"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="last_name"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Last Name</FormLabel>
                <Input
                  placeholder="last name"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                  }}
                />
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name={"role_id"}
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl>
                <FormLabel required>Role</FormLabel>
                <Select
                  value={field.value}
                  onChange={(e, v) => {
                    field.onChange(v);
                  }}
                >
                  {props.roles.map((res, i) => (
                    <Option value={res.id} key={i}>
                      {res.name}
                    </Option>
                  ))}
                </Select>{" "}
                <FormHelperText> {fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </CardContent>
        <NexCiteButton isPadding={isPadding} />
      </Card>
    </form>
  );
}
