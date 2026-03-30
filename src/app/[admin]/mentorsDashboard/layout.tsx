export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {children}
    </main>
  )
}