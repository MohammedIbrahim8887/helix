"use client";

import ImageUploader from "@/components/file-uploads/image-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/utils/auth/auth-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useState, useCallback } from "react";
import { useCaptionGenerator } from "@/hooks/use-caption-generator";

export default function DashboardPage() {
  const { data, isPending } = useSession();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { uploadAndGenerate, isLoading, caption, error } =
    useCaptionGenerator();

  const formSchema = z.object({
    image: z.array(z.instanceof(File)).min(1, "Please upload an image"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      image: [],
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await uploadAndGenerate(data.image);
  };

  const handleFilesChange = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      form.setValue("image", files);
    },
    [form],
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10">
      <div className="flex items-center justify-center gap-2 text-3xl font-semibold">
        <p>Hello</p>
        {isPending ? (
          <Skeleton className="h-6 w-40 rounded-sm" />
        ) : (
          <p>{data?.user?.name}, Let's get started!</p>
        )}
      </div>
      <p className="text-muted-foreground">
        Upload your images and get realtime captions
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="w-[40dvw]">
                    <ImageUploader
                      maxFiles={1}
                      maxSizeMB={4}
                      onFilesChange={handleFilesChange}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={uploadedFiles.length === 0 || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Generate Caption"
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="text-destructive text-center p-4 border border-destructive rounded-md">
          {error}
        </div>
      )}

      {caption && (
        <div className="max-w-2xl p-6 border rounded-lg bg-card">
          <h3 className="font-semibold mb-2">Generated Caption:</h3>
          <p className="text-muted-foreground">{caption}</p>
        </div>
      )}
    </div>
  );
}
