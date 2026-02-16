import { Play, FileText, Plus, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function FloatingDashboardActions() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportReport = async () => {
        setIsExporting(true);
        toast.loading("Rendering high-fidelity intelligence report...", { id: "export-toast" });

        try {
            // Target the dashboard container (usually the parent of what's rendered)
            const element = document.querySelector(".flex-1.px-6.py-6") as HTMLElement;
            if (!element) throw new Error("Dashboard viewport not found");

            // Ensure we are capturing in dark mode if requested, or just capture current
            // html2canvas is pretty good at capturing computed styles
            const canvas = await html2canvas(element, {
                backgroundColor: "#000000",
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedEl = clonedDoc.querySelector(".flex-1.px-6.py-6") as HTMLElement;
                    if (clonedEl) {
                        clonedEl.style.padding = "40px";
                        clonedEl.style.backgroundColor = "#020105";
                        clonedEl.classList.add("dark");
                    }
                }
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Forsee-Intelligence-Report-${Date.now()}.pdf`);

            toast.success("Intelligence Report Generated", {
                id: "export-toast",
                description: "Deep-analysis report successfully downloaded in dark-mode fidelity."
            });
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export System Error", {
                id: "export-toast",
                description: "The AI rendering node encountered a buffer error."
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleAddAssetFlow = () => {
        navigate("/output-preview");
        setTimeout(() => {
            toast.info("Add Asset Procedure", {
                description: "Click on 'Add to Dashboard' to finalize this asset integration.",
                duration: 6000
            });
        }, 500);
    };

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            <TooltipProvider delayDuration={0}>




                {/* ENGINEER & ADMIN: Asset Management */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleAddAssetFlow}
                            size="icon"
                            className="h-14 w-14 rounded-full bg-[#9d4edd] shadow-[0_0_20px_rgba(157,78,221,0.4)] hover:bg-[#8b3dc7] transition-all text-white group"
                        >
                            <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-black border-white/20 text-white font-bold tracking-tighter">REGISTER NEW ASSET</TooltipContent>
                </Tooltip>

                {/* ALL ROLES: Export Insights */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleExportReport}
                            disabled={isExporting}
                            size="icon"
                            className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-foreground hover:text-background transition-all shadow-lg text-foreground/80 group"
                        >
                            {isExporting ? <Loader2 className="w-6 h-6 animate-spin text-purple-400" /> : <FileText className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-black border-white/20 text-white font-bold tracking-tighter">EXPORT INTELLIGENCE REPORT</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
