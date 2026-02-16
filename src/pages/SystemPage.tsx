import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { systemDomains } from "@/components/home/SystemsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SensorInput } from "@/components/dashboard/SensorInput";
import { RiskLevel } from "@/components/dashboard/RiskBadge";
import NeuralBackground from "@/components/ui/flow-field-background";
import { MachineThinking } from "@/components/ui/machine-thinking";
import { systemsManifest } from "@/data/systems-manifest";
import { AssetIdentity } from "@/components/dashboard/AssetIdentity";
import UnifiedIntelligenceDashboard from "@/components/dashboard/UnifiedIntelligenceDashboard";
import { OperationModeInput } from "@/components/dashboard/OperationModeInput";
import { OperationStateIndicator, OpState } from "@/components/dashboard/OperationStateIndicator";
import { HumanObservationCard } from "@/components/dashboard/HumanObservationCard";
import { TemporalDynamicsCard } from "@/components/dashboard/TemporalDynamicsCard";
import { OperationalContextCard, OperationalContextValues } from "@/components/dashboard/OperationalContextCard";
import { SpectralDataCard, SpectralDataValues } from "@/components/dashboard/SpectralDataCard";
import { EventCorrelationCard, EventCorrelationValues } from "@/components/dashboard/EventCorrelationCard";

interface PredictionResult {
  rul: number;
  healthIndex: number;
  riskLevel: RiskLevel;
  precursorProb: number;
  confidence: number;
  failureMode: string;
  topSensors: { name: string; weight: number }[];
  action: string;
  driftDetected: boolean;
}

