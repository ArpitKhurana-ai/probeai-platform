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
  Heart,
  ExternalLink,
  Star,
  DollarSign,
} from "lucide-react";
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
        description: "Login to like tools",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  if (!tool)
    return (
      <Layout>
        <div className="text-center py-10">Tool not found</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col items-center gap-4">
          {tool.logoUrl && (
            <img
              src={tool.logoUrl}
              alt={`${tool.name} logo`}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          {tool.badge && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {tool.badge}
            </span>
          )}
          <Button variant="outline" onClick={handleLike} className="w-full">
            <Heart className="w-4 h-4 mr-2" /> Like
          </Button>
          <div className="flex gap-3 justify-center w-full">
            <a
              href={`https://twitter.com/share?url=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/twitter.svg"
                alt="Twitter"
                className="w-5 h-5 hover:opacity-80"
              />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/linkedin.svg"
                alt="LinkedIn"
                className="w-5 h-5 hover:opacity-80"
              />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://cdn.jsdelivr.net/npm/simple-icons/icons/facebook.svg"
                alt="Facebook"
                className="w-5 h-5 hover:opacity-80"
              />
            </a>
          </div>
          <a
            href={tool.website}
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

          <div className="bg-gray-100 w-full h-[300px] rounded-md mt-4 text-center text-sm flex items-center justify-center">
            Ad Placeholder (300x600)
          </div>

          <div className="bg-muted p-4 rounded w-full mt-4">
            <h3 className="font-semibold text-sm mb-2">Get more visibility</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add this badge to your site to show you're featured on Probe AI.
            </p>

            <div className="bg-white p-2 rounded border mb-4">
              <img
                src="https://probeai.io/badges/featured-light.png"
                alt="Featured on Probe AI - Light"
                className="w-full rounded"
              />
              <Button
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `<a href="https://probeai.io/tools/${tool.slug}" target="_blank" rel="noopener">
  <img src="https://probeai.io/badges/featured-light.png" alt="Featured on Probe AI" width="160" height="600" />
</a>`
                  )
                }
              >
                Copy Embed Code (Light)
              </Button>
            </div>

            <div className="bg-white p-2 rounded border">
              <img
                src="https://probeai.io/badges/featured-dark.png"
                alt="Featured on Probe AI - Dark"
                className="w-full rounded"
              />
              <Button
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `<a href="https://probeai.io/tools/${tool.slug}" target="_blank" rel="noopener">
  <img src="https://probeai.io/badges/featured-dark.png" alt="Featured on Probe AI" width="160" height="600" />
</a>`
                  )
                }
              >
                Copy Embed Code (Dark)
              </Button>
            </div>
          </div>
        </div>

        {/* The center and right columns remain unchanged */}
      </div>
    </Layout>
  );
}
