import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { DemoRequestDialog } from "@/components/landing/DemoRequestDialog";

export default function Landing() {
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onRequestDemo={() => setIsDemoDialogOpen(true)} />
      <Features />
      <Pricing onRequestDemo={() => setIsDemoDialogOpen(true)} />
      <Contact />
      <Footer />
      <DemoRequestDialog
        open={isDemoDialogOpen}
        onOpenChange={setIsDemoDialogOpen}
      />
    </div>
  );
}
