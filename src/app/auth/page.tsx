"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { signIn } from "@/utils/auth/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        fetchOptions: {
          onError: () => {
            toast.error(
              "Failed to sign in with Google, please try again later.",
            );
          },
        },
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="relative h-screen w-1/2">
        <Image
          src="https://images.unsplash.com/photo-1695908253490-ade59a73c18a?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          fill
          className="object-cover rounded-r-[4rem]"
        />
      </div>
      <motion.div
        className="flex flex-col justify-center p-8 md:p-12 mx-auto gap-10 max-w-md w-full"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Welcome to Helix
          </motion.h1>
          <motion.p
            className="leading-relaxed max-w-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Transform your images into captivating stories and share them with
            the world
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              className="w-full h-14 flex items-center justify-center gap-4"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <motion.svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="text-inherit"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21
                       3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23
                       1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99
                       20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43
                       8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21
                       1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99
                       3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </motion.svg>
              )}
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <motion.a
              href="#"
              className="text-primary underline underline-offset-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Terms of Service
            </motion.a>{" "}
            and{" "}
            <motion.a
              href="#"
              className="text-primary underline underline-offset-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Privacy Policy
            </motion.a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
