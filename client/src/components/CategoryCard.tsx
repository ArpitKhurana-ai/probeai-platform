import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
  count?: number;
}

export function CategoryCard({ name, icon: Icon, href, count }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer group bg-background border border-border rounded-full p-2 h-10 flex items-center justify-center gap-1.5 hover:bg-muted/50">
        <Icon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate leading-none">
          {name}
        </span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground ml-1 flex-shrink-0">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}
