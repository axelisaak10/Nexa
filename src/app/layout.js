import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscountPopup from "@/components/DiscountPopup";

export const metadata = {
  title: "Nexa — Objetos que ganan su lugar",
  description: "Descubre mobiliario, cerámica, textiles e iluminación de diseño. Piezas seleccionadas por la honestidad de sus materiales y trabajo artesanal. Nexa — objetos curados para la vida moderna.",
  keywords: "Nexa, muebles, cerámica, textiles, iluminación, decoración, diseño, artesanal, premium",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
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
