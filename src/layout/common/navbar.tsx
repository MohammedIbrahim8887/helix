"use client";

import { useSession, signOut } from "@/utils/auth/auth-client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const { data } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
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

              {/* Mobile Logo/Brand */}
              <div className="md:hidden">
                <Link href="/">
                  <span className="font-semibold text-lg">Helix</span>
                </Link>
              </div>

              {/* Desktop Right Side */}
              <div className="hidden md:flex items-center space-x-4">
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

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden border-t mt-2 pt-4 pb-4 space-y-4"
                >
                  <div className="flex flex-col space-y-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="block font-semibold py-2 transition-colors">
                        Home
                      </span>
                    </Link>

                    {data?.user && (
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="block font-medium py-2 transition-colors">
                          Dashboard
                        </span>
                      </Link>
                    )}

                    <div className="pt-4 border-t">
                      {data?.user ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-foreground font-semibold text-sm">
                              <Image
                                src={data?.user?.image || data?.user?.name?.at(0)?.toLocaleUpperCase() || ""}
                                alt="User Avatar"
                                width={30}
                                height={30}
                                className="rounded-full"
                              />
                            </div>
                            <span className="text-sm font-medium">{data?.user?.name}</span>
                          </div>
                          <Button
                            onClick={() => {
                              handleSignOut();
                              setIsMobileMenuOpen(false);
                            }}
                            variant="outline"
                            size="sm"
                            className="space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </Button>
                        </div>
                      ) : (
                        <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full">
                            Get Started
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;
