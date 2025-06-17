import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  Newspaper, 
  Star,
  DollarSign,
  AlertCircle 
} from "lucide-react";

// Form schemas
const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  website: z.string().url("Please enter a valid URL"),
  logoUrl: z.string().url("Please enter a valid logo URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  pricingType: z.string().min(1, "Pricing type is required"),
  accessType: z.string().min(1, "Access type is required"),
  aiTech: z.string().optional(),
  audience: z.string().optional(),
  keyFeatures: z.string().optional(),
});

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  source: z.string().min(1, "Source is required"),
  sourceUrl: z.string().url("Please enter a valid URL"),
  publishDate: z.string().min(1, "Publish date is required"),
  category: z.string().optional(),
});

export default function SubmitPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tool");
  const [isPromoted, setIsPromoted] = useState(false);

  // Tool form
  const toolForm = useForm({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      website: "",
      logoUrl: "",
      category: "",
      pricingType: "",
      accessType: "",
      aiTech: "",
      audience: "",
      keyFeatures: "",
    },
  });

  // News form
  const newsForm = useForm({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      source: "",
      sourceUrl: "",
      publishDate: "",
      category: "",
    },
  });

  // Mutations
  const submitToolMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        keyFeatures: data.keyFeatures ? data.keyFeatures.split('\n').filter(Boolean) : [],
      };
      return await apiRequest("/api/tools", {
        method: "POST",
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Tool submitted successfully. It will be reviewed by our team.",
      });
      toolForm.reset();
      setIsPromoted(false);
    },
    onError: (error) => {
      console.error("Tool submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit tool. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitNewsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/news", {
        method: "POST", 
        body: JSON.stringify({
          ...data,
          publishDate: new Date(data.publishDate),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "News article submitted successfully. It will be reviewed by our team.",
      });
      newsForm.reset();
    },
    onError: (error) => {
      console.error("News submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit news article. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-8">You need to be signed in to submit content.</p>
          <Button asChild>
            <a href="/api/login">Sign In with Google</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Submit Content
          </h1>
          <p className="text-muted-foreground text-lg">
            Share AI tools and news with the community.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tool" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Tool
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Submit News
            </TabsTrigger>
          </TabsList>

          {/* Tool Submission */}
          <TabsContent value="tool">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Submit AI Tool
                </CardTitle>
                <CardDescription>
                  Share an AI tool with our community. All submissions are reviewed before going live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={toolForm.handleSubmit((data) => submitToolMutation.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tool Name *</Label>
                      <Input 
                        id="name"
                        {...toolForm.register("name")}
                        placeholder="Enter tool name"
                      />
                      {toolForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL *</Label>
                      <Input 
                        id="website"
                        {...toolForm.register("website")}
                        placeholder="https://example.com"
                      />
                      {toolForm.formState.errors.website && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input 
                      id="shortDescription"
                      {...toolForm.register("shortDescription")}
                      placeholder="Brief description for tool cards"
                    />
                    {toolForm.formState.errors.shortDescription && (
                      <p className="text-sm text-red-500">{toolForm.formState.errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea 
                      id="description"
                      {...toolForm.register("description")}
                      placeholder="Detailed description of the AI tool"
                      rows={4}
                    />
                    {toolForm.formState.errors.description && (
                      <p className="text-sm text-red-500">{toolForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => toolForm.setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Analytics">Analytics</SelectItem>
                          <SelectItem value="Customer Service">Customer Service</SelectItem>
                          <SelectItem value="Productivity">Productivity</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Image">Image</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Audio">Audio</SelectItem>
                          <SelectItem value="Coding">Coding</SelectItem>
                          <SelectItem value="UI/UX">UI/UX</SelectItem>
                          <SelectItem value="Studying">Studying</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                          <SelectItem value="AI Avatars">AI Avatars</SelectItem>
                          <SelectItem value="Investing">Investing</SelectItem>
                          <SelectItem value="Chatbots">Chatbots</SelectItem>
                          <SelectItem value="Automation">Automation</SelectItem>
                          <SelectItem value="Search">Search</SelectItem>
                        </SelectContent>
                      </Select>
                      {toolForm.formState.errors.category && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricingType">Pricing *</Label>
                      <Select onValueChange={(value) => toolForm.setValue("pricingType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="freemium">Freemium</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="open-source">Open Source</SelectItem>
                        </SelectContent>
                      </Select>
                      {toolForm.formState.errors.pricingType && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.pricingType.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="accessType">Access Type *</Label>
                      <Select onValueChange={(value) => toolForm.setValue("accessType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-app">Web App</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="chrome-extension">Chrome Extension</SelectItem>
                          <SelectItem value="mobile-app">Mobile App</SelectItem>
                          <SelectItem value="desktop-app">Desktop App</SelectItem>
                          <SelectItem value="discord-bot">Discord Bot</SelectItem>
                        </SelectContent>
                      </Select>
                      {toolForm.formState.errors.accessType && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.accessType.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input 
                        id="logoUrl"
                        {...toolForm.register("logoUrl")}
                        placeholder="https://example.com/logo.png"
                      />
                      {toolForm.formState.errors.logoUrl && (
                        <p className="text-sm text-red-500">{toolForm.formState.errors.logoUrl.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyFeatures">Key Features (one per line)</Label>
                    <Textarea 
                      id="keyFeatures"
                      {...toolForm.register("keyFeatures")}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitToolMutation.isPending}
                    className="w-full"
                  >
                    {submitToolMutation.isPending ? "Submitting..." : "Submit Tool"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Submission */}
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Submit AI News
                </CardTitle>
                <CardDescription>
                  Share important AI news with our community. All submissions are reviewed before going live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={newsForm.handleSubmit((data) => submitNewsMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="news-title">Article Title *</Label>
                    <Input 
                      id="news-title"
                      {...newsForm.register("title")}
                      placeholder="Enter news article title"
                    />
                    {newsForm.formState.errors.title && (
                      <p className="text-sm text-red-500">{newsForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="news-excerpt">Article Summary *</Label>
                    <Textarea 
                      id="news-excerpt"
                      {...newsForm.register("excerpt")}
                      placeholder="Brief summary of the news article"
                      rows={3}
                    />
                    {newsForm.formState.errors.excerpt && (
                      <p className="text-sm text-red-500">{newsForm.formState.errors.excerpt.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="news-source">Source *</Label>
                      <Input 
                        id="news-source"
                        {...newsForm.register("source")}
                        placeholder="e.g., TechCrunch, Wired, etc."
                      />
                      {newsForm.formState.errors.source && (
                        <p className="text-sm text-red-500">{newsForm.formState.errors.source.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="news-sourceUrl">Source URL *</Label>
                      <Input 
                        id="news-sourceUrl"
                        {...newsForm.register("sourceUrl")}
                        placeholder="https://example.com/article"
                      />
                      {newsForm.formState.errors.sourceUrl && (
                        <p className="text-sm text-red-500">{newsForm.formState.errors.sourceUrl.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="news-publishDate">Publish Date *</Label>
                      <Input 
                        id="news-publishDate"
                        type="date"
                        {...newsForm.register("publishDate")}
                      />
                      {newsForm.formState.errors.publishDate && (
                        <p className="text-sm text-red-500">{newsForm.formState.errors.publishDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="news-category">Category</Label>
                      <Select onValueChange={(value) => newsForm.setValue("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AI Research">AI Research</SelectItem>
                          <SelectItem value="Industry News">Industry News</SelectItem>
                          <SelectItem value="Product Launches">Product Launches</SelectItem>
                          <SelectItem value="Funding">Funding</SelectItem>
                          <SelectItem value="Regulation">Regulation</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitNewsMutation.isPending}
                    className="w-full"
                  >
                    {submitNewsMutation.isPending ? "Submitting..." : "Submit News"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}