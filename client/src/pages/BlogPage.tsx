import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, MessageCircle, Twitter, Linkedin, Facebook, Copy } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function BlogPage() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 12;

  // If slug is provided, show single blog post
  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: [`/api/blogs/${slug}`],
    enabled: !!slug,
  });

  // Otherwise show blog list
  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["/api/blogs", `limit=${blogsPerPage}&offset=${(currentPage - 1) * blogsPerPage}`],
    enabled: !slug,
  });

  const totalPages = Math.ceil((blogs?.total || 0) / blogsPerPage);

  // Single blog post view
  if (slug) {
    if (blogLoading) {
      return (
        <Layout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    if (!blog) {
      return (
        <Layout>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          {/* Blog header */}
          <div className="max-w-4xl mx-auto">
            {blog.imageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img 
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <span>{blog.author}</span>
                <span className="mx-2">•</span>
                <span>{format(new Date(blog.publishDate || blog.createdAt), 'MMMM dd, yyyy')}</span>
                {blog.readTime && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{blog.readTime} min read</span>
                  </>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="text-xl text-muted-foreground mb-6">
                  {blog.excerpt}
                </p>
              )}

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Blog content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Social sharing */}
            <SocialShare 
              url={window.location.href}
              title={blog.title}
              description={blog.excerpt}
            />

            {/* Comments section */}
            <CommentsSection blogId={blog.id} />
          </div>
        </div>
      </Layout>
    );
  }

  // Blog list view
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Blog
          </h1>
          <p className="text-muted-foreground text-lg">
            Tutorials, insights, and guides about artificial intelligence tools and technologies.
          </p>
        </div>



        {/* Blog Grid */}
        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {Array.from({ length: blogsPerPage }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg shimmer"></div>
            ))}
          </div>
        ) : blogs?.items?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {blogs.items.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * blogsPerPage + 1} to {Math.min(currentPage * blogsPerPage, blogs.total)} of {blogs.total} posts
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No blog posts found.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Social Share Component
function SocialShare({ url, title, description }: { url: string; title: string; description?: string }) {
  const { toast } = useToast();

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-t pt-8 mb-12">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Share2 className="mr-2 h-5 w-5" />
        Share this post
      </h3>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.twitter, '_blank')}
          className="flex items-center"
        >
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.linkedin, '_blank')}
          className="flex items-center"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(shareLinks.facebook, '_blank')}
          className="flex items-center"
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex items-center"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </Button>
      </div>
    </div>
  );
}

// Comments Section Component
function CommentsSection({ blogId }: { blogId: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments } = useQuery({
    queryKey: [`/api/blogs/${blogId}/comments`],
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blogs/${blogId}/comments`] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <MessageCircle className="mr-2 h-5 w-5" />
        Comments ({comments?.length || 0})
      </h3>

      {/* Add comment form */}
      {user ? (
        <div className="mb-8 p-4 border rounded-lg">
          <div className="flex items-center mb-3">
            <img
              src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=random`}
              alt="Your avatar"
              className="w-8 h-8 rounded-full mr-3"
            />
            <span className="font-medium">{user.firstName} {user.lastName}</span>
          </div>
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 border rounded-lg text-center bg-muted/50">
          <p className="text-muted-foreground mb-3">Please log in with Google to post comments</p>
          <Button asChild>
            <a href="/api/login">Login with Google</a>
          </Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <img
                  src={comment.user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.firstName + ' ' + comment.user?.lastName)}&background=random`}
                  alt={`${comment.user?.firstName} ${comment.user?.lastName}`}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <span className="font-medium">{comment.user?.firstName} {comment.user?.lastName}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <p className="text-foreground">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
