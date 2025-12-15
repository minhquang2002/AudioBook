import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { booksApi, Book } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Search } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchBooks(query);
    }
  }, [query]);

  const searchBooks = async (keyword: string) => {
    setIsLoading(true);
    try {
      const data = await booksApi.search(keyword, 0, 0);
      setBooks(data);
    } catch (error) {
      console.error('Failed to search books:', error);
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              Kết Quả Tìm Kiếm
            </h1>
          </div>
          {!isLoading && (
            <>
              <p className="text-lg text-muted-foreground mb-2">
                Tìm kiếm cho: <span className="font-semibold text-foreground">"{query}"</span>
              </p>
              <p className="text-muted-foreground">
                {books.length} {books.length === 1 ? 'kết quả' : 'kết quả'}
              </p>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-xl text-muted-foreground mb-4">
              Không tìm thấy sách nào khớp với từ khóa "{query}"
            </p>
            <p className="text-muted-foreground mb-6">
              Thử tìm kiếm với từ khóa khác hoặc duyệt tất cả sách
            </p>
            <Link to="/books">
              <Button>Xem Tất Cả Sách</Button>
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResults;
