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

// ------------------ Helper functions ------------------
function forceArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return val
      .replace(/^\{|\}$/g, "")
      .replace(/"/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function safeList(val: any): string[] {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string" && val.trim())
    return val.split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

function safeProsCons(val: any): { pros: string[]; cons: string[] } {
  if (val && typeof val === "object") {
    return {
      pros: safeList(val.pros),
      cons: safeList(val.cons),
    };
  }
  return { pros: [], cons: [] };
}

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

// ------------------ Component ------------------
export default function ToolPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedBadge, setCopiedBadge] = useState<"light" | "dark" | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const toolIdentifier = slug;

console.log("ToolPage slug:", toolIdentifier);

const { data: tool, isLoading, isError } = useQuery({
  queryKey: [`/api/tools/${toolIdentifier}`],
  enabled: !!toolIdentifier,
  select: (data) => {
    console.log("Raw data fetched for tool:", data);
    return Array.isArray(data) ? data[0] : data; // If backend returns an array
  },
});
console.log("Tool data fetched:", tool);


 const { data: similarTools = [] } = useQuery({
  queryKey: toolIdentifier ? [`/api/tools/${toolIdentifier}/similar`] : [],
  enabled: !!toolIdentifier,
  retry: false,
});


  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/tools/${toolIdentifier}/like`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({
        queryKey: [`/api/tools/${toolIdentifier}`],
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like tools",
        variant: "destructive",
      });
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

  // Loading and Error states
  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-10">Loading...</div>
      </Layout>
    );
  }

  if (isError || !tool) {
    return (
      <Layout>
        <div className="text-center py-10 text-red-500">
          Tool not found or failed to load.
        </div>
      </Layout>
    );
  }

  // Normalized fields
  const keyFeatures = safeList(tool.keyFeatures);
  const useCases = safeList(tool.useCases);
  const tags = safeList(tool.tags);
  const prosAndCons = safeProsCons(tool.prosAndCons);
  const faqsArr = normalizeFAQs(tool.faqs);

  const howItWorksRaw =
    typeof tool.howItWorks === "string" &&
    tool.howItWorks.toLowerCase().trim() !== "null"
      ? tool.howItWorks.trim()
      : "";

  const howItWorks = howItWorksRaw
    ? howItWorksRaw.replace(/(Step\s*\d+:)/g, "\n$1").trim()
    : "";

  // ------------------ JSX ------------------
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col gap-4 border p-4 rounded-md sticky top-6 h-fit">
          <img
            src={tool.logo || tool.logoUrl || "/placeholder.svg"}
            alt={tool.name ? `${tool.name} logo` : "Tool logo"}
            className="w-20 h-20 mx-auto rounded-lg object-cover"
          />

          {tool.badge && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-center">
              {tool.badge}
            </span>
          )}

          <a
            href={
              tool.url
                ? tool.url.startsWith("http")
                  ? tool.url
                  : `https://${tool.url}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" /> Visit
            </Button>
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
                <DialogDescription>
                  Get featured for 30 days on homepage, search, and newsletter
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-4">
                <p className="text-xl font-bold mb-2">$100</p>
                <Button>
                  <DollarSign className="mr-2 w-4 h-4" /> Promote Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-4 justify-center w-full items-center mt-2">
            <Heart
              className={`w-5 h-5 cursor-pointer ${
                isLiked ? "text-red-500" : ""
              }`}
              onClick={handleLike}
            />
            <Twitter
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleShare("twitter")}
            />
            <Linkedin
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleShare("linkedin")}
            />
            <Facebook
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleShare("facebook")}
            />
            <Instagram
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleShare("instagram")}
            />
          </div>

          <div className="bg-muted p-3 rounded w-full">
            <h3 className="font-semibold text-sm mb-1">Get more visibility</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add this badge to your site
            </p>

            <img
              src="https://probeai.io/badges/featured-light.png"
              className="rounded border mb-1 w-full"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleCopyEmbed("light")}
            >
              {copiedBadge === "light" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>

            <img
              src="https://probeai.io/badges/featured-dark.png"
              className="rounded border mt-3 mb-1 w-full"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleCopyEmbed("dark")}
            >
              {copiedBadge === "dark" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="bg-muted w-full h-[300px] rounded-md text-center text-sm flex items-center justify-center">
            Ad Placeholder (300x600)
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{tool.name}</h1>
            <p className="text-muted-foreground mt-1">
              {tool.shortDescription}
            </p>
          </div>

          <div className="bg-card border border-muted rounded p-4 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p>{tool.description}</p>
          </div>

          {howItWorks && (
            <div className="bg-card border border-muted rounded p-4 text-card-foreground">
              <h2 className="text-xl font-semibold mb-2">How it works</h2>
              <p>
                {howItWorks.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
          )}

          <div className="bg-card border border-muted rounded p-4 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">Key Features</h2>
            {keyFeatures.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {keyFeatures.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No features listed.</p>
            )}
          </div>

          <div className="bg-card border border-muted rounded p-4 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">Use Cases</h2>
            {useCases.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {useCases.map((uc: string, idx: number) => (
                  <li key={idx}>{uc}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No use cases listed.</p>
            )}
          </div>

          <div className="bg-card border border-muted rounded p-4 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">Pros & Cons</h2>
            {prosAndCons.pros.length > 0 || prosAndCons.cons.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Pros</h3>
                  <ul className="list-disc list-inside">
                    {prosAndCons.pros.map((pro: string, i: number) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Cons</h3>
                  <ul className="list-disc list-inside">
                    {prosAndCons.cons.map((con: string, i: number) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No pros/cons available.</p>
            )}
          </div>

          <div className="bg-card border border-muted rounded p-4 text-card-foreground">
            <h2 className="text-xl font-semibold mb-2">FAQs</h2>
            {faqsArr.length > 0 ? (
              <Accordion type="multiple">
                {faqsArr.map((faq, i) => (
                  <AccordionItem value={`faq-${i}`} key={i}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-sm">No FAQs available.</p>
            )}
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900 p-6 text-center rounded font-medium text-sm w-full">
            Featured Tool Banner Placeholder (728x90)
          </div>

          <div className="bg-muted p-6 text-center rounded font-medium text-sm w-full">
            Google Ad Banner Placeholder (728x90)
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4 sticky top-6 h-fit hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Tool Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span>Category</span>
                <span>{tool.category}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span>Pricing</span>
                <span>{tool.pricingType || "-"}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span>Access</span>
                <span
                  className="max-w-[160px] overflow-x-auto whitespace-nowrap"
                  style={{ display: "inline-block" }}
                  tabIndex={0}
                  title={forceArray(tool.access).join(", ")}
                >
                  {forceArray(tool.access).join(", ") || "-"}
                </span>
              </div>
             <div className="flex justify-between items-start gap-4">
  <span>Audience</span>
  <span
    className="max-w-[160px] overflow-x-auto whitespace-nowrap audience-scrollbar"
    style={{ display: "inline-block" }}
    tabIndex={0}
    title={forceArray(tool.audience).join(", ")}
  >
    {forceArray(tool.audience).join(", ") || "-"}
  </span>
</div>
            </CardContent>
          </Card>

          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-muted px-2 py-1 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Featured Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tool.featuredTools?.length > 0 ? (
                tool.featuredTools.map((t: any) => (
                  <ToolCard key={t.id} tool={t} />
                ))
              ) : (
                [1, 2, 3].map((_, i) => (
                  <ToolCard
                    key={i}
                    tool={{
                      name: `Tool ${i + 1}`,
                      slug: `tool-${i + 1}`,
                      logoUrl: "https://placehold.co/64x64",
                      shortDescription: "Short description here",
                      category: "AI",
                      access: ["Web App", "API"],
                      audience: ["Startups", "Founders"],
                    }}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SIMILAR TOOLS */}
      <div className="container mx-auto px-4 pt-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">Similar Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tool && similarTools.length > 0
            ? similarTools
                .filter((t: any) => t.id !== tool.id)
                .slice(0, 6)
                .map((t: any) => (
                  <ToolCard key={t.id} tool={t} showDescription={false} />
                ))
            : [1, 2, 3].map((_, i) => (
                <ToolCard
                  key={i}
                  tool={{
                    name: `Sample Tool ${i + 1}`,
                    slug: `sample-tool-${i + 1}`,
                    logoUrl: "https://placehold.co/64x64",
                    shortDescription: "This is a placeholder tool.",
                    category: "Example Category",
                    access: ["Web App", "API"],
                    audience: ["Developers", "Startups"],
                  }}
                  showDescription={true}
                />
              ))}
        </div>

        <div className="text-center mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">Know a tool that belongs here?</h2>
          <p className="text-sm mb-4 text-muted-foreground">
            Submit your AI tool and get featured on Probe AI.
          </p>
          <a href="/submit">
            <Button>Submit Your Tool</Button>
          </a>
        </div>

        <div
          className="bg-muted p-6 text-center mt-6 rounded font-medium text-sm w-full"
          style={{
            minHeight: "90px",
            width: "100%",
            maxWidth: "728px",
            margin: "0 auto",
          }}
        >
          Google Ad Banner Placeholder (728x90)
        </div>
      </div>
    </Layout>
  );
}
