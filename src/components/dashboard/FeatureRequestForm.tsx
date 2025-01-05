import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  complexity: z.enum(["Low", "Medium", "High"]),
  segment: z.enum(["automation", "analytics", "integration", "ticketing"]),
})

export function FeatureRequestForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      complexity: "Medium",
      segment: "automation",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success("Feature request submitted successfully!", {
      description: "We'll review your request and get back to you soon.",
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a clear, concise title for your request" {...field} />
              </FormControl>
              <FormDescription>
                Summarize your feature request in a few words
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed information about your feature request"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include use cases, benefits, and any relevant context
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="complexity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Complexity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your estimate of the feature's complexity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="segment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="automation">Automation</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="ticketing">Ticketing</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The category this feature belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">Submit Request</Button>
      </form>
    </Form>
  )
}