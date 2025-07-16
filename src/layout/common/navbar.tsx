"use client";

import { useSession, signOut } from "@/utils/auth/auth-client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const { data } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="font-semibold cursor-pointer transition-colors"
                  >
                    Home
                  </motion.span>
                </Link>

                {data?.user && (
                  <Link href="/dashboard">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="font-medium cursor-pointer transition-colors"
                    >
                      Dashboard
                    </motion.span>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {data?.user ? (
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-foreground font-semibold text-sm"
                    >
                      <Image
                        src={data?.user?.image || data?.user?.name?.at(0)?.toLocaleUpperCase() || ""}
                        alt="User Avatar"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    </motion.div>

                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      size="sm"
                      className="space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button
                      variant="default"
                      size="sm">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;
