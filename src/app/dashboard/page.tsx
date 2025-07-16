"use client";
import ImageUploader from "@/components/file-uploads/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetCaptionByIdQuery,
  useStreamingCaptionGenerator,
  useUpdateCaptionMutation,
} from "@/hooks/query/caption";
import MyGenerationsLayout from "@/layout/dashboard/my-generations";
import { useSession } from "@/utils/auth/auth-client";
import { captionTones } from "@/utils/helpers/caption-tones";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Copy,
  Edit3,
  Eye,
  Frown,
  Loader2,
  Minus,
  RefreshCw,
  RotateCcw,
  Save,
  Smile,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tonesWithIcons = captionTones.map((tone) => ({
  ...tone,
  icon:
    tone.tone === "funny"
      ? Smile
      : tone.tone === "serious"
      ? Frown
      : tone.tone === "descriptive"
      ? Eye
      : tone.tone === "roasting"
      ? Zap
      : tone.tone === "social media"
      ? Users
      : Minus,
}));

export default function DashboardPage() {
  const { data, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [selectedTone, setSelectedTone] = useState("social media");
  const [regenerateTone, setRegenerateTone] = useState("social media");

  const captionId = searchParams.get("id");

  const { data: captionData } = useGetCaptionByIdQuery(captionId || "");

  const updateCaptionMutation = useUpdateCaptionMutation();

  const handleCaptionGenerated = useCallback(
    (newCaptionId: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("id", newCaptionId);
      router.push(`?${newSearchParams.toString()}`);
    },
    [router, searchParams]
  );

  const { uploadAndGenerate, regenerate, currentCaption, isLoading, error } =
    useStreamingCaptionGenerator(handleCaptionGenerated, selectedTone);

  const formSchema = z.object({
    image: z.array(z.instanceof(File)).min(1, "Please upload an image"),
    tone: z.string().min(1, "Please select a tone"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: { image: [], tone: selectedTone },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (currentCaption && !isEditing) {
      setEditedCaption(currentCaption);
    } else if (captionData?.data?.caption && !currentCaption && !isEditing) {
      setEditedCaption(captionData.data.caption);
    }
  }, [currentCaption, captionData?.data?.caption, isEditing]);

  // Update form when tone changes
  useEffect(() => {
    form.setValue("tone", selectedTone);
  }, [selectedTone, form]);

  // Initialize regenerate tone from existing caption data
  useEffect(() => {
    if (captionData?.data && !currentCaption) {
      setRegenerateTone(selectedTone);
    }
  }, [captionData, currentCaption, selectedTone]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsEditing(false);
    setSelectedTone(data.tone);
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
    setSelectedTone("social media");
    setRegenerateTone("social media");
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
    setSelectedTone(regenerateTone); // Update the main tone to match regenerate tone
    regenerate(captionData.data.key);
  };

  const copyToClipboard = () => {
    const textToCopy = isEditing
      ? editedCaption
      : currentCaption || captionData?.data?.caption || "";
    navigator.clipboard.writeText(textToCopy);
    toast.success("Caption copied to clipboard!");
  };

  const displayCaption = currentCaption || captionData?.data?.caption || "";
  const hasCaption = Boolean(displayCaption);
  const showLoadingState = isLoading && !hasCaption;

  const selectedToneConfig = tonesWithIcons.find(
    (t) => t.tone === selectedTone
  );
  const regenerateToneConfig = tonesWithIcons.find(
    (t) => t.tone === regenerateTone
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4 mt-32">
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
            className="w-full max-w-2xl mx-auto px-4 sm:px-0"
          >
            <Card>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-4">
                  <Image
                    src={`https://utfs.io/f/${captionData.data.key}`}
                    alt={captionData.data.caption}
                    className="object-cover"
                    fill
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
              className="space-y-6 w-full max-w-2xl mx-auto px-4 sm:px-0"
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

              <FormField
                control={form.control}
                name="tone"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Voice Tone
                    </FormLabel>
                    <Select
                      value={selectedTone}
                      onValueChange={setSelectedTone}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tonesWithIcons.map((tone) => {
                          const IconComponent = tone.icon;
                          return (
                            <SelectItem key={tone.tone} value={tone.tone}>
                              <div className="flex items-center gap-2 w-full">
                                <IconComponent className="w-4 h-4" />
                                <div className="flex gap-2 items-center w-full">
                                  <div className="font-medium">
                                    {tone.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {tone.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedToneConfig && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedToneConfig.description}
                      </p>
                    )}
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
              </div>
            </form>
          </Form>
        )}

        {captionData?.data && hasCaption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto px-4 sm:px-0"
          >
            <Card>
              <CardContent>
                <label className="text-sm font-semibold">
                  Regenerate with different tone
                </label>
                <div className="flex items-center gap-4 mt-2 justify-between w-full">
                  <Select
                    value={regenerateTone}
                    onValueChange={setRegenerateTone}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a tone for regeneration" />
                    </SelectTrigger>
                    <SelectContent>
                      {tonesWithIcons.map((tone) => {
                        const IconComponent = tone.icon;
                        return (
                          <SelectItem key={tone.tone} value={tone.tone}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              <div className="flex gap-2 items-center">
                                <div className="font-medium">{tone.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {tone.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                {regenerateToneConfig && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <regenerateToneConfig.icon className="w-3 h-3" />
                    {regenerateToneConfig.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {hasCaption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto px-4 sm:px-0"
            >
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">
                        {currentCaption
                          ? "Generated Caption"
                          : "Current Caption"}
                      </h3>
                      {selectedToneConfig && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <selectedToneConfig.icon className="w-3 h-3" />
                          {selectedToneConfig.label} tone
                        </p>
                      )}
                    </div>
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
                            disabled={
                              updateCaptionMutation.isPending ||
                              !editedCaption.trim()
                            }
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
                          className="min-h-24 resize-none"
                          maxLength={1000}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Character count: {editedCaption.length}/1000
                          </span>
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
              className="w-full max-w-2xl mx-auto px-4 sm:px-0"
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
