import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { TriangleAlertIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

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

interface SignInCardProps {
  setFlow: (flow: SignInFlow) => void;
}

export const SignInCard = ({ setFlow }: SignInCardProps) => {
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleProviderSignIn = (value: "github" | "google") => {
    setPending(true);
    signIn(value).finally(() => {
      setPending(false);
    });
  };

  const handlePasswordSignIn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    signIn("password", { email, password, flow: "signIn" })
      .catch(() => {
        setError("Invalid email or password");
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <Card className="p-8 w-full h-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="flex gap-x-2 items-center p-3 mb-6 text-sm rounded-md bg-destructive/15 text-destructive">
          <TriangleAlertIcon className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="px-0 pb-0 space-y-5">
        <form className="space-y-2.5" onSubmit={handlePasswordSignIn}>
          <Input
            disabled={pending}
            placeholder="Email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            disabled={pending}
            placeholder="Password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" disabled={pending} size="lg" type="submit">
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            className="relative w-full"
            disabled={pending}
            size="lg"
            variant="outline"
            onClick={() => handleProviderSignIn("google")}
          >
            <FcGoogle className="absolute left-3 size-5" />
            Continue with Google
          </Button>
          <Button
            className="relative w-full"
            disabled={pending}
            size="lg"
            variant="outline"
            onClick={() => handleProviderSignIn("github")}
          >
            <FaGithub className="absolute left-3 size-5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <span
            className="text-sky-700 cursor-pointer hover:underline"
            onClick={() => setFlow("signUp")}
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
