import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { NewsCard } from "@/components/NewsCard";
import { BlogCard } from "@/components/BlogCard";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Plus, User, Calendar, Mail } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: likedTools, isLoading: likedLoading } = useQuery({
    queryKey: ["/api/user/likes"],
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["/api/user/submissions"],
  });

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">You need to be signed in to view your profile.</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || ""} />
                <AvatarFallback className="text-2xl">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.firstName || "User"
                  }
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                  </div>
                  {user.isAdmin && (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {likedTools?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Liked Tools</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {submissions?.tools?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Tools Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {(submissions?.news?.length || 0) + 
                       (submissions?.blogs?.length || 0) + 
                       (submissions?.videos?.length || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Content Submitted</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Liked Tools
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              My Submissions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Liked Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recent Liked Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {likedLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded shimmer"></div>
                      ))}
                    </div>
                  ) : likedTools?.length > 0 ? (
                    <div className="space-y-3">
                      {likedTools.slice(0, 3).map((tool: any) => (
                        <div key={tool.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                          {tool.logoUrl ? (
                            <img 
                              src={tool.logoUrl} 
                              alt={tool.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{tool.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{tool.shortDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No liked tools yet. Start exploring AI tools!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissionsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded shimmer"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions?.tools?.slice(0, 2).map((tool: any) => (
                        <div key={`tool-${tool.id}`} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{tool.name}</p>
                            <p className="text-sm text-muted-foreground">Tool</p>
                          </div>
                          <Badge variant={tool.isApproved ? "default" : "secondary"}>
                            {tool.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                      {submissions?.blogs?.slice(0, 1).map((blog: any) => (
                        <div key={`blog-${blog.id}`} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{blog.title}</p>
                            <p className="text-sm text-muted-foreground">Blog Post</p>
                          </div>
                          <Badge variant={blog.isApproved ? "default" : "secondary"}>
                            {blog.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                      {(!submissions?.tools?.length && !submissions?.blogs?.length && !submissions?.news?.length && !submissions?.videos?.length) && (
                        <p className="text-muted-foreground text-center py-8">
                          No submissions yet. Share something with the community!
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Liked Tools Tab */}
          <TabsContent value="likes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Liked Tools ({likedTools?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {likedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-64 bg-muted rounded-lg shimmer"></div>
                    ))}
                  </div>
                ) : likedTools?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likedTools.map((tool: any) => (
                      <ToolCard key={tool.id} tool={{ ...tool, isLiked: true }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">
                      No liked tools yet
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Explore AI tools and like the ones you find useful!
                    </p>
                    <Button onClick={() => window.location.href = "/"}>
                      Browse Tools
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <div className="space-y-6">
              {/* Tools */}
              {submissions?.tools && submissions.tools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Tools ({submissions.tools.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {submissions.tools.map((tool: any) => (
                        <div key={tool.id} className="relative">
                          <ToolCard tool={tool} />
                          <Badge 
                            className="absolute top-2 right-2"
                            variant={tool.isApproved ? "default" : "secondary"}
                          >
                            {tool.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* News */}
              {submissions?.news && submissions.news.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted News ({submissions.news.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {submissions.news.map((article: any) => (
                        <div key={article.id} className="relative">
                          <NewsCard article={article} />
                          <Badge 
                            className="absolute top-2 right-2"
                            variant={article.isApproved ? "default" : "secondary"}
                          >
                            {article.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blogs */}
              {submissions?.blogs && submissions.blogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Blogs ({submissions.blogs.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {submissions.blogs.map((blog: any) => (
                        <div key={blog.id} className="relative">
                          <BlogCard blog={blog} />
                          <Badge 
                            className="absolute top-2 right-2"
                            variant={blog.isApproved ? "default" : "secondary"}
                          >
                            {blog.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Videos */}
              {submissions?.videos && submissions.videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Videos ({submissions.videos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {submissions.videos.map((video: any) => (
                        <div key={video.id} className="relative">
                          <VideoCard video={video} />
                          <Badge 
                            className="absolute top-2 right-2"
                            variant={video.isApproved ? "default" : "secondary"}
                          >
                            {video.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {(!submissions?.tools?.length && 
                !submissions?.news?.length && 
                !submissions?.blogs?.length && 
                !submissions?.videos?.length) && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">
                      No submissions yet
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Share AI tools, news, blogs, or videos with the community!
                    </p>
                    <Button onClick={() => window.location.href = "/submit"}>
                      Submit Content
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
