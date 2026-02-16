import { GlobalStatusBar } from "@/components/dashboard/new/GlobalStatusBar";
import { FleetCommandPanel } from "@/components/dashboard/new/FleetCommandPanel";
import { AssetIntelligencePanel } from "@/components/dashboard/new/AssetIntelligencePanel";
import { InsightsPanel } from "@/components/dashboard/new/InsightsPanel";
import { AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { FloatingDashboardActions } from "@/components/dashboard/new/FloatingDashboardActions";
// import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { DashboardNavbar, Device } from "@/components/dashboard/new/DashboardNavbar";
import { BubbleNav } from "@/components/navigation/BubbleNav";
import { MachineThinking } from "@/components/ui/machine-thinking";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";
import { renderCanvas, cleanupCanvas } from "@/components/ui/hero-designali";
import { useDashboard } from "@/context/DashboardContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { devices, lastAddedDeviceId } = useDashboard();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);

  useEffect(() => {
    // Auto-select the most recently added device (from "Add to Dashboard")
    if (lastAddedDeviceId) {
      const newDevice = devices.find(d => d.id === lastAddedDeviceId);
      if (newDevice) {
        setSelectedDevice(newDevice);
        return;
      }
    }
    // Otherwise sync to first device if none selected
    if (!selectedDevice && devices.length > 0) {
      setSelectedDevice(devices[0]);
    }
  }, [devices, lastAddedDeviceId]);

  useEffect(() => {
    // Simulate AI System Initialization
    const timer = setTimeout(() => setIsLoading(false), 3500);
    renderCanvas();
    return () => {
      cleanupCanvas();
      clearTimeout(timer);
    };
  }, []);

  const handleDeviceChange = (device: Device) => {
    setIsLoading(true);
    // Simulate AI thinking and context switching
    setTimeout(() => {
      setSelectedDevice(device);
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-200 dark:from-black dark:via-black dark:to-[#2e1065] text-foreground selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden relative font-tinos">
      <MachineThinking isThinking={isLoading} />
      {/* Background Ambience - Canvas */}
      {/* Background Ambience - Canvas */}
      <canvas
        className="fixed inset-0 z-0 pointer-events-none w-full h-full opacity-80 dark:mix-blend-screen transition-opacity duration-500"
        id="canvas"
      ></canvas>

      {/* Main Website Navigation */}
      <BubbleNav />

      <div className="relative z-10 flex flex-col min-h-screen pt-20">
        {/* Dashboard Sub-Navbar */}
        <DashboardNavbar selectedDevice={selectedDevice} devices={devices} onDeviceChange={handleDeviceChange} />

        {/* PREVIEW NOTICE FOR TURBINE */}
        <AnimatePresence>
          {selectedDevice?.id === 'dev-01' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md"
            >
              <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-amber-500 uppercase tracking-widest">Preview Mode Active</p>
                    <p className="text-xs text-muted-foreground font-medium italic">
                      This dashboard uses demonstration data. For real-time intelligence, register a live system.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/systems')}
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/50 hover:bg-amber-500 hover:text-black text-amber-500 font-black text-[10px] tracking-[0.2em] rounded-full h-8 px-5 gap-2 transition-all duration-500"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  ADD LIVE ASSET
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Main Content */}
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Top KPI Bar */}
          <div className="w-full">
            <GlobalStatusBar deviceId={selectedDevice?.id} />
          </div>

          {/* Main Workspace (3-Column Grid) */}
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT: Fleet Command */}
            <div className="col-span-12 lg:col-span-3 xl:col-span-2 min-h-[500px] flex flex-col">
              <FleetCommandPanel deviceId={selectedDevice?.id} />
            </div>

            {/* CENTER: Asset Intelligence */}
            <div className="col-span-12 lg:col-span-6 xl:col-span-7 min-h-[500px] flex flex-col">
              <AssetIntelligencePanel deviceId={selectedDevice?.id} />
            </div>

            {/* RIGHT: Insights */}
            <div className="col-span-12 lg:col-span-3 xl:col-span-3 min-h-[500px] flex flex-col">
              <InsightsPanel deviceId={selectedDevice?.id} />
            </div>


          </div>
        </div>
      </div>

      <FloatingDashboardActions />
    </div>
  );
}

