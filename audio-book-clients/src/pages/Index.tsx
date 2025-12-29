import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookCard } from '@/components/books/BookCard';
import { CategoryCard } from '@/components/books/CategoryCard';
import { Button } from '@/components/ui/button';
import { booksApi, categoriesApi, FeaturedBook, Category } from '@/lib/api';
import { Headphones, BookOpen, Star, Play, ArrowRight, Loader2 } from 'lucide-react';

const Index = () => {
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksData, categoriesData] = await Promise.all([
        booksApi.getFeatured().catch(() => []),
        categoriesApi.getAll().catch(() => []),
      ]);
      setFeaturedBooks(booksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-in text-4xl font-bold text-secondary-foreground sm:text-5xl lg:text-6xl">
              Chào Mừng Đến{' '}
              <span className="text-gradient">Audiobook</span>
            </h1>
            <p className="mt-6 animate-fade-in text-lg text-secondary-foreground/80 [animation-delay:0.2s]">
              Khám phá thế giới câu chuyện và kiến thức qua âm thanh. Nghe hàng nghìn audiobook bất cứ lúc nào, ở bất kỳ đâu trên mọi thiết bị.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row [animation-delay:0.4s]">
              <Button
                size="lg"
                asChild
                className="w-full bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 sm:w-auto"
              >
                <Link to="/books">
                  <Headphones className="mr-2 h-5 w-5" />
                  Khám Phá Ngay
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Books Section */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                AudioBook Nổi Bật
              </h2>
              <p className="mt-3 text-muted-foreground">
                Khám phá những audiobook phổ biến nhất của chúng tôi
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden text-primary hover:text-primary/80 md:flex">
              <Link to="/books">
                Xem Tất Cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BookCard
                    id={book.id}
                    title={book.title}
                    image={book.image}
                    rating={book.rating}
                    category={book.category}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/books">
                Xem Tất Cả Sách
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
              Duyệt Theo Thể loại
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tìm audiobook yêu thích tiếp theo của bạn bằng cách khám phá các Thể loại
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CategoryCard id={category.id} name={category.name} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
              Tại Sao Chọn Audiobook?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Trải nghiệm giải trí âm thanh tốt nhất
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Thư Viện Rộng Lớn',
                description: 'Truy cập hàng nghìn audiobook trên mọi Thể loại.',
              },
              {
                icon: Play,
                title: 'Chất Lượng Cao',
                description: 'Chất lượng âm thanh trong trẻ với giọng đọc chuyên nghiệp.',
              },
              {
                icon: Star,
                title: 'Cá Nhân Hóa',
                description: 'Nhận gợi ý dựa trên sở thích nghe của bạn.',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group animate-slide-up rounded-2xl border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary">
                  <feature.icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
            Bắt Đầu Hành Trình Âm Thanh Ngay Hôm Nay
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Tham gia cùng hàng triệu người nghe và khám phá tại sao audiobook là người bạn đồng hành hoàn hảo cho cuộc sống bận rộn của bạn.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link to="/register">
                Tạo Tài Khoản Miễn Phí
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/books">
                Duyệt Thư Viện
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
