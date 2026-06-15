export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="container min-h-[calc(100vh-20rem)]">{children}</main>;
}
