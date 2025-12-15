import { useEffect, useState } from "react";
import { booksApi, Book, BookDetail, reviewsApi, Review } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Star, BookOpen, TrendingUp, Eye, Trash2, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface BookWithRating extends Book {
  averageRating?: number;
  totalReviews?: number;
  reviewCount?: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(142 76% 36%)", "hsl(47 96% 53%)", "hsl(0 84% 60%)"];

const ReviewStatistics = () => {
  const [books, setBooks] = useState<BookWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BookDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await booksApi.getAll();
        setBooks(data);
      } catch (error) {
        console.error("Failed to load books:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const totalBooks = books.length;
  const booksWithRating = books.filter((b) => b.rating && b.rating > 0);
  const averageOverallRating = booksWithRating.length > 0
    ? (booksWithRating.reduce((sum, b) => sum + (b.rating || 0), 0) / booksWithRating.length).toFixed(1)
    : "0";

  const ratingDistribution = [
    { name: "5 sao", value: books.filter((b) => b.rating && b.rating >= 4.5).length },
    { name: "4 sao", value: books.filter((b) => b.rating && b.rating >= 3.5 && b.rating < 4.5).length },
    { name: "3 sao", value: books.filter((b) => b.rating && b.rating >= 2.5 && b.rating < 3.5).length },
    { name: "2 sao", value: books.filter((b) => b.rating && b.rating >= 1.5 && b.rating < 2.5).length },
    { name: "1 sao", value: books.filter((b) => b.rating && b.rating > 0 && b.rating < 1.5).length },
  ];

  const topRatedBooks = [...books]
    .filter((b) => b.rating && b.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10)
    .map((book) => ({
      name: book.title.length > 20 ? book.title.substring(0, 20) + "..." : book.title,
      rating: book.rating || 0,
    }));

  const handleViewReviews = async (bookId: number) => {
    try {
      const bookDetail = await booksApi.getById(bookId);
      setSelectedBook(bookDetail);
      setCurrentPage(0);
      await loadReviews(bookId, 0);
      setReviewsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá",
        variant: "destructive",
      });
    }
  };

  const loadReviews = async (bookId: number, page: number) => {
    setLoadingReviews(true);
    try {
      const response = await reviewsApi.getByBook(bookId, page, 5);
      if ('content' in response) {
        setReviews(response.content);
        setTotalPages(response.totalPages);
      } else {
        setReviews(response);
        setTotalPages(1);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (selectedBook) {
      setCurrentPage(newPage);
      loadReviews(selectedBook.id, newPage);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    setDeletingReviewId(reviewId);
    try {
      await reviewsApi.delete(reviewId);
      toast({
        title: "Thành công",
        description: "Đã xóa đánh giá",
      });
      // Reload current page of reviews
      if (selectedBook) {
        await loadReviews(selectedBook.id, currentPage);
        // Reload books list
        const data = await booksApi.getAll();
        setBooks(data);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa đánh giá",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Chi tiết
          </TabsTrigger>
        </TabsList>

        {/* Tab danh sách sách */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">STT</TableHead>
                      <TableHead>Tên sách</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Thể loại</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Lượt đánh giá</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Không có sách nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      books.map((book, index) => (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{book.category}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {book.rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-medium">{book.rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              {book.reviewCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReviews(book.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem đánh giá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab thống kê */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng số sách</p>
                  <p className="text-2xl font-bold">{totalBooks}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating trung bình</p>
                  <p className="text-2xl font-bold">{averageOverallRating}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sách được đánh giá</p>
                  <p className="text-2xl font-bold">{booksWithRating.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chưa đánh giá</p>
                  <p className="text-2xl font-bold">{totalBooks - booksWithRating.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 sách được đánh giá cao nhất</CardTitle>
              </CardHeader>
              <CardContent>
                {topRatedBooks.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topRatedBooks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Chưa có dữ liệu đánh giá
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân bố đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                {ratingDistribution.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ratingDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ratingDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Chưa có dữ liệu đánh giá
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog xem chi tiết đánh giá */}
      <Dialog open={reviewsDialogOpen} onOpenChange={setReviewsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đánh giá của sách: {selectedBook?.title}</DialogTitle>
            <DialogDescription>
              Quản lý các đánh giá từ người dùng
            </DialogDescription>
          </DialogHeader>
          
          {loadingReviews ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.user.username}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.review}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Chưa có đánh giá nào cho sách này
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewStatistics;
