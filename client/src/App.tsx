import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WifiOff } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

// Custom hook to monitor network connectivity status
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default function App() {
  const isOnline = useNetworkStatus();

  // Notify user whenever network connection drops or reconnects
  useEffect(() => {
    if (!isOnline) {
      toast.error("Network Disconnected", {
        description: "Operating in offline cached mode. Field telemetry sync paused.",
        duration: 5000,
      });
    } else {
      toast.success("Connection Restored", {
        description: "Re-established link with Assam telemetry servers.",
      });
    }
  }, [isOnline]);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="relative min-h-screen bg-[#080d1b] text-slate-200">
          {/* Sticky Offline Warning Banner */}
          {!isOnline && (
            <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-rose-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
              <WifiOff className="h-4 w-4 animate-pulse" />
              <span>OFFLINE MODE: Displaying cached telemetry data. Field sync paused.</span>
            </div>
          )}

          {/* Dark Tactical Toaster Configuration */}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#0c1327",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
              },
            }}
          />

          {/* Main Dashboard */}
          <Home />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
