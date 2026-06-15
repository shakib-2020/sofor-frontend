import NavBar from '@/components/navbar/nav-bar';
import Footer from '@/components/footer/footer';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