export default function SystemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Load system profile from manifest
  const systemProfile = systemsManifest[slug || ""] || systemsManifest["wind-turbines"];
  const [sensorValues, setSensorValues] = useState<Record<string, string>>({});

  // Operation Mode State
  const [operationMode, setOperationMode] = useState("continuous");
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("20:00");

  // Enhanced Context State
  const [temporalValues, setTemporalValues] = useState<Record<string, { trend: string; rateOfChange: string; avg24h: string }>>({});
  const [operationalContext, setOperationalContext] = useState<OperationalContextValues>({
    loadLevel: "", ambientTemp: "", ambientHumidity: "", environmentType: ""
  });
  const [spectralData, setSpectralData] = useState<SpectralDataValues>({
    dominantFrequency: "", frequencyType: "", vibrationSeverity: ""
  });
  const [eventCorrelation, setEventCorrelation] = useState<EventCorrelationValues>({
    lastMaintenanceDate: "", maintenanceType: "", daysSinceLastFailure: ""
  });

  const handleTemporalChange = (sensorId: string, field: string, value: string) => {
    setTemporalValues(prev => ({
      ...prev,
      [sensorId]: { ...(prev[sensorId] || { trend: "", rateOfChange: "", avg24h: "" }), [field]: value }
    }));
  };

  // Operation State (Real-time simulation)
  const [opState, setOpState] = useState<OpState>("RUNNING");
  const [opReason, setOpReason] = useState("All systems normal");
  const [opLastChange, setOpLastChange] = useState(new Date().toISOString());
  const [opHistory, setOpHistory] = useState<{ state: OpState, timestamp: string, reason: string }[]>([]);

  const changeOpState = (newState: OpState, reason: string) => {
    if (newState === opState) return;
    setOpHistory(prev => [{ state: opState, timestamp: opLastChange, reason: opReason }, ...prev]);
    setOpState(newState);
    setOpReason(reason);
    setOpLastChange(new Date().toISOString());
  };

  // Human Observation State
  const [humanObs, setHumanObs] = useState({
    type: "",
    typeOther: "",
    severity: "",
    location: "",
    duration: "",
    confidence: "",
    context: [] as string[],
    note: "",
    photo: null as File | null,
  });

  const handleObsChange = (field: string, value: any) => {
    setHumanObs(prev => ({ ...prev, [field]: value }));
  };

  // Reset state when system changes
  useEffect(() => {
    if (systemProfile) {
      const defaults: Record<string, string> = {};
      systemProfile.sensors.forEach(s => defaults[s.id] = s.defaultValue || "");
      setSensorValues(defaults);

      // Reset human observation
      setHumanObs({
        type: "",
        typeOther: "",
        severity: "",
        location: "",
        duration: "",
        confidence: "",
        context: [],
        note: "",
        photo: null,
      });
    }
  }, [slug, systemProfile]);

  if (!systemProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-muted-foreground">System profile not found.</p>
      </div>
    );
  }

  const handleRunPrediction = async () => {
    setIsLoading(true);
    // Simulate initial delay for "System Handshake"
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInfo: {
            id: slug,
            name: systemProfile.title,
          },
          inputs: sensorValues,
          temporalContext: temporalValues,
          operationalContext,
          spectralData,
          eventHistory: eventCorrelation
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();

      setIsLoading(false);
      navigate("/output-preview", {
        state: {
          result,
          inputs: sensorValues,
          systemInfo: {
            id: slug,
            name: systemProfile.title,
            operation_mode: operationMode,
            shift_start: operationMode === "shift" ? shiftStart : undefined,
            shift_end: operationMode === "shift" ? shiftEnd : undefined,
            human_observation: humanObs.type ? {
              type: humanObs.type === "other" ? humanObs.typeOther : humanObs.type,
              severity: humanObs.severity,
              location: humanObs.location,
              duration: humanObs.duration,
              confidence: humanObs.confidence,
              context: humanObs.context,
              note: humanObs.note,
              photo_url: humanObs.photo ? URL.createObjectURL(humanObs.photo) : null,
              reported_at: new Date().toISOString(),
              reported_by: "Current Operator"
            } : null
          }
        }
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      setIsLoading(false);
      alert("Failed to connect to AI Backend. Ensure the backend server is running on port 5000.");
    }
  };

  return (
    <div id={`system-page-${slug}`} className="min-h-screen relative overflow-hidden bg-background">
      <MachineThinking isThinking={isLoading} />

      {/* Light mode gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-purple-50 to-purple-100/50 dark:from-black dark:via-black dark:to-black pointer-events-none transition-all duration-500" />

      {/* Background - Purple Currents (highly vibrant in dark, adjusted for light) */}
      <div className="fixed inset-0 z-0 dark:opacity-100 opacity-40 transition-opacity duration-500">
        <NeuralBackground
          color="#9d4edd" // More vibrant purple
          speed={0.5}
          trailOpacity={0.2}
          particleCount={600}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Shifted down to avoid navbar overlap */}
        <div className="pt-32 px-6 sm:px-12 relative">
          <button
            onClick={() => navigate("/systems")}
            className="absolute left-6 sm:left-12 top-32 flex items-center justify-center w-10 h-10 rounded-full bg-card/50 border border-border text-foreground/70 hover:text-foreground hover:bg-card shadow-lg transition-all"
            aria-label="Back to Systems"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center justify-center gap-4">
            <AssetIdentity systemName={systemProfile.title} className="items-center text-center" />
          </div>
        </div>

        {/* Responsive Multi-Column Input Section */}
        <div className="flex-1 px-6 sm:px-12 pb-20 w-full max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Column 1: System Baseline */}
            <div className="space-y-6">
              <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.05] to-transparent pointer-events-none" />

                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                    System Baseline
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure {systemProfile.title.toLowerCase()} sensors
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <OperationModeInput
                    domain={slug || "general"}
                    operationMode={operationMode}
                    onModeChange={setOperationMode}
                    shiftStart={shiftStart}
                    onShiftStartChange={setShiftStart}
                    shiftEnd={shiftEnd}
                    onShiftEndChange={setShiftEnd}
                  />

                  <div className="grid gap-5">
                    {systemProfile.sensors.map((sensor) => (
                      <SensorInput
                        key={sensor.id}
                        id={sensor.id}
                        label={sensor.label}
                        unit={sensor.unit}
                        value={sensorValues[sensor.id] || ""}
                        onChange={(value) =>
                          setSensorValues((prev) => ({ ...prev, [sensor.id]: value }))
                        }
                        placeholder={sensor.placeholder}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Advanced Context */}
            <div className="space-y-4">
              <div className="px-1 mb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground/70 mb-1">Advanced Context</h3>
                <p className="text-[10px] text-muted-foreground">Supplemental metrics for high-fidelity reasoning</p>
              </div>

              <TemporalDynamicsCard
                domain={slug || "general"}
                sensors={systemProfile.sensors}
                values={temporalValues}
                onChange={handleTemporalChange}
              />

              <OperationalContextCard
                domain={slug || "general"}
                values={operationalContext}
                onChange={(field, value) => setOperationalContext(prev => ({ ...prev, [field]: value }))}
              />

              <SpectralDataCard
                domain={slug || "general"}
                values={spectralData}
                onChange={(field, value) => setSpectralData(prev => ({ ...prev, [field]: value }))}
              />

              <EventCorrelationCard
                domain={slug || "general"}
                values={eventCorrelation}
                onChange={(field, value) => setEventCorrelation(prev => ({ ...prev, [field]: value }))}
              />
            </div>

            {/* Column 3: Observation & Action */}
            <div className="space-y-6">
              <HumanObservationCard
                domain={slug || "general"}
                observation={humanObs}
                onChange={handleObsChange}
              />
            </div>

          </div>

          {/* Centered Action Button Section */}
          <div className="mt-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-full max-w-md p-1">
              <Button
                id="runPredictBtn"
                onClick={handleRunPrediction}
                disabled={isLoading}
                className="w-full bg-[#8B4BFF] hover:bg-[#7a3ee3] text-white font-bold h-16 text-xl shadow-[0_0_20px_rgba(139,75,255,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,75,255,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  "Initialize Prediction"
                )}
              </Button>
              <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                  <strong>Forsee AI</strong> will process baseline data, temporal trends, and operational context to generate a deterministic health index and RUL projection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
