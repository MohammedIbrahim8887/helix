"use client";

import { useGetAllCaptionsQuery } from "@/hooks/query/caption";
import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search, ImageIcon } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const LIMIT = 12;

export default function MyGenerationsLayout() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAllCaptionsQuery(page, LIMIT, searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = data?.total ? Math.ceil(data.total / LIMIT) : 0;

  return (
    <div className="min-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
      <p className="text-xl font-semibold">My Helix's Workspace</p>
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search captions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full min-w-lg"
          />
        </div>
        <p className="text-muted-foreground">
          {data?.total || 0} captions created
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <Card key={i} className="overflow-hidden p-0">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.data?.length ? (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {data.data.map((gen) => (
                <motion.div
                  key={gen.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link href={`/dashboard/caption/edit?id=${gen.id}`}>
                    <Card className="h-full flex flex-col overflow-hidden p-0">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={`https://utfs.io/f/${gen.key}`}
                          alt={gen.caption}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <CardContent className="flex-1 flex flex-col justify-between p-4">
                        <p className="text-sm line-clamp-3">{gen.caption}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(gen.updatedAt), "MMM d, yyyy")}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">
              {searchTerm ? "No matches" : "Nothing yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try different keywords"
                : "Upload your first image to get started"}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
