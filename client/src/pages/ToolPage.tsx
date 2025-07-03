// ToolPage.tsx (updated layout + SEO + mobile fix)

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
import { Heart, ExternalLink, Share2, Star, DollarSign } from "lucide-react";
import { useState } from "react";

export default function ToolPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);

  const toolIdentifier = id;

  const { data: tool } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}`],
  });

  const { data: similarTools } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}/similar`],
    enabled: !!toolIdentifier,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/tools/${toolIdentifier}/like`, { method: "POST" });
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolIdentifier}`] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Login to like tools", variant: "destructive" });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: tool?.name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Copied", description: "Tool URL copied" });
    }
  };

  if (!tool) return <Layout><div className="text-center py-10">Tool not found</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* SEO: H1 and logo with alt */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          {tool.logoUrl && (
            <img src={tool.logoUrl} alt={`${tool.name} logo`} className="w-16 h-16 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{tool.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{tool.shortDescription}</p>
          </div>
        </div>

        {/* Promote is most important button */}
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-8">
          <Button variant="outline" onClick={handleLike}><Heart className="w-4 h-4 mr-2" /> Like</Button>
          <Button variant="ghost" onClick={handleShare}><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <a href={tool.website} target="_blank" rel="noopener noreferrer">
            <Button><ExternalLink className="w-4 h-4 mr-2" /> Visit</Button>
          </a>
          <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Star className="w-4 h-4 mr-2" /> Promote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promote {tool.name}</DialogTitle>
                <DialogDescription>Get featured for 30 days on homepage, search, and newsletter</DialogDescription>
              </DialogHeader>
              <div className="text-center py-4">
                <p className="text-xl font-bold mb-2">$100</p>
                <Button><DollarSign className="mr-2 w-4 h-4" /> Promote Now</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* About + How it works + Key features */}
        <div className="prose dark:prose-invert mb-8">
          <h2>About {tool.name}</h2>
          <p>{tool.description}</p>
          {tool.howItWorks && (
            <>
              <h2>How it works</h2>
              <p>{tool.howItWorks}</p>
            </>
          )}
          {tool.keyFeatures && tool.keyFeatures.length > 0 && (
            <>
              <h2>Key Features</h2>
              <ul>
                {tool.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
        </div>

        {/* Tool Information - moved above Featured */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Tool Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm"><span>Category:</span><span>{tool.category}</span></div>
            <div className="flex justify-between text-sm"><span>Pricing:</span><span>{tool.pricingType}</span></div>
            <div className="flex justify-between text-sm"><span>Access:</span><span>{tool.accessType}</span></div>
            <div className="flex justify-between text-sm"><span>Audience:</span><span>{tool.audience}</span></div>
            <div className="flex justify-between text-sm"><span>AI Tech:</span><span>{tool.aiTech}</span></div>
          </CardContent>
        </Card>

        {/* Similar Tools */}
        {similarTools && similarTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Similar Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarTools.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} showDescription={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
