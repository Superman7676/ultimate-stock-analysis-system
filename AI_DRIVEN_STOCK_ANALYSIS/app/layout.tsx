export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}
