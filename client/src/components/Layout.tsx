import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Moon,
  Sun,
  Heart,
  Plus,
  LogOut,
  User,
  Menu,
  X,
  Twitter,
  Github,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebaseAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "AI Tools", href: "/tools", active: location === "/tools" },
    { name: "AI News", href: "/news", active: location === "/news" },
    { name: "Blog", href: "/blog", active: location.startsWith("/blog") },
    { name: "Submit", href: "/submit", active: location === "/submit" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logo-dark.png" alt="Probe AI Logo" className="h-10 w-auto" />
              <span className="text-2xl font-extrabold text-foreground tracking-tight">
                Probe AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 ml-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    item.active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="w-9 h-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={(user as any)?.profileImageUrl || ""}
                          alt={(user as any)?.firstName || ""}
                        />
                        <AvatarFallback>
                          {(user as any)?.firstName?.[0] ||
                            (user as any)?.email?.[0] ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {(user as any)?.firstName && (
                          <p className="font-medium">
                            {(user as any)?.firstName} {(user as any)?.lastName}
                          </p>
                        )}
                        {(user as any)?.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {(user as any)?.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=likes" className="w-full cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        Liked Tools
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile?tab=submissions"
                        className="w-full cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        My Submissions
                      </Link>
                    </DropdownMenuItem>
                    {(user as any)?.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => (window.location.href = "/api/logout")}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={signInWithGoogle}>Sign In</Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 pt-4 pb-3">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      item.active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-muted bg-muted/40 py-10 text-sm">
  <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
    
    {/* Left: Logo + About */}
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <img src="/logo-dark.png" alt="Probe AI" className="h-6 w-6" />
        <span className="font-semibold text-lg">Probe AI</span>
      </div>
      <p className="text-muted-foreground max-w-md">
        Your go-to directory for discovering, comparing, and staying updated with the latest AI tools and technologies.
      </p>
      <div className="flex gap-4 text-muted-foreground">
        <a href="#" aria-label="Twitter"><i className="fab fa-twitter" /></a>
        <a href="#" aria-label="GitHub"><i className="fab fa-github" /></a>
        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin" /></a>
        <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
      </div>
    </div>

    {/* Right: Newsletter */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📬 Stay updated with AI trends</h3>
      <p className="text-muted-foreground max-w-md">
        Get weekly updates on tools, videos, and news — no spam, just breakthroughs.
      </p>
      <form className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          className="w-full sm:w-auto px-4 py-2 rounded-md border border-input bg-background text-sm"
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md text-sm">
          Subscribe
        </button>
      </form>
    </div>

  </div>

  {/* Bottom Line */}
  <div className="mt-10 text-center text-muted-foreground text-xs">
    © 2024 Probe AI. All rights reserved.
    <div className="mt-1">
      <a href="/privacy" className="underline mr-4">Privacy Policy</a>
      <a href="/terms" className="underline">Terms of Service</a>
    </div>
  </div>
</footer>
    </div>
  );
}
