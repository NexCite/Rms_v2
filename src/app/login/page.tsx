import LoginWidget from "@rms/widgets/login/login-widget";
import { writeFileSync } from "fs";
import React from "react";
const ZKJUBAER = require("zk-jubaer");

export default async function Login() {
  return (
    <div>
      <LoginWidget />
    </div>
  );
}
