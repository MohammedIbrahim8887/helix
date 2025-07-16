"use client";

import ImageUploader from "@/components/file-uploads/image-uploader";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/utils/auth/auth-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect } from "react";
import { useStreamingCaptionGenerator, useGetCaptionByIdQuery, useUpdateCaptionMutation } from "@/hooks/query/caption";
import MyGenerationsLayout from "@/layout/dashboard/my-generations";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Square, Copy, Edit3, Save, X, RefreshCw, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function DashboardPage() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  
  const captionId = searchParams.get("id");

  const { data: captionData } = useGetCaptionByIdQuery(captionId || "");
  
  const updateCaptionMutation = useUpdateCaptionMutation();

  const handleCaptionGenerated = useCallback((newCaptionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("id", newCaptionId);
    router.push(`?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  const {
    uploadAndGenerate,
    regenerate,
    currentCaption,
    isLoading,
    error,
    stop,
  } = useStreamingCaptionGenerator(handleCaptionGenerated);

  const formSchema = z.object({
    image: z.array(z.instanceof(File)).min(1, "Please upload an image"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: { image: [] },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (currentCaption && !isEditing) {
      setEditedCaption(currentCaption);
    } else if (captionData?.data?.caption && !currentCaption && !isEditing) {
      setEditedCaption(captionData.data.caption);
    }
  }, [currentCaption, captionData?.data?.caption, isEditing]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsEditing(false);
    uploadAndGenerate(data.image);
  };

  const handleFilesChange = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      form.setValue("image", files);
    },
    [form]
  );

  const handleStartFresh = () => {
    router.push("/dashboard");
    setUploadedFiles([]);
    setIsEditing(false);
    setEditedCaption("");
    form.reset();
  };

  const handleEditStart = () => {
    const textToEdit = currentCaption || captionData?.data?.caption || "";
    setEditedCaption(textToEdit);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    const originalText = currentCaption || captionData?.data?.caption || "";
    setEditedCaption(originalText);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!captionId) {
      toast.error("Unable to save: Caption ID not found");
      return;
    }

    try {
      await updateCaptionMutation.mutateAsync({
        id: captionId,
        caption: editedCaption,
      });
      toast.success("Caption updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update caption");
    }
  };

  const handleRegenerate = () => {
    if (!captionData?.data?.key) {
      toast.error("Unable to regenerate: Image key not found");
      return;
    }
    setIsEditing(false);
    regenerate(captionData.data.key);
  };

  const copyToClipboard = () => {
    const textToCopy = isEditing ? editedCaption : (currentCaption || captionData?.data?.caption || "");
    navigator.clipboard.writeText(textToCopy);
    toast.success("Caption copied to clipboard!");
  };

  const displayCaption = currentCaption || captionData?.data?.caption || "";
  const hasCaption = Boolean(displayCaption);
  const showLoadingState = isLoading && !hasCaption;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-7xl flex-col gap-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Hello{" "}
            {isPending ? (
              <Skeleton className="inline-block h-8 w-48 rounded-md" />
            ) : (
              <span>{data?.user?.name}!</span>
            )}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Transform your images into compelling captions with AI magic ✨
          </p>
        </div>

        {captionData?.data?.key && !currentCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-4">
                  <Image
                    src={`https://utfs.io/f/${captionData.data.key}`}
                    alt={captionData.data.caption}
                    className="object-cover"
                    width={500}
                    height={500}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!captionData?.data && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-2xl mx-auto"
            >
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="rounded-lg border-2 border-dashed border-border p-6">
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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={uploadedFiles.length === 0 || isLoading}
                  className="flex-1"
                >
                  {showLoadingState ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Generate Caption
                </Button>

                {isLoading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stop}
                    size="icon"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}

        <AnimatePresence>
          {hasCaption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {currentCaption ? "Generated Caption" : "Current Caption"}
                    </h3>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            disabled={isLoading}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          {captionData?.data?.key && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRegenerate}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                              )}
                              Regenerate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditStart}
                            disabled={isLoading}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleStartFresh}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Start Fresh
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditCancel}
                            disabled={updateCaptionMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={updateCaptionMutation.isPending || !editedCaption.trim()}
                          >
                            {updateCaptionMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative w-full">
                    {isEditing ? (
                      <div className="space-y-2 w-full">
                        <Textarea
                          value={editedCaption}
                          onChange={(e) => setEditedCaption(e.target.value)}
                          placeholder="Edit your caption..."
                          className="min-h-24 resize-none w-xl"
                          maxLength={1000}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Character count: {editedCaption.length}/1000</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {displayCaption}
                        </p>
                        {isLoading && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block w-2 h-4 bg-primary ml-1"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
                {error.message || "Failed to generate caption"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <MyGenerationsLayout />
      </div>
    </div>
  );
}