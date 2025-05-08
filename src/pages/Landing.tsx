
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const accessRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address")
});

type AccessRequestFormValues = z.infer<typeof accessRequestSchema>;

const Landing = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      name: "",
      email: ""
    }
  });

  const onSubmit = async (values: AccessRequestFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name: values.name, 
            email: values.email,
            status: 'pending',
            role: 'user'
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error("This email has already been registered");
        } else {
          console.error("Error submitting request:", error);
          toast.error("There was an error submitting your request. Please try again.");
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("Request submitted successfully");
      form.reset();
    } catch (error) {
      console.error("Exception during submission:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                    No fuss. Just research.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A survey tool built by a senior user researcher — for researchers and anyone who needs answers.
                  </p>
                </div>
              </div>
              <div className="mx-auto w-full max-w-md space-y-6 lg:max-w-lg">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">Request Access</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below to request access to the platform.
                  </p>
                </div>
                
                {isSubmitted ? (
                  <div className="rounded-lg border bg-card p-8 text-center space-y-4">
                    <h3 className="text-xl font-semibold">Thank you!</h3>
                    <p>We'll review your request and get back to you soon.</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => setIsSubmitted(false)}
                    >
                      Request another access
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Request Access"}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
