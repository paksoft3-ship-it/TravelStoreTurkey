import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  linkText: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  href,
  linkText,
}: ServiceCardProps) {
  return (
    <div className="group bg-white dark:bg-[#1a180e] rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/20">
      <div
        className={cn(
          'size-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors',
          '[&>svg]:text-primary [&>svg]:group-hover:text-slate-900 [&>svg]:transition-colors [&>svg]:size-7'
        )}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-bold text-primary hover:text-yellow-600 transition-colors"
      >
        {linkText}
        <ArrowRight className="size-4 ml-1" />
      </Link>
    </div>
  );
}
