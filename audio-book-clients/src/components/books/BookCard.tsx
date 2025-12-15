import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BookCardProps {
  id: number;
  title: string;
  image: string;
  rating?: number;
  category?: string;
  author?: string;
}

export function BookCard({ id, title, image, rating = 0, category, author }: BookCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.round(rating)
            ? 'fill-gold text-gold'
            : 'fill-muted text-muted'
        }`}
      />
    ));
  };

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Button
            asChild
            size="sm"
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Link to={`/book/${id}`}>
              <Play className="mr-2 h-4 w-4" />
              Nghe Ngay
            </Link>
          </Button>
        </div>
      </div>
      <CardContent className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-muted-foreground truncate">Tác giả: {author}</p>
        )}
        {category && (
          <p className="text-xs text-muted-foreground truncate">
            Thể loại: <span className="text-primary">{category}</span>
          </p>
        )}
        <div className="flex items-center gap-0.5">
          {renderStars(rating)}
          <span className="ml-1 text-xs text-muted-foreground">
            {rating ? rating.toFixed(1) : '0.0'}/5
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
