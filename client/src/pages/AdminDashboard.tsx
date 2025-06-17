import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Settings, Users, FileText, Video, TrendingUp, Plus, Edit, Trash2, Tag, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertToolSchema, insertNewsSchema, insertBlogSchema, insertVideoSchema, insertCategorySchema } from "@shared/types";
import { z } from "zod";

type AdminSection = "dashboard" | "tools" | "categories" | "news" | "blogs" | "videos" | "users";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Check if user is admin
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "tools", label: "Tools", icon: Settings },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "news", label: "News", icon: FileText },
    { id: "blogs", label: "Blogs", icon: FileText },
    { id: "videos", label: "Videos", icon: Video },
    { id: "users", label: "Users", icon: Users },
  ] as const;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-muted/40 border-r">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <nav className="space-y-1 px-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeSection === "dashboard" && <DashboardContent />}
          {activeSection === "tools" && <ToolsContent />}
          {activeSection === "categories" && <CategoriesContent />}
          {activeSection === "news" && <NewsContent />}
          {activeSection === "blogs" && <BlogsContent />}
          {activeSection === "videos" && <VideosContent />}
          {activeSection === "users" && <UsersContent />}
        </div>
      </div>
    </div>
  );
}

// Dashboard overview component
function DashboardContent() {
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["/api/admin/pending"],
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const totalPending = (pendingData?.tools?.length || 0) + 
                      (pendingData?.news?.length || 0) + 
                      (pendingData?.blogs?.length || 0) + 
                      (pendingData?.videos?.length || 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tools</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData?.tools?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending News</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData?.news?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Blogs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData?.blogs?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData?.videos?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest items awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingSubmissions />
        </CardContent>
      </Card>
    </div>
  );
}

// Pending submissions component
function PendingSubmissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: pendingData } = useQuery({
    queryKey: ["/api/admin/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ type, id, approved }: { type: string; id: number; approved: boolean }) => {
      await apiRequest(`/api/admin/approve/${type}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ approved }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      toast({
        title: "Success",
        description: "Submission status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    },
  });

  const handleApproval = (type: string, id: number, approved: boolean) => {
    approveMutation.mutate({ type, id, approved });
  };

  const allPending = [
    ...(pendingData?.tools?.map((item: any) => ({ ...item, type: "tools" })) || []),
    ...(pendingData?.news?.map((item: any) => ({ ...item, type: "news" })) || []),
    ...(pendingData?.blogs?.map((item: any) => ({ ...item, type: "blogs" })) || []),
    ...(pendingData?.videos?.map((item: any) => ({ ...item, type: "videos" })) || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (allPending.length === 0) {
    return <p className="text-muted-foreground">No pending submissions</p>;
  }

  return (
    <div className="space-y-4">
      {allPending.slice(0, 5).map((item: any) => (
        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold">{item.name || item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{item.type}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApproval(item.type, item.id, true)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleApproval(item.type, item.id, false)}
              disabled={approveMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Tools management component
function ToolsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ["/api/admin/tools", { limit: 100, page: 1 }],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/tools/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      toast({ title: "Success", description: "Tool deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete tool", variant: "destructive" });
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      await apiRequest(`/api/admin/tools/${id}/featured`, {
        method: "POST",
        body: JSON.stringify({ featured, days: 30 }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      toast({ title: "Success", description: "Tool featured status updated" });
    },
  });

  const hotMutation = useMutation({
    mutationFn: async ({ id, hot }: { id: number; hot: boolean }) => {
      await apiRequest(`/api/admin/tools/${id}/hot`, {
        method: "POST",
        body: JSON.stringify({ hot }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      toast({ title: "Success", description: "Tool hot status updated" });
    },
  });

  if (isLoading) return <div>Loading tools...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tools Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Tool</DialogTitle>
              <DialogDescription>Create a new AI tool entry</DialogDescription>
            </DialogHeader>
            <CreateToolForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {toolsData?.items?.map((tool: any) => (
              <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tool.name}</h3>
                    {tool.isFeatured && <Badge variant="secondary">Featured</Badge>}
                    {tool.isHot && <Badge variant="destructive">Hot</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{tool.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tool.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={tool.isFeatured ? "default" : "outline"}
                    onClick={() => featureMutation.mutate({ id: tool.id, featured: !tool.isFeatured })}
                    disabled={featureMutation.isPending}
                  >
                    {tool.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                  <Button
                    size="sm"
                    variant={tool.isHot ? "destructive" : "outline"}
                    onClick={() => hotMutation.mutate({ id: tool.id, hot: !tool.isHot })}
                    disabled={hotMutation.isPending}
                  >
                    {tool.isHot ? "Remove Hot" : "Make Hot"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(tool.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Categories management component  
function CategoriesContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new tool category</DialogDescription>
            </DialogHeader>
            <CreateCategoryForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category: any) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(category.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// News management component
function NewsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["/api/news", { limit: 100 }],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/news/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete news", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading news...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">News Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add News
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {newsData?.items?.map((article: any) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{article.source}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(article.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Blogs management component  
function BlogsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["/api/blogs", { limit: 100 }],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/blogs/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Success", description: "Blog deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading blogs...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blogs Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Blog
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {blogsData?.items?.map((blog: any) => (
              <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{blog.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{blog.excerpt}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(blog.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Videos management component
function VideosContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["/api/videos", { limit: 100 }],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/videos/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({ title: "Success", description: "Video deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete video", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading videos...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Videos Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {videosData?.items?.map((video: any) => (
              <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.channel}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{video.duration}</span>
                    <span className="text-xs text-muted-foreground">{video.views}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(video.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Users management component
function UsersContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}/admin`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User admin status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users Management</h1>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {users?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                    {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className="text-xs text-muted-foreground">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={user.isAdmin ? "destructive" : "outline"}
                  onClick={() => toggleAdminMutation.mutate(user.id)}
                  disabled={toggleAdminMutation.isPending}
                >
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Form components for creating new items
function CreateToolForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(insertToolSchema.extend({
      tags: z.string().transform(str => str.split(',').map(tag => tag.trim())),
    })),
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      logoUrl: "",
      category: "",
      tags: "",
      pricing: "free",
      isApproved: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/tools", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tools"] });
      toast({ title: "Success", description: "Tool created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create tool", variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ai, chatbot, productivity" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Create Tool
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateCategoryForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({ title: "Success", description: "Category created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="ai-tools" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Create Category
          </Button>
        </div>
      </form>
    </Form>
  );
}