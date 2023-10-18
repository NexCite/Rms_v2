"use client";
import { useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import LoadingButton from "@mui/lab/LoadingButton";
import { Card, CardContent, CardHeader, TextField } from "@mui/material";
import { useStore } from "@rms/hooks/toast-hook";
import { createConfig } from "@rms/service/config-service";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import UploadWidget from "../upload/upload-widget";
const formSchema = z.object({
  name: z.string().min(3),
  logo: z.string().min(3),
  first_name: z.string().min(3),
  last_name: z.string().min(3),
  phone_number: z
    .string()
    .regex(
      new RegExp(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),
      {
        message: "Invalid phone number",
      }
    ),
  email: z.string().email(),
  username: z.string().min(4),
  password: z.string().min(4),
});
export default function ConfigWidget() {
  const [isPadding, setTransition] = useTransition();
  const store = useStore();
  const { replace } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  function onSubmit(values) {
    setTransition(async () => {
      const res = await createConfig(values);
      store.OpenAlert({ ...res });

      if (res.status === 200) replace("/login");
      Object.keys(res.errors ?? []).map((e) => {
        form.setError(e as any, res[e]);
      });
    });
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-[350px] overflow-y-auto mt-3  max-h-[100vh] ">
        <CardHeader
          title={
            <div>
              <h1>Setup New Project</h1>
              <h5>create project</h5>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"App Name"}
                  placeholder="app name"
                  size="small"
                  fullWidth
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
                  label={"First Name"}
                  placeholder="first name"
                  size="small"
                  fullWidth
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
                  label={"Last Name"}
                  placeholder="last name"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Username"}
                  placeholder="username"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Password"}
                  placeholder="password"
                  type="password"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
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
                  label={"Email"}
                  placeholder="email"
                  size="small"
                  fullWidth
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
                  label={"Phone Number"}
                  placeholder="phone number"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="logo"
              render={({ field, fieldState }) => (
                <UploadWidget
                  isLogo
                  onSave={(e) => {
                    form.setValue("logo", e ?? "");
                    form.clearErrors("logo");
                  }}
                />
              )}
            />

            <div className="flex justify-end">
              <LoadingButton
                variant="contained"
                fullWidth
                className={
                  isPadding
                    ? ""
                    : "hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white "
                }
                disableElevation
                type="submit"
                loading={isPadding}
              >
                Save
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
