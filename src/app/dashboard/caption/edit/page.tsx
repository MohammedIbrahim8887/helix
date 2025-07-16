"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCaptionByIdQuery,
  useUpdateCaptionMutation,
  useRegenerateCaptionMutation,
} from "@/hooks/query/caption";
import MyGenerationsLayout from "@/layout/dashboard/my-generations";

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
  const [isRegenerating, setIsRegenerating] = useState(false);

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
  const regenerateCaptionMutation = useRegenerateCaptionMutation();

  useEffect(() => {
    if (captionData?.data?.caption) {
      form.setValue("caption", captionData.data.caption);
    }
  }, [captionData, form]);

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

  const handleRegenerate = () => {
    if (!captionData?.data?.key) return;
    setIsRegenerating(true);
    regenerateCaptionMutation.mutate(captionData.data.key, {
      onSuccess: (data) => {
        if (data?.data?.caption) {
          form.setValue("caption", data.data.caption);
          toast.success("Caption regenerated successfully!");
        }
      },
      onError: (error) =>
        toast.error(error.message || "Failed to regenerate caption"),
      onSettled: () => setIsRegenerating(false),
    });
  };

  const handleBack = () => router.push("/dashboard");

  if (!captionId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Caption ID</h1>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading caption...</p>
        </div>
      </div>
    );
  }

  if (error || !captionData?.data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Caption Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The caption you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Edit Caption</h1>
        <p className="text-muted-foreground">
          Edit your caption or regenerate a new one from the image
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              {captionData.data.key ? (
                <img
                  src={`https://utfs.io/f/${captionData.data.key}`}
                  alt="Uploaded image"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <p className="text-muted-foreground">No image available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caption Editor</CardTitle>
          </CardHeader>
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
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your caption here..."
                          className="min-h-32 resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateCaptionMutation.isPending}
                    className="flex-1"
                  >
                    {updateCaptionMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Caption
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={
                      regenerateCaptionMutation.isPending || isRegenerating
                    }
                  >
                    {regenerateCaptionMutation.isPending || isRegenerating ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {captionData.data.updatedAt && (
              <p className="text-sm text-muted-foreground mt-4">
                Last updated:{" "}
                {new Date(captionData.data.updatedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <MyGenerationsLayout />
    </div>
  );
}
