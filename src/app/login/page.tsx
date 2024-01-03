import LoginWidget from "@rms/widgets/login/login-widget";
import { writeFileSync } from "fs";
import React from "react";

export default async function Login() {
  return (
    <div>
      <LoginWidget />
    </div>
  );
}
