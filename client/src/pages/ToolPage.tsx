import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ExternalLink,
  Star,
  DollarSign,
  Heart,
} from "lucide-react";
import { useState } from "react";

export default function ToolPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const toolIdentifier = id;

  const { data: tool } = useQuery({ queryKey: [`/api/tools/${toolIdentifier}`] });
  const { data: similarTools = [] } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}/similar`],
    enabled: !!toolIdentifier,
    retry: false,
  });

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/share?url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  if (!tool) return <Layout><div className="text-center py-10">Tool not found</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col items-center gap-4">
          {tool.logoUrl && <img src={tool.logoUrl} alt={`${tool.name} logo`} className="w-20 h-20 rounded-lg object-cover" />}
          {tool.badge && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{tool.badge}</span>}

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

          <div className="flex gap-3 justify-center w-full">
            <Heart className="w-5 h-5 cursor-pointer" />
            <img onClick={() => handleShare('twitter')} src="https://cdn.jsdelivr.net/npm/simple-icons/icons/twitter.svg" className="w-5 h-5 cursor-pointer" />
            <img onClick={() => handleShare('linkedin')} src="https://cdn.jsdelivr.net/npm/simple-icons/icons/linkedin.svg" className="w-5 h-5 cursor-pointer" />
            <img onClick={() => handleShare('facebook')} src="https://cdn.jsdelivr.net/npm/simple-icons/icons/facebook.svg" className="w-5 h-5 cursor-pointer" />
          </div>

          {/* EMBED BADGE */}
          <div className="bg-muted p-4 rounded w-full">
            <h3 className="font-semibold text-sm mb-2">Get more visibility</h3>
            <p className="text-xs text-muted-foreground mb-3">Add this badge to your site</p>
            <img src="https://probeai.io/badges/featured-light.png" className="rounded border mb-2 w-full h-auto" />
            <Button size="sm" onClick={() => navigator.clipboard.writeText(`<a href='https://probeai.io/tools/${tool.slug}'><img src='https://probeai.io/badges/featured-light.png'/></a>`)}>Copy Light Embed</Button>
          </div>

          <div className="bg-gray-100 w-full h-[300px] rounded-md text-center text-sm flex items-center justify-center">
            Ad Placeholder (300x600)
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="prose dark:prose-invert max-w-none">
          <h1>{tool.name}</h1>
          <p>{tool.shortDescription}</p>

          <h2>About</h2>
          <p>{tool.description}</p>

          {tool.howItWorks && <><h2>How it works</h2><p>{tool.howItWorks}</p></>}

          <h2>Tool Comparison</h2>
          <p>Comparison Table Placeholder</p>

          {tool.keyFeatures?.length > 0 && (
            <><h2>Key Features</h2><ul>{tool.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}</ul></>
          )}

          <h2>Pros & Cons</h2>
          <p>Placeholder for pros/cons</p>

          {tool.faqs?.length > 0 && (
            <><h2>FAQs</h2><Accordion type="multiple">{tool.faqs.map((faq: any, i: number) => (
              <AccordionItem value={`faq-${i}`} key={i}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}</Accordion></>
          )}

          <div className="bg-gray-100 h-[90px] text-center flex items-center justify-center my-4">Ad Placeholder</div>
          <div className="bg-yellow-100 p-4 text-center">Featured Tool Banner Placeholder</div>

          <div className="bg-gray-50 mt-8 py-4 px-2 border-t">
            <h2 className="text-xl font-bold mb-4">Similar Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarTools.map((tool: any) => (
                <ToolCard key={tool.id} tool={tool} showDescription={false} />
              ))}
            </div>
          </div>

          <div className="text-center mt-10 border-t pt-6">
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
            <CardHeader><CardTitle>Tool Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Category</span><span>{tool.category}</span></div>
              <div className="flex justify-between"><span>Pricing</span><span>{tool.pricingType}</span></div>
              <div className="flex justify-between"><span>Access</span><span>{tool.accessType}</span></div>
              <div className="flex justify-between"><span>Audience</span><span>{tool.audience}</span></div>
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
            <CardHeader><CardTitle>Featured Tools</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">Promoted tool cards go here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
