export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gray-50 min-h-screen">
      {children}
    </section>
  );
} 