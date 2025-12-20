import "./globals.css";
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-background text-black`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
