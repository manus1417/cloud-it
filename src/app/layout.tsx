import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import Link from "next/link";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="flex justify-end px-10 py-3">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <div className="mr-2">
                <Link href={"/files"}>My files</Link>
              </div>
              <UserButton />
            </SignedIn>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
