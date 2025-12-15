import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface CategoryCardProps {
  id: number;
  name: string;
}

export function CategoryCard({ id, name }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${id}`}
      className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary">
        <BookOpen className="h-7 w-7 text-primary transition-colors group-hover:text-primary-foreground" />
      </div>
      <span className="text-center font-medium text-foreground transition-colors group-hover:text-primary">
        {name}
      </span>
    </Link>
  );
}
