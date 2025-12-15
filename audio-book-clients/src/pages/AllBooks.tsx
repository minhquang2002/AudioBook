import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { booksApi, categoriesApi, Book, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Loader2, BookOpen } from 'lucide-react';

const AllBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('0');
  const [selectedRating, setSelectedRating] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [allBooksCache, setAllBooksCache] = useState<Book[]>([]);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBooks = async (categoryId: number = 0, rating: number = 0, page: number = 0) => {
    setIsLoading(true);
    try {
      // If rating filter is applied, use non-paginated API and handle pagination on frontend
      if (rating > 0) {
        const data = await booksApi.getAll(categoryId, rating);
        if (Array.isArray(data)) {
          setAllBooksCache(data);
          const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
          setTotalPages(totalPages);
          
          // Paginate on frontend
          const startIndex = page * ITEMS_PER_PAGE;
          const endIndex = startIndex + ITEMS_PER_PAGE;
          setBooks(data.slice(startIndex, endIndex));
        }
      } else {
        // Use paginated API when no rating filter
        const data = await booksApi.getAll(categoryId, rating, page);
        if ('content' in data) {
          setBooks(data.content);
          setTotalPages(data.totalPages);
          setAllBooksCache([]);
        } else {
          setBooks(data);
          setAllBooksCache([]);
        }
      }
    } catch (error) {
      console.error('Failed to load books:', error);
      // Mock data for demo
      // setBooks([
      //   { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', description: '', rating: 4.5 },
      //   { id: 2, title: 'Atomic Habits', author: 'James Clear', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', description: '', rating: 4.8 },
      //   { id: 3, title: 'The Psychology of Money', author: 'Morgan Housel', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', description: '', rating: 4.7} },
      //   { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400', description: '', rating: 4.6 },
      //   { id: 5, title: 'Deep Work', author: 'Cal Newport', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', description: '', rating: 4.5 },
      //   { id: 6, title: '1984', author: 'George Orwell', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', description: '', rating: 4.7 },
      // ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(0);
    loadBooks(Number(selectedCategory), Number(selectedRating), 0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    // If we have cached data (rating filter), paginate on frontend
    if (allBooksCache.length > 0) {
      const startIndex = newPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      setBooks(allBooksCache.slice(startIndex, endIndex));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Otherwise, fetch from backend
      loadBooks(Number(selectedCategory), Number(selectedRating), newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const ratingOptions = [
    { value: '0', label: 'Tất cả' },
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao trở lên' },
    { value: '3', label: '3 sao trở lên' },
    { value: '2', label: '2 sao trở lên' },
    { value: '1', label: '1 sao trở lên' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              Tất Cả Sách
            </h1>
            <p className="mt-2 text-muted-foreground">
              Khám phá thư viện audiobook đa dạng của chúng tôi
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full shrink-0 lg:w-64">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Bộ Lọc
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Thể loại</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Thể loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tất cả</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Đánh giá</Label>
                    <Select
                      value={selectedRating}
                      onValueChange={setSelectedRating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đánh giá" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleApplyFilter}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Áp Dụng
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Books Grid */}
            <main className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Không tìm thấy sách
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Thử thay đổi bộ lọc để tìm sách phù hợp
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {books.map((book, index) => (
                      <div
                        key={book.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <BookCard
                          id={book.id}
                          title={book.title}
                          image={book.image}
                          rating={book.rating || 0}
                          category={book.category}
                          author={book.author}
                        />
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AllBooks;
