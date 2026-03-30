import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { SignInFlow } from "../types";

interface SignUpCardProps {
  setFlow: (flow: SignInFlow) => void;
}

export const SignUpCard = ({ setFlow }: SignUpCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Card className="p-8 w-full h-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-5">
        <form className="space-y-2.5">
          <Input
            disabled={false}
            placeholder="Email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            disabled={false}
            placeholder="Password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            disabled={false}
            placeholder="Confirm password"
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button className="w-full" disabled={false} size="lg" type="submit">
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            className="relative w-full"
            disabled={false}
            size="lg"
            variant="outline"
            onClick={() => {}}
          >
            <FcGoogle className="absolute left-3 size-5" />
            Continue with Google
          </Button>
          <Button
            className="relative w-full"
            disabled={false}
            size="lg"
            variant="outline"
            onClick={() => {}}
          >
            <FaGithub className="absolute left-3 size-5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <span
            className="cursor-pointer text-sky-700 hover:underline"
            onClick={() => setFlow("signIn")}
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
