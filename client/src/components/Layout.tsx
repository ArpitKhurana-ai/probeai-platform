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

      {/* Restored Social Media Icons */}
      <div className="flex gap-4 text-muted-foreground">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <svg className="h-5 w-5 hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 001.88-2.35 8.48 8.48 0 01-2.7 1.03A4.24 4.24 0 0016.1 4c-2.34 0-4.23 1.9-4.23 4.24 0 .33.04.66.1.97A12.04 12.04 0 013 5.15a4.23 4.23 0 001.31 5.65A4.2 4.2 0 012.8 10v.05c0 2.05 1.46 3.77 3.4 4.16-.35.1-.73.15-1.12.15-.27 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.5 8.5 0 012 19.53a12.01 12.01 0 006.49 1.9c7.8 0 12.07-6.46 12.07-12.07 0-.18 0-.36-.01-.53A8.6 8.6 0 0024 5.5a8.48 8.48 0 01-2.54.7z" />
          </svg>
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <svg className="h-5 w-5 hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48v-1.68c-2.78.62-3.37-1.34-3.37-1.34-.45-1.18-1.1-1.5-1.1-1.5-.9-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.44 9.44 0 0112 7.6c.85 0 1.7.12 2.5.35 1.9-1.33 2.73-1.05 2.73-1.05.56 1.4.21 2.44.1 2.7.64.72 1.02 1.64 1.02 2.76 0 3.93-2.34 4.78-4.57 5.03.36.32.69.94.69 1.9v2.81c0 .26.18.59.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z" />
          </svg>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg className="h-5 w-5 hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.98 3.5a2.5 2.5 0 11-.01 5.01 2.5 2.5 0 01.01-5.01zM4 9h2v10H4zm5.09 0h1.9v1.41h.03c.26-.5.9-1.02 1.86-1.02 2 0 2.37 1.3 2.37 2.99V19h-2v-5.29c0-1.26-.45-2.12-1.58-2.12-.86 0-1.38.58-1.6 1.14-.08.2-.1.47-.1.74V19h-2V9z" />
          </svg>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg className="h-5 w-5 hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.6 3.2H4.4A1.2 1.2 0 003.2 4.4v15.2a1.2 1.2 0 001.2 1.2h15.2a1.2 1.2 0 001.2-1.2V4.4a1.2 1.2 0 00-1.2-1.2zm-9 12.4V8.4l6 3.6-6 3.6z" />
          </svg>
        </a>
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
