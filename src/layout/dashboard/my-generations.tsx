import { useGetAllCaptionsQuery } from "@/hooks/query/caption";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Search } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";

export default function MyGenerationsLayout() {
  const [params, setParams] = useState({ page: 1, limit: 12, search: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetAllCaptionsQuery(
    params.page,
    params.limit,
    params.search
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">My Generations</h1>
        <p className="text-muted-foreground">
          {data?.total || 0} generations created
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search captions..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.data.map((gen) => (
            <Link href={`/dashboard/caption/edit?id=${gen.id}`} key={gen.id}>
              <Card key={gen.id} className="overflow-hidden group pt-0">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={`https://utfs.io/f/${gen.key}`}
                      alt={gen.caption}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm line-clamp-3 mb-2">{gen.caption}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(gen.updatedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No generations found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search"
              : "Create your first generation to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
