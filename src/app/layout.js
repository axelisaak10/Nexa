import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscountPopup from "@/components/DiscountPopup";
import PwaRegister from "@/components/PwaRegister";

export const metadata = {
  title: "Nexa — Objetos que ganan su lugar",
  description: "Descubre mobiliario, cerámica, textiles e iluminación de diseño. Piezas seleccionadas por la honestidad de sus materiales y trabajo artesanal. Nexa — objetos curados para la vida moderna.",
  keywords: "Nexa, muebles, cerámica, textiles, iluminación, decoración, diseño, artesanal, premium",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C85A2A" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <PwaRegister />
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flexGrow: 1, paddingTop: '60px' }}>
                  {children}
                </main>
                <Footer />
                <DiscountPopup />
              </div>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
