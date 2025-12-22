import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#F8FAFC]`}>
      <div className="mx-auto max-w-7xl px-8 py-8">
        {/* Minimal brand header */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-[#0F172A]">TrueDemand</h1>
        </div>

        {children}
      </div>
    </div>
  );
}
