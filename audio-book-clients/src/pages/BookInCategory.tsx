import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { booksApi, categoriesApi, Book, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const BookInCategory = () => {
  const { id } = useParams<{ id: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (id) {
      loadCategoryAndBooks(parseInt(id), currentPage);
    }
  }, [id, currentPage]);

  const loadCategoryAndBooks = async (categoryId: number, page: number = 0) => {
    setIsLoading(true);
    try {
      const [categoriesData, booksData] = await Promise.all([
        categoriesApi.getAll(),
        booksApi.getByCategory(categoryId, 0, page)
      ]);

      const currentCategory = categoriesData.find((cat) => cat.id === categoryId);
      setCategory(currentCategory || null);
      
      if ('content' in booksData) {
        setBooks(booksData.content);
        setTotalPages(booksData.totalPages);
      } else {
        setBooks(booksData);
      }
    } catch (error) {
      console.error('Failed to load category books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về Trang Chủ
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            {isLoading ? 'Đang tải...' : category ? category.name : 'Sách Theo Thể loại'}
          </h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              {books.length} {books.length === 1 ? 'quyển sách' : 'quyển sách'}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              Không tìm thấy sách nào trong Thể loại này
            </p>
            <Link to="/books">
              <Button>Xem Tất Cả Sách</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  id={book.id}
                  title={book.title}
                  image={book.image}
                  rating={book.rating}
                  category={book.category}
                  author={book.author}
                />
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
      </div>
    </MainLayout>
  );
};

export default BookInCategory;
