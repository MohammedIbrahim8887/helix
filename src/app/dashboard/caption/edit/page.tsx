"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteCaptionMutation,
  useGetCaptionByIdQuery,
  useStreamingCaptionGenerator,
  useUpdateCaptionMutation
} from "@/hooks/query/caption";
import MyGenerationsLayout from "@/layout/dashboard/my-generations";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, RefreshCw, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  caption: z
    .string()
    .min(1, "Caption cannot be empty")
    .max(1000, "Caption is too long"),
});

type FormData = z.infer<typeof formSchema>;

export default function EditCaptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const captionId = searchParams.get("id");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { caption: "" },
  });

  const {
    data: captionData,
    isLoading,
    error,
  } = useGetCaptionByIdQuery(captionId || "");

  const updateCaptionMutation = useUpdateCaptionMutation();
  const {
    regenerate,
    currentCaption: streamingCaption,
    isGenerating,
  } = useStreamingCaptionGenerator();
  
  const handleRegenerate = () => {
    if (!captionData?.data?.key) return;
    regenerate(captionData.data.key);
  };
  const deleteCaptionMutation = useDeleteCaptionMutation();

  const watchedCaption = form.watch("caption");

  useEffect(() => {
    if (streamingCaption) {
      form.setValue("caption", streamingCaption);
    } else if (captionData?.data?.caption) {
      form.setValue("caption", captionData.data.caption);
    }
  }, [captionData, streamingCaption, form]);

  const onSubmit = (data: FormData) => {
    if (!captionId) return;

    updateCaptionMutation.mutate(
      { id: captionId, caption: data.caption },
      {
        onSuccess: () => toast.success("Caption updated successfully!"),
        onError: (error) =>
          toast.error(error.message || "Failed to update caption"),
      }
    );
  };

  const handleDelete = () => {
    if (!captionId) return;
    deleteCaptionMutation.mutate(captionId, {
      onSuccess: () => {
        toast.success("Caption deleted successfully!");
        router.push("/dashboard");
      },
      onError: (error) =>
        toast.error(error.message || "Failed to delete caption"),
    });
  };

  const handleBack = () => router.push("/dashboard");

  if (!captionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-6 text-destructive">
            Invalid Caption ID
          </h1>
          <Button onClick={handleBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your caption...</p>
        </div>
      </div>
    );
  }

  if (error || !captionData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Caption Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            The caption you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={handleBack} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b mb-8 -mx-6 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Edit Caption</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Regenerate
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateCaptionMutation.isPending}
              >
                {updateCaptionMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCaptionMutation.isPending}
              >
                {deleteCaptionMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {captionData.data.key ? (
                  <Image
                    src={`https://utfs.io/f/${captionData.data.key}`}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="font-semibold mb-3">Current Caption</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {captionData.data.caption}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Edit Caption
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your caption here..."
                            className="min-h-32 resize-none"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Character count: {watchedCaption?.length || 0}/1000
                          </span>
                          {captionData.data.updatedAt && (
                            <span>
                              Last updated:{" "}
                              {new Date(
                                captionData.data.updatedAt
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
          <MyGenerationsLayout />
      </div>
    </div>
  );
}
