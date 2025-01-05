import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const GeneralSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: "Error",
          description: "No email found for this account",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/profile/settings`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset email sent. Please check your inbox.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset password email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Your email address is used for account notifications and password resets
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Password</h3>
            <Button
              onClick={handleResetPassword}
              disabled={isLoading}
              variant="outline"
            >
              Reset Password
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              You will receive an email with instructions to reset your password
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
        <div className="space-y-4">
          <div>
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              variant="destructive"
            >
              Sign Out
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              Sign out of your account on this device
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GeneralSettings;