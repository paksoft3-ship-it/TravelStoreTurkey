import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingContactButtons } from '@/components/FloatingContactButtons';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContactButtons />
    </div>
  );
}
