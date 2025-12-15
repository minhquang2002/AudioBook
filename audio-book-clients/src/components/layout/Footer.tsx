import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Audiobook</span>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              Khám phá thế giới câu chuyện và kiến thức qua âm thanh. Nghe hàng nghìn audiobook bất cứ lúc nào, ở bất kỳ đâu.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên Kết Nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Tất Cả Sách
                </Link>
              </li>
              <li>
                <Link to="/tts" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Văn Bản Thành Giọng Nói
                </Link>
              </li>
              <li>
                <Link to="/its" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Hình Ảnh Thành Giọng Nói
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Danh Mục</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/1" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Tiểu Thuyết
                </Link>
              </li>
              <li>
                <Link to="/category/2" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Phi Tiểu Thuyết
                </Link>
              </li>
              <li>
                <Link to="/category/3" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Khoa Học
                </Link>
              </li>
              <li>
                <Link to="/category/4" className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary">
                  Lịch Sử
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                <Mail className="h-4 w-4 text-primary" />
                contact@audiobook.com
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                <Phone className="h-4 w-4 text-primary" />
                +84 123 456 789
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                <MapPin className="h-4 w-4 text-primary" />
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-secondary-foreground/10 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} Audiobook. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}
