"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountGenerations } from "@/generated/prisma";
import { useDeleteCaptionMutation } from "@/hooks/query/caption";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const CaptionCard = ({ gen }: { gen: AccountGenerations }) => {
  const { mutate: deleteCaption, isPending: isDeleting } =
    useDeleteCaptionMutation();

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    deleteCaption(gen.id, {
      onSuccess: () => {
        toast.success("Caption deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete caption");
      },
    });
  };

  return (
    <motion.div
      key={gen.id}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full flex flex-col overflow-hidden p-0 relative">
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash className="w-4 h-4" />
            )}
          </Button>
        </div>

        <Link href={`/dashboard/caption/edit?id=${gen.id}`} className="contents">
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
        </Link>
      </Card>
    </motion.div>
  );
};

export default CaptionCard;