import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; name?: string }) => {
      const payload = { 
        email: data.email, 
        name: data.name || undefined,
        source: "homepage" 
      };
      console.log("Submitting newsletter subscription:", payload);
      const response = await apiRequest("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      console.log("Newsletter subscription result:", result);
      return result;
    },
    onSuccess: () => {
      setEmail("");
      setName("");
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
    },
    onError: (error) => {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      subscribeMutation.mutate({ email, name: name.trim() || undefined });
    } catch (error) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stay Updated with AI Trends
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get the latest AI tools, news, and tutorials delivered to your inbox weekly
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus:border-white focus:ring-white/30"
              />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus:border-white focus:ring-white/30"
              />
            </div>
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="bg-white text-primary hover:bg-gray-100 px-8 self-center"
            >
              {subscribeMutation.isPending ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            No spam, unsubscribe anytime. Join thousands of AI enthusiasts.
          </p>
        </form>
      </div>
    </section>
  );
}
