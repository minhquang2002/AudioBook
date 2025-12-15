import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { booksApi, reviewsApi, BookDetail as BookDetailType, Review } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Star,
  Play,
  Loader2,
  Clock,
  User,
  Calendar,
  Trash2,
  BookOpen,
  Headphones,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [book, setBook] = useState<BookDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadBook(Number(id));
      loadReviews(Number(id), 0);
    }
  }, [id]);

  const loadBook = async (bookId: number) => {
    setIsLoading(true);
    try {
      const data = await booksApi.getById(bookId);
      setBook(data);
    } catch (error) {
      console.error('Failed to load book:', error);
      // Mock data for demo
      // setBook({
      //   id: bookId,
      //   title: 'The Great Gatsby',
      //   author: 'F. Scott Fitzgerald',
      //   image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      //   description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.',
      //   category: 'Fiction',
      //   chapters: [
      //     { id: 1, title_chapter: 'Chapter 1: The Beginning', text: 'Content...', audioes: [{ id: 1, audio_name: 'Chapter 1', audio_file: '/audio1.mp3' }] },
      //     { id: 2, title_chapter: 'Chapter 2: The Party', text: 'Content...', audioes: [{ id: 2, audio_name: 'Chapter 2', audio_file: '/audio2.mp3' }] },
      //     { id: 3, title_chapter: 'Chapter 3: The Meeting', text: 'Content...', audioes: [{ id: 3, audio_name: 'Chapter 3', audio_file: '/audio3.mp3' }] },
      //   ],
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async (bookId: number, page: number) => {
    setIsLoadingReviews(true);
    try {
      const data = await reviewsApi.getByBook(bookId, page, 5);
      
      // Check if response is paginated or plain array
      if (Array.isArray(data)) {
        // Old API response (plain array)
        setReviews(data);
        setReviewsTotal(data.length);
        setReviewsTotalPages(1);
        setReviewsPage(0);
      } else {
        // New API response (paginated)
        setReviews(data.content);
        setReviewsTotal(data.totalElements);
        setReviewsTotalPages(data.totalPages);
        setReviewsPage(page);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
      setReviewsTotal(0);
      setReviewsTotalPages(0);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !book) return;

    setIsSubmitting(true);
    try {
      await reviewsApi.add({
        bookId: book.id,
        username: user.username,
        rating: reviewRating,
        review: reviewComment,
      });
      toast({
        title: 'Thành công',
        description: 'Đánh giá của bạn đã được gửi!',
      });
      setReviewComment('');
      setReviewRating(5);
      if (book) loadReviews(book.id, 0);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewsApi.delete(reviewId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa đánh giá.',
      });
      if (book) loadReviews(book.id, reviewsPage);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa đánh giá.',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onSelect?.(i + 1)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                i < rating
                  ? 'fill-gold text-gold'
                  : 'fill-muted text-muted hover:fill-gold/50 hover:text-gold/50'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="text-2xl font-bold">Không tìm thấy sách</h2>
          <p className="mt-2 text-muted-foreground">
            Sách bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild className="mt-6">
            <Link to="/books">Quay lại danh sách sách</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Book Info Section */}
          <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
            {/* Book Cover */}
            <div className="animate-fade-in">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={book.image || '/placeholder.svg'}
                  alt={book.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="animate-slide-up space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {book.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
                  {book.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Tác giả: {book.author}
                </p>
                {book.published && (
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày phát hành: {new Date(book.published).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {book.rating && (
                  <>
                    {renderStars(book.rating)}
                    <span className="text-lg font-medium">{book.rating.toFixed(1)}</span>
                  </>
                )}
                <span className="text-muted-foreground">
                  {reviewsTotal} đánh giá
                </span>
              </div>

              <p className="text-lg leading-relaxed text-muted-foreground">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link to={`/listen/${book.id}`}>
                    <Headphones className="mr-2 h-5 w-5" />
                    Nghe Ngay
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Chapters Section */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Chương ({book.chapters?.length || 0})
            </h2>
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {book.chapters?.map((chapter, index) => (
                    <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
                      <AccordionTrigger className="px-6 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{chapter.title_chapter}</p>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Headphones className="h-3 w-3" />
                              {chapter.audioes?.length || 0} file audio
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                          <span className="text-muted-foreground">
                            Nhấp để nghe chương này
                          </span>
                          <Button size="sm" asChild>
                            <Link to={`/listen/${book.id}?chapter=${chapter.id}`}>
                              <Play className="mr-2 h-4 w-4" />
                              Nghe
                            </Link>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Reviews Section */}
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Đánh Giá ({reviewsTotal})
            </h2>

            {/* Add Review Form */}
            {isAuthenticated ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Viết đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Đánh giá của bạn
                      </label>
                      {renderStars(reviewRating, true, setReviewRating)}
                    </div>
                    <Textarea
                      placeholder="Viết nhận xét của bạn..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      rows={4}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi đánh giá'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">
                    <Link to="/login" className="text-primary hover:underline">
                      Đăng nhập
                    </Link>{' '}
                    để viết đánh giá
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-3 p-4">
                    {isLoadingReviews ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !reviews || reviews.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                      </div>
                    ) : (
                      <>
                        {reviews.map((review) => (
                          <div key={review.id} className="animate-fade-in border-b last:border-0 pb-3 last:pb-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm">{review.user?.username || 'Anonymous'}</p>
                                    {review.date && (
                                      <span className="text-xs text-muted-foreground">
                                        • {review.date}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-0.5">
                                      {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3.5 w-3.5 ${
                                            i < review.rating
                                              ? 'fill-gold text-gold'
                                              : 'fill-muted text-muted'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{review.review}</p>
                                </div>
                              </div>
                              {(isAdmin || user?.username === review.user?.username) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteReview(review.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Pagination Controls */}
                        {reviewsTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => book && loadReviews(book.id, reviewsPage - 1)}
                              disabled={isLoadingReviews || reviewsPage === 0}
                            >
                              ← Trước
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Trang {reviewsPage + 1} / {reviewsTotalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => book && loadReviews(book.id, reviewsPage + 1)}
                              disabled={isLoadingReviews || reviewsPage >= reviewsTotalPages - 1}
                            >
                              Sau →
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookDetail;
