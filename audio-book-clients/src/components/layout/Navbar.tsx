import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesApi, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BookOpen,
  Search,
  User,
  Menu,
  ChevronDown,
  LogOut,
  History,
  Music,
  Settings,
  Shield,
  Home,
  Grid3X3,
  Mic,
  Image,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link
        to="/"
        className={`flex items-center gap-2 transition-colors hover:text-primary ${
          mobile ? 'py-3 text-foreground' : 'text-secondary-foreground/90 hover:text-secondary-foreground'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Home className="h-4 w-4" />
        <span>Trang Chủ</span>
      </Link>

      {mobile ? (
        <div className="space-y-2">
          <p className="py-2 font-medium text-muted-foreground">Thể loại</p>
          <Link
            to="/books"
            className="block py-2 pl-4 text-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tất Cả Sách
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="block py-2 pl-4 text-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-secondary-foreground/90 transition-colors hover:text-secondary-foreground">
              <Grid3X3 className="h-4 w-4" />
              <span>Thể loại</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/books" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Tất Cả Sách
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((cat) => (
              <DropdownMenuItem key={cat.id} asChild>
                <Link to={`/category/${cat.id}`}>{cat.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Link
        to="/books"
        className={`flex items-center gap-2 transition-colors hover:text-primary ${
          mobile ? 'py-3 text-foreground' : 'text-secondary-foreground/90 hover:text-secondary-foreground'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <BookOpen className="h-4 w-4" />
        <span>Sách</span>
      </Link>

      <Link
        to="/tts"
        className={`flex items-center gap-2 transition-colors hover:text-primary ${
          mobile ? 'py-3 text-foreground' : 'text-secondary-foreground/90 hover:text-secondary-foreground'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Mic className="h-4 w-4" />
        <span>TTS</span>
      </Link>

      <Link
        to="/its"
        className={`flex items-center gap-2 transition-colors hover:text-primary ${
          mobile ? 'py-3 text-foreground' : 'text-secondary-foreground/90 hover:text-secondary-foreground'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Image className="h-4 w-4" />
        <span>ITS</span>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-gradient-nav shadow-md backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-secondary-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Audiobook</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          <NavLinks />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm kiếm sách hoặc tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 border-secondary/30 bg-secondary/20 pl-10 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:border-primary focus:bg-secondary/30"
            />
          </div>
        </form>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground md:flex"
                >
                  <Link to="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-secondary-foreground hover:bg-secondary/30"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden md:inline">{profile?.username || user?.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{profile?.fullname || profile?.username}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Hồ Sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-audio" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Âm thanh Của Tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Lịch Sử Nghe
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Quản Trị
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng Xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-secondary-foreground hover:bg-secondary/30"
              >
                <Link to="/login">Đăng Nhập</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                <Link to="/register">Đăng Ký</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-secondary-foreground lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 pt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm kiếm sách hoặc tác giả..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                <NavLinks mobile />

                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-3 text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
