"use client";
import React, { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { createLogin } from "@rms/service/login-service";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
} from "@mui/material";
import { useToast } from "@rms/hooks/toast-hook";
import { useRouter } from "next/navigation";
const formSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
});
export default function ConfigWidget() {
  const [isPadding, setTransition] = useTransition();
  const { replace } = useRouter();
  const toast = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    setTransition(async () => {
      const req = await createLogin(values);

      toast.OpenAlert({ ...req });
      if (req.status == 200) {
        replace("/admin");
      }
    });
  }

  return (
    <div className="flex justify-center items-center m-7">
      <Card className="w-[350px]">
        <CardHeader
          title={
            <div>
              <Typography variant="h4">Welcome Back!</Typography>
              <Typography variant="h6">Login</Typography>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 flex flex-col gap-5"
          >
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <TextField
                  fullWidth
                  size="small"
                  label="Username"
                  placeholder="username"
                  InputLabelProps={{ shrink: true }}
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  label="Password"
                  fullWidth
                  type="password"
                  size="small"
                  placeholder="password"
                  InputLabelProps={{ shrink: true }}
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
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
                    : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
                }
                disableElevation
                type="submit"
                loading={isPadding}
              >
                Login
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
