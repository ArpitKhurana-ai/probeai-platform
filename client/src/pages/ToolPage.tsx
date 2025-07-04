import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
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
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col items-center gap-4">
          {tool.logoUrl && (
            <img src={tool.logoUrl} alt={`${tool.name} logo`} className="w-20 h-20 rounded-lg object-cover" />
          )}
          {/* BADGE */}
          {tool.badge && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {tool.badge}
            </span>
          )}
          {/* ACTION BUTTONS */}
          <Button variant="outline" onClick={handleLike} className="w-full"><Heart className="w-4 h-4 mr-2" /> Like</Button>
          <Button variant="ghost" onClick={handleShare} className="w-full"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <a href={tool.website} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full"><ExternalLink className="w-4 h-4 mr-2" /> Visit</Button>
          </a>
          <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full">
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
          {/* Vertical Ad Placeholder */}
          <div className="bg-gray-100 w-full h-[300px] rounded-md mt-4 text-center text-sm flex items-center justify-center">
            Ad Placeholder (300x600)
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="prose dark:prose-invert max-w-none">
          <h1>{tool.name}</h1>
          <p className="text-muted-foreground">{tool.shortDescription}</p>

          <h2>About {tool.name}</h2>
          <p>{tool.description || "No description available."}</p>

          {tool.howItWorks && (
            <>
              <h2>How it works</h2>
              <p>{tool.howItWorks}</p>
            </>
          )}

          {tool.keyFeatures?.length > 0 && (
            <>
              <h2>Key Features</h2>
              <ul>
                {tool.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}

          {tool.faqs?.length > 0 && (
            <>
              <h2>FAQs</h2>
              <Accordion type="multiple">
                {tool.faqs.map((faq: any, i: number) => (
                  <AccordionItem value={`faq-${i}`} key={i}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}

          {/* Inline Ad Placeholder */}
          <div className="bg-gray-100 w-full h-[90px] rounded-md my-6 text-center text-sm flex items-center justify-center">
            Ad Placeholder (728x90)
          </div>

          {/* Reviews */}
          <div className="border-t pt-4 mt-8">
            <h2>User Reviews</h2>
            <p className="text-muted-foreground text-sm">Ratings and reviews coming soon.</p>
          </div>

          {/* Embedded Video */}
          {tool.videoUrl && (
            <div className="mt-6">
              <h2>Product Demo</h2>
              <div className="aspect-video">
                <iframe
                  src={tool.videoUrl}
                  className="w-full h-full rounded"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={`${tool.name} demo video`}
                />
              </div>
            </div>
          )}

          {/* Similar Tools */}
          {similarTools && similarTools.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">Similar Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarTools.map((tool: any) => (
                  <ToolCard key={tool.id} tool={tool} showDescription={false} />
                ))}
              </div>
            </div>
          )}

          {/* Submit Your Tool CTA */}
          <div className="mt-10 text-center border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">Know a tool that belongs here?</h2>
            <p className="text-sm mb-4 text-muted-foreground">Submit your AI tool and get featured on Probe AI.</p>
            <a href="/submit">
              <Button>Submit Your Tool</Button>
            </a>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="sticky top-10 space-y-4 hidden lg:block">
          <Card>
            <CardHeader><CardTitle>Tool Information</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Category:</span><span>{tool.category}</span></div>
              <div className="flex justify-between"><span>Pricing:</span><span>{tool.pricingType}</span></div>
              <div className="flex justify-between"><span>Access:</span><span>{tool.accessType}</span></div>
              <div className="flex justify-between"><span>Audience:</span><span>{tool.audience}</span></div>
              <div className="flex justify-between"><span>AI Tech:</span><span>{tool.aiTech}</span></div>
              <div className="flex justify-between"><span>Rating:</span><span>{tool.rating || "4.8"}</span></div>
              <div className="flex justify-between"><span>Reviews:</span><span>{tool.reviews || "1.2K"}</span></div>
            </CardContent>
          </Card>

          {tool.tags?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {tool.tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-muted px-2 py-1 text-xs rounded">{tag}</span>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Stay Updated</CardTitle></CardHeader>
            <CardContent>
              <input
                type="email"
                placeholder="Your email"
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
              />
              <Button className="w-full">Subscribe</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
