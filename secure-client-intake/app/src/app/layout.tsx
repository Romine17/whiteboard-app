export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, Arial, sans-serif", margin: 0, background: "#f7f7f9" }}>
        {children}
      </body>
    </html>
  );
}
