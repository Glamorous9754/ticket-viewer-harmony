import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FreshDeskCredentials } from "./types";

interface FreshDeskConnectionFormProps {
  onSubmit: (data: FreshDeskCredentials) => Promise<void>;
  initialData?: FreshDeskCredentials;
  isLoading: boolean;
  onCancel: () => void;
}

export const FreshDeskConnectionForm = ({
  onSubmit,
  initialData,
  isLoading,
  onCancel,
}: FreshDeskConnectionFormProps) => {
  const form = useForm<FreshDeskCredentials>({
    defaultValues: initialData || {
      domain: "",
      apiKey: "",
    },
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit FreshDesk Connection" : "Connect FreshDesk"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="your-domain (without .freshdesk.com)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input 
                    type="password"
                    placeholder="Enter your FreshDesk API key" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : initialData ? "Update Connection" : "Validate Connection"}
          </Button>
        </form>
      </Form>
    </div>
  );
};