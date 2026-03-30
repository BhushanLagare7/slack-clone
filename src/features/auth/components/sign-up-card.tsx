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

interface SignUpCardProps {
  setFlow: (flow: SignInFlow) => void;
}

export const SignUpCard = ({ setFlow }: SignUpCardProps) => {
  const { signIn } = useAuthActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleProviderSignUp = (value: "github" | "google") => {
    setPending(true);
    signIn(value).finally(() => {
      setPending(false);
    });
  };

  const handlePasswordSignUp = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    signIn("password", { name, email, password, flow: "signUp" })
      .catch(() => {
        setError("Something went wrong");
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <Card className="p-8 w-full h-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign up to continue</CardTitle>
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
        <form className="space-y-2.5" onSubmit={handlePasswordSignUp}>
          <Input
            disabled={pending}
            placeholder="Full name"
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <Input
            disabled={pending}
            placeholder="Confirm password"
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            onClick={() => handleProviderSignUp("google")}
          >
            <FcGoogle className="absolute left-3 size-5" />
            Continue with Google
          </Button>
          <Button
            className="relative w-full"
            disabled={pending}
            size="lg"
            variant="outline"
            onClick={() => handleProviderSignUp("github")}
          >
            <FaGithub className="absolute left-3 size-5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <span
            className="text-sky-700 cursor-pointer hover:underline"
            onClick={() => setFlow("signIn")}
          >
            Sign in
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
