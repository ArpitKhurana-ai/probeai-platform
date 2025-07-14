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
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { useState } from "react";

// Helper: Always return a valid hostname or ""
function getValidHostname(website?: string) {
  try {
    if (!website) return "";
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

// Helper: Always return a full link for "Visit" button
function getValidUrl(url?: string) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

// Helper: Defensive normalization for list fields (array or fallback)
function safeList(val: any): string[] {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string" && val.trim())
    return val.split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

// NEW Helper: force any array-like or JSON-brace string into string[]
function forceArray(val: any): string[] {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .replace(/^\{|\}$/g, "") // remove braces
      .replace(/"/g, "")       // remove quotes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Helper: Defensive for pros/cons
function safeProsCons(val: any): { pros: string[]; cons: string[] } {
  if (val && typeof val === "object") {
    return {
      pros: safeList(val.pros),
      cons: safeList(val.cons),
    };
  }
  return { pros: [], cons: [] };
}

// Helper: Normalize FAQs
function normalizeFAQs(rawFaqs: any): { question: string; answer: string }[] {
  if (!Array.isArray(rawFaqs)) return [];
  return rawFaqs
    .map((faq: any) => {
      if (faq && typeof faq === "object") {
        return {
          question: faq.question || faq.q || "",
          answer: faq.answer || faq.a || "",
        };
      } else if (typeof faq === "string") {
        const match = faq.match(/^Q[:\-]?\s*(.+)\s*A[:\-]?\s*(.+)$/i);
        if (match) {
          return { question: match[1], answer: match[2] };
        }
        return { question: faq, answer: "" };
      }
      return { question: "", answer: "" };
    })
    .filter((f) => f.question && f.answer);
}

export default function ToolPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedBadge, setCopiedBadge] = useState<"light" | "dark" | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const toolIdentifier = id;

  const { data: tool } = useQuery({ queryKey: [`/api/tools/${toolIdentifier}`] });
  const { data: similarTools = [] } = useQuery({
    queryKey: [`/api/tools/${toolIdentifier}/similar`],
    enabled: !!toolIdentifier,
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async () =>
      await apiRequest(`/api/tools/${toolIdentifier}/like`, { method: "POST" }),
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/tools/${toolIdentifier}`] });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in required", description: "Please sign in to like tools", variant: "destructive" });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/share?url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    window.open(links[platform], "_blank");
  };

  const handleCopyEmbed = (mode: "light" | "dark") => {
    const code = `<a href='https://probeai.io/tools/${tool?.slug}' target='_blank'><img src='https://probeai.io/badges/featured-${mode}.png' width="160" height="600"/></a>`;
    navigator.clipboard.writeText(code);
    setCopiedBadge(mode);
    setTimeout(() => setCopiedBadge(null), 2000);
  };

  if (!tool && !toolIdentifier) {
    return (
      <Layout>
        <div className="text-center py-10">Tool not found</div>
      </Layout>
    );
  }
  if (!tool) {
    return (
      <Layout>
        <div className="text-center py-10">Loading...</div>
      </Layout>
    );
  }

  // Prepare lists
  const keyFeatures = safeList(tool.keyFeatures);
  const useCases = safeList(tool.useCases);
  const tags = safeList(tool.tags);
  const prosAndCons = safeProsCons(tool.prosAndCons);
  const faqsArr = normalizeFAQs(tool.faqs);

  // Safe howItWorks
  const howItWorks = (tool.howItWorks || "").trim();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col gap-4 border p-4 rounded-md sticky top-6 h-fit">
          <img
            src={
              tool.logoUrl
                ? tool.logoUrl
                : tool.url
                ? `https://unavatar.io/${getValidHostname(tool.url)}`
                : "/placeholder.svg"
            }
            alt={`${tool.name} logo`}
            className="w-20 h-20 mx-auto rounded-lg object-cover"
          />
          {tool.badge && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-center">{tool.badge}</span>}
          <a href={getValidUrl(tool.url)} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full"><ExternalLink className="w-4 h-4 mr-2" /> Visit</Button>
          </a>
          <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold w-full"><Star className="w-4 h-4 mr-2" /> Promote</Button>
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

          <div className="flex gap-4 justify-center w-full items-center mt-2">
            <Heart className={`w-5 h-5 cursor-pointer ${isLiked ? "text-red-500" : ""}`} onClick={handleLike} />
            <Twitter className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleShare("twitter")} />
            <Linkedin className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleShare("linkedin")} />
            <Facebook className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleShare("facebook")} />
            <Instagram className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => handleShare("instagram")} />
          </div>

          <div className="bg-muted p-3 rounded w-full">
            <h3 className="font-semibold text-sm mb-1">Get more visibility</h3>
            <p className="text-xs text-muted-foreground mb-3">Add this badge to your site</p>
            <img src="https://probeai.io/badges/featured-light.png" className="rounded border mb-1 w-full" />
            <Button size="sm" variant="outline" className="w-full" onClick={() => handleCopyEmbed("light")}>{copiedBadge === "light" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
            <img src="https://probeai.io/badges/featured-dark.png" className="rounded border mt-3 mb-1 w-full" />
            <Button size="sm" variant="outline" className="w-full" onClick={() => handleCopyEmbed("dark")}>{copiedBadge === "dark" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
          </div>
          <div className="bg-muted w-full h-[300px] rounded-md text-center text-sm flex items-center justify-center">Ad Placeholder (300x600)</div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col gap-6">
          <div><h1 className="text-3xl font-bold">{tool.name}</h1><p className="text-muted-foreground mt-1">{tool.shortDescription}</p></div>
          <div className="bg-card border border-muted rounded p-4 text-card-foreground"><h2 className="text-xl font-semibold mb-2">About</h2><p>{tool.description}</p></div>
          {howItWorks && (
            <div className="bg-card border border-muted rounded p-4 text-card-foreground">
              <h2 className="text-xl font-semibold mb-2">How it works</h2>
              <p>{howItWorks}</p>
            </div>
          )}
          <div className="bg-card border border-muted rounded p-4 text-card-foreground"><h2 className="text-xl font-semibold mb-2">Key Features</h2>{keyFeatures.length>0? <ul className="list-disc list-inside space-y-1">{keyFeatures.map((f,i)=><li key={i}>{f}</li>)}</ul>:<p className="text-muted-foreground text-sm">No features listed.</p>}</div>
          <div className="bg-card border border-muted rounded p-4 text-card-foreground"><h2 className="text-xl font-semibold mb-2">Use Cases</h2>{useCases.length>0? <ul className="list-disc list-inside space-y-1">{useCases.map((u,i)=><li key={i}>{u}</li>)}</ul>:<p className="text-muted-foreground text-sm">No use cases listed.</p>}</div>
          <div className="bg-card border border-muted rounded p-4 text-card-foreground"><h2 className="text-xl font-semibold mb-2">Pros & Cons</h2>{(prosAndCons.pros.length>0||prosAndCons.cons.length>0)?<div className="grid grid-cols-2 gap-4 text-sm"><div><h3 className="font-semibold mb-1">Pros</h3><ul className="list-disc list-inside">{prosAndCons.pros.map((p,i)=><li key={i}>{p}</li>)}</ul></div><div><h3 className="font-semibold mb-1">Cons</h3><ul className="list-disc list-inside">{prosAndCons.cons.map((c,i)=><li key={i}>{c}</li>)}</ul></div></div>:<p className="text-muted-foreground text-sm">No pros/cons available.</p>}</div>
          <div className="bg-card border border-muted rounded p-4 text-card-foreground"><h2 className="text-xl font-semibold mb-2">FAQs</h2>{faqsArr.length>0?<Accordion type="multiple">{faqsArr.map((faq,i)=><AccordionItem value={`faq-${i}`} key={i}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}</Accordion>:<p className="text-muted-foreground text-sm">No FAQs available.</p>}</div>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-6 text-center rounded font-medium text-sm w-full" style={{minHeight:"90px",maxWidth:"728px"}}>Featured Tool Banner Placeholder (728x90)</div>
          <div className="bg-muted p-6 text-center rounded font-medium text-sm w-full" style={{minHeight:"90px",maxWidth:"728px"}}>Google Ad Banner Placeholder (728x90)</div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4 sticky top-6 h-fit hidden lg:block">
          <Card><CardHeader><CardTitle>Tool Info</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Category</span><span>{tool.category}</span></div>
            <div className="flex justify-between"><span>Pricing</span><span>{tool.pricingType||"-"}</span></div>
            <div className="flex justify-between"><span>Access</span><span>{forceArray(tool.accessType).join(", ")||"-"}</span></div>
            <div className="flex justify-between"><span>Audience</span><span>{forceArray(tool.audience).join(", ")||"-"}</span></div>
          </CardContent></Card>
          {tags.length>0&&<Card><CardHeader><CardTitle>Tags</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{tags.map((t,i)=><span key={i} className="bg-muted px-2 py-1 text-xs rounded">{t}</span>)}</CardContent></Card>}
          <Card><CardHeader><CardTitle>Featured Tools</CardTitle></CardHeader><CardContent className="space-y-3">{tool.featuredTools?.length>0?tool.featuredTools.map((t:any)=><ToolCard key={t.id} tool={t}/>):[1,2,3].map((_,i)=><ToolCard key={i} tool={{name:`Tool ${i+1}`,slug:`tool-${i+1}`,logoUrl:"https://placehold.co/64x64",shortDescription:"Short description here",category:"AI"}}/> )}</CardContent></Card>
        </div>
      </>
    </Layout>
  );
}
