"use client";

import MaskedDiv from "@/components/ui/masked-div";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/utils/auth/auth-client";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-20 lg:top-4 -left-20 lg:-left-24"
        >
          <MaskedDiv
            maskType="type-1"
            size={0.7}
            className="w-96 h-96 lg:w-[35dvw] lg:h-[35dvw]"
          >
            <Image
              src="https://images.unsplash.com/photo-1667835949495-78a1ea9ecd77?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="AI Technology"
              fill
              className="object-cover"
              priority
            />
          </MaskedDiv>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-8 left-2 lg:left-96 lg:-right-96"
        >
          <MaskedDiv
            maskType="type-2"
            size={0.65}
            className="w-28 h-96 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-[25dvw] lg:h-[25dvw]"
          >
            <Image
              src="https://images.unsplash.com/photo-1675720788092-35ff32d69b0c?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Creative Content"
              fill
              className="object-cover"
              priority
            />
          </MaskedDiv>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute -bottom-32 left-1/2 transform max-lg:-translate-x-1/2 sm:-bottom-10 sm:left-10 lg:-bottom-96 lg:left-64"
        >
          <MaskedDiv
            maskType="type-3"
            size={0.5}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-[40dvw] lg:h-[40dvw]"
          >
            <Image
              src="https://images.unsplash.com/photo-1680055195868-2b12621ac283?q=80&w=2128&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Social Media"
              fill
              className="object-cover"
              priority
            />
          </MaskedDiv>
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            AI-Powered Caption Generator
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your images into compelling captions with AI magic. Choose
            from multiple tones and edit in real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href={session?.session ? "/dashboard" : "/auth"}>
              <Button
                size="lg"
                className="px-8 py-4 font-semibold transition-all duration-300 group"
              >
                {session?.session ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
