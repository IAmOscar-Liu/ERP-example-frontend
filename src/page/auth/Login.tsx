import stLogo from "@/assets/symptomtrace_logo.png";
import CustomFormField from "@/components/form/CustomFormField";
import CustomLoadingButton from "@/components/form/CustomLoadingButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { REMEMBER_ME_STORAGE_KEY } from "@/constants";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import useLocalStorage from "@/hooks/useLocalStorage";
import { extractErrorMessage, waitFor } from "@/lib/utils";
import type { RememberMe } from "@/type";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

function LoginPage() {
  const { login } = useAuth();
  const { formatMessage: t } = useIntl();
  const [rememberMeState, setRememberMeState] = useLocalStorage<RememberMe>(
    REMEMBER_ME_STORAGE_KEY,
    { rememberMe: false },
  );
  const [loginError, setLoginError] = useState<any>();

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ error: "Invalid email address" }),
        password: z.string().min(1, t({ id: "general.validation.required" })),
      }),
    [],
  );
  const toast = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: rememberMeState.rememberMe
      ? {
          email: rememberMeState.email ?? "",
          password: rememberMeState.password ?? "",
        }
      : {
          email: "",
          password: "",
        },
  });

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    setLoginError(null);
    if (rememberMeState.rememberMe) {
      setRememberMeState({
        ...rememberMeState,
        email: value.email,
        password: value.password,
      });
    } else {
      setRememberMeState({
        rememberMe: false,
      });
    }

    // For some reason without this delay, setRememberMeState doesn't persist the data properly
    await waitFor(250);

    try {
      await login(value);
    } catch (error) {
      setLoginError(error);
      toast.error({
        title: "Login Failed",
        description: extractErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-8">
      <img src={stLogo} alt="" className="mx-auto" />

      <h1 className="mt-6 text-center text-xl">
        Welcome back! <br /> Enter your credentials to login
      </h1>

      {loginError && (
        <p className="mt-2 text-center text-sm text-red-600">
          {extractErrorMessage(loginError)}
        </p>
      )}

      <Form {...form}>
        <form
          className="mt-4 w-full max-w-[500px]"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="mx-4 mb-4">
            <CustomFormField
              required
              control={form.control}
              name="email"
              label="Email"
              placeholder="email@example.com"
              fieldClassName="mb-4"
            />
            <CustomFormField
              required
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              fieldClassName="mb-4"
            />
            <Label>
              <Checkbox
                checked={rememberMeState.rememberMe}
                onCheckedChange={(checked) =>
                  setRememberMeState({
                    ...rememberMeState,
                    rememberMe: checked === true,
                  })
                }
              />
              Remember me
            </Label>

            <CustomLoadingButton
              className="mt-4 w-full"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isValid}
            >
              Submit
            </CustomLoadingButton>
          </div>
        </form>
      </Form>
      {import.meta.env.DEV && <DevTool control={form.control} />}
    </div>
  );
}

export default LoginPage;
