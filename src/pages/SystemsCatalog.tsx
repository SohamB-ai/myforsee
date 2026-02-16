import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { systemCards as defaultSystemCards } from "@/components/home/SystemsSection";
import { ArrowRight, Plus, Loader2, CheckCircle2, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addRequest } from "@/lib/systemRequests";

export default function SystemsCatalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localSystemCards, setLocalSystemCards] = useState<CardStackItem[]>(defaultSystemCards);
  const [activeItem, setActiveItem] = useState<CardStackItem>(defaultSystemCards[0]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isRequestOpen) {
      // Logic for request dialog focus/open if needed
    }
  }, [isRequestOpen]);

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://formspree.io/f/mgolvpll", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Also save to local store so admin dashboard can see it
        addRequest({
          systemName: formData.get('systemName') as string || 'Unknown System',
          details: formData.get('details') as string || '',
          submittedBy: user?.name || user?.email || 'Engineer',
        });
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setIsRequestOpen(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to make request", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin handlers removed in favor of unified request flow

  // Select 7 diverse images for the parallax effect
  const parallaxImages = localSystemCards.slice(0, 7).map(card => ({
    src: card.imageSrc,
    alt: card.title
  }));

  return (
    <div className="min-h-screen w-full relative">
      {/* Dynamic background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-slate-50 to-purple-100/40 dark:from-black dark:via-[#0c051a] dark:to-black pointer-events-none transition-all duration-700" />

      <ZoomParallax images={parallaxImages} />
      <div className="min-h-screen w-full relative z-10 flex flex-col items-center justify-center py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Operational Systems
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Swipe or click cards to explore available systems.
          </p>
        </div>
        <div className="max-w-4xl w-full px-6">
          <CardStack
            items={localSystemCards}
            cardWidth={window.innerWidth < 640 ? 300 : 400}
            cardHeight={window.innerWidth < 640 ? 250 : 300}
            activeScale={1.1}
            overlap={0.5}
            autoAdvance={true}
            intervalMs={1500}
            onChangeIndex={(_, item) => setActiveItem(item)}
          />
        </div>

        <div className="mt-20 flex flex-col items-center gap-8">
          <button
            onClick={() => activeItem.href && navigate(activeItem.href)}
            className="group relative flex items-center gap-2 px-8 py-4 bg-[#8B4BFF] hover:bg-[#9D66FF] text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(139,75,255,0.3)] hover:shadow-[0_0_30px_rgba(139,75,255,0.5)] active:scale-95"
          >
            <span>Predict in {activeItem.title}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>

          <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-10 py-7 text-lg font-bold text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 gap-3 transition-all rounded-full shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" /> Request New System
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Request System Integration</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-zinc-400">
                  Submit a request for a new industrial system implementation. Our engineering team will review your specs.
                </DialogDescription>
              </DialogHeader>

              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Sent!</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">We've received your system proposal.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="systemName" className="text-slate-900 dark:text-white">System Name</Label>
                    <Input
                      id="systemName"
                      name="systemName"
                      placeholder="e.g. Hydraulic Press V4"
                      className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="details" className="text-slate-900 dark:text-white">Technical Specifications & Details</Label>
                    <Textarea
                      id="details"
                      name="details"
                      placeholder="Describe the system architecture, sensors, and required prediction models..."
                      className="min-h-[120px] bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 focus:border-purple-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Request...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Quick Access Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-12 max-w-4xl px-10">
            {localSystemCards.map((card) => (
              <button
                key={card.id}
                onClick={() => card.href && navigate(card.href)}
                className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground hover:text-[#8B4BFF] transition-all relative group"
              >
                {card.title}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#8B4BFF] group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
