import { useState, useEffect } from "react";
import { Platform } from "../types/platform";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "authenticatedPlatform";

export const usePlatformState = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const [authenticatedPlatform, setAuthenticatedPlatform] = useState<Platform>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored as Platform;
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = searchParams.get("auth_status");
    const platform = searchParams.get("platform") as Platform;

    if (authStatus && platform) {
      if (authStatus === "success") {
        setAuthenticatedPlatform(platform);
        setSelectedPlatform(null);
        localStorage.setItem(STORAGE_KEY, platform);
        toast({
          title: "Success",
          description: `Successfully connected to ${platform}!`,
        });
      } else if (authStatus === "error") {
        const errorMessage = searchParams.get("error_message");
        console.error("Authentication failed:", errorMessage);
        localStorage.removeItem(STORAGE_KEY);
        setAuthenticatedPlatform(null);
        toast({
          title: "Error",
          description: errorMessage || "Failed to authenticate",
          variant: "destructive",
        });
      }
      navigate("/profile/integrations", { replace: true });
    }
  }, [searchParams, navigate, toast]);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsAuthenticating(true);
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setIsAuthenticating(true);
      localStorage.removeItem(STORAGE_KEY);
      setAuthenticatedPlatform(null);
      setSelectedPlatform(null);
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${platform}`,
      });
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      toast({
        title: "Error",
        description: `Failed to disconnect from ${platform}`,
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    selectedPlatform,
    authenticatedPlatform,
    isAuthenticating,
    isSyncing,
    setIsSyncing,
    handleConnect,
    handleDisconnect,
  };
};