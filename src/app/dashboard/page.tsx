"use client"

import ImageUploader from "@/components/file-uploads/image-uploader"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/utils/auth/auth-client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useState, useCallback, useEffect } from "react"
import { useCaptionGeneratorMutation } from "@/hooks/query/caption"
import MyGenerationsLayout from "@/layout/dashboard/my-generations"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data, isPending } = useSession()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const router = useRouter()

  const { uploadAndGenerate, isLoading, generation, error, isSuccess } =
    useCaptionGeneratorMutation()

  const formSchema = z.object({
    image: z.array(z.instanceof(File)).min(1, "Please upload an image"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: { image: [] },
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (isSuccess && generation?.id) {
      router.push(`/dashboard/caption/edit?id=${generation.id}`)
    }
  }, [isSuccess, generation?.id, router])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    uploadAndGenerate(data.image, {
      onSuccess: () => {
        toast.success("Caption generated successfully!")
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate caption")
      },
    })
  }

  const handleFilesChange = useCallback(
    (files: File[]) => {
      setUploadedFiles(files)
      form.setValue("image", files)
    },
    [form],
  )

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-2xl mx-auto">
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

            <Button
              type="submit"
              disabled={uploadedFiles.length === 0 || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Caption"}
            </Button>
          </form>
        </Form>

        <AnimatePresence>
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
              {error}
            </div>
          )}
        </AnimatePresence>
        <MyGenerationsLayout />
      </div>
    </div>
  )
}