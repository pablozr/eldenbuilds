import { SignIn } from "@clerk/nextjs";
import { AuthWrapper } from "@/app/components/auth/AuthWrapper";

export default function SignInPage() {
  return (
    <AuthWrapper>
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-background",
            footerActionLink:
              "text-primary hover:text-primary/90",
            card: "shadow-none bg-transparent",
          }
        }}
      />
    </AuthWrapper>
  );
}
