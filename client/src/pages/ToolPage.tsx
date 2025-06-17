import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, ExternalLink, Share2, Star, DollarSign, Eye, Users, Calendar } from "lucide-react";
import { useState } from "react";

export default function ToolPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const toolIdentifier = id;

  const { data: tool, isLoading } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}`],
  });

  const { data: similarTools } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}/similar`],
    enabled: !!toolIdentifier,
  });

  const { data: featuredTools } = useQuery({
    queryKey: ["/api/tools", "featured=true&limit=5"],
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/tools/${toolIdentifier}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolIdentifier}`] });
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like tools",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: tool?.name,
        text: tool?.shortDescription,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Tool URL copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-muted rounded mb-6"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tool) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-8">The tool you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const toolSlug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-6">
                {tool.logoUrl && (
                  <img 
                    src={tool.logoUrl}
                    alt={`${tool.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{tool.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{tool.shortDescription}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{tool.category}</Badge>
                    <Badge variant={tool.pricingType === 'free' ? 'default' : 'outline'}>
                      {tool.pricingType}
                    </Badge>
                    <Badge variant="outline">{tool.accessType}</Badge>
                  </div>
                </div>
              </div>

              {/* Centered Action Buttons */}
              <div className="flex items-center justify-center gap-4 py-6 border-y">
                <Button asChild size="lg">
                  <a href={tool.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  Like
                </Button>

                <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      <Star className="h-4 w-4 mr-2" />
                      Promote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Promote {tool.name}</DialogTitle>
                      <DialogDescription>
                        Boost your tool's visibility and reach more users by featuring it prominently on our platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center p-6 border rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-2">$100</div>
                        <div className="text-sm text-muted-foreground">30 days featured placement</div>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Featured placement on homepage</p>
                        <p>• Priority in search results</p>
                        <p>• Highlighted in category pages</p>
                        <p>• Email newsletter inclusion</p>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Promote Now
                        </Button>
                        <Button variant="outline" onClick={() => setShowPromoteModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="ghost" size="lg" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">About {tool.name}</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>
            </div>

            {/* Key Features */}
            {tool.keyFeatures && tool.keyFeatures.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {tool.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Cases */}
            {tool.useCases && tool.useCases.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Use Cases</h2>
                <ul className="space-y-2">
                  {tool.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQs */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What does this tool do?</AccordionTrigger>
                  <AccordionContent>
                    {tool.name} is {tool.shortDescription.toLowerCase()}. It provides {tool.category.toLowerCase()} capabilities to help users achieve their goals more efficiently.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Who is it for?</AccordionTrigger>
                  <AccordionContent>
                    This tool is designed for professionals, teams, and individuals who need {tool.category.toLowerCase()} solutions. It's particularly useful for those looking to streamline their workflow and improve productivity.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it free to use?</AccordionTrigger>
                  <AccordionContent>
                    {tool.pricingType === 'free' ? 'Yes, this tool is completely free to use.' : 
                     tool.pricingType === 'freemium' ? 'This tool offers both free and premium features. You can start with the free version and upgrade as needed.' :
                     'This is a paid tool. Please visit the website to see current pricing plans.'}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I integrate it with other tools?</AccordionTrigger>
                  <AccordionContent>
                    Integration capabilities depend on the specific tool. Most modern {tool.category.toLowerCase()} tools offer APIs and integrations with popular platforms. Check the tool's documentation for specific integration options.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Similar Tools */}
            {similarTools && similarTools.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Similar Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarTools.slice(0, 4).map((similarTool: any) => (
                    <ToolCard key={similarTool.id} tool={similarTool} showDescription={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredTools?.items?.slice(0, 5).map((featuredTool: any) => (
                    <Link key={featuredTool.id} href={`/tools/${featuredTool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        {featuredTool.logoUrl && (
                          <img 
                            src={featuredTool.logoUrl}
                            alt={featuredTool.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-1">
                            {featuredTool.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {featuredTool.shortDescription}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {featuredTool.category}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tool Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="secondary">{tool.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pricing</span>
                  <Badge variant={tool.pricingType === 'free' ? 'default' : 'outline'}>
                    {tool.pricingType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Type</span>
                  <Badge variant="outline">{tool.accessType}</Badge>
                </div>
                {tool.aiTech && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI Technology</span>
                    <span className="text-sm font-medium">{tool.aiTech}</span>
                  </div>
                )}
                {tool.audience && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Target Audience</span>
                    <span className="text-sm font-medium">{tool.audience}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}