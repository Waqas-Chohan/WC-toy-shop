"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Bell, Shield, Palette, Link2, Database, Mail, Smartphone, Globe, Key, RefreshCw, Check, ExternalLink, Zap, Lock
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const integrations = [
  { id: "salesforce", name: "Salesforce", description: "Sync contacts and opportunities", connected: false, lastSync: null },
  { id: "hubspot", name: "HubSpot", description: "Marketing automation and CRM", connected: false, lastSync: null },
  { id: "slack", name: "Slack", description: "Team notifications and alerts", connected: true, lastSync: "Real-time" },
  { id: "gmail", name: "Gmail", description: "Email tracking and sync", connected: true, lastSync: "10 mins ago" },
];

const notificationSettings = [
  { id: "deal_updates", label: "Deal Updates", description: "Get notified when deals change status", email: true, push: true },
  { id: "team_activity", label: "Team Activity", description: "Updates on team performance and milestones", email: true, push: false },
  { id: "pipeline_alerts", label: "Pipeline Alerts", description: "Alerts for pipeline changes and risks", email: true, push: true },
];

export function SettingsSection() {
  const { user, syncSession } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState(notificationSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      await syncSession();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const toggleNotification = (id: string, type: "email" | "push") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n))
    );
    toast.success("Notification setting updated!");
  };

  const initials = fullName ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "A";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your administrator profile, security, and interface configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary border border-border p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Link2 className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <form onSubmit={handleProfileSave}>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Personal Information</CardTitle>
                <CardDescription>Update your personal details and system profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 bg-secondary ring-2 ring-cyan-500/30">
                    <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-2xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-white">{fullName}</h4>
                    <p className="text-xs text-muted-foreground capitalize">Role: {user?.role || "Admin"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-secondary border-border focus:border-cyan-500 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="email">Email Address (Read-only)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-secondary/40 border-border text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive admin updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-sm text-muted-foreground">
                  <span>Notification Type</span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="text-center flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Push
                  </span>
                </div>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-foreground">{notification.label}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={() => toggleNotification(notification.id, "email")}
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={notification.push}
                        onCheckedChange={() => toggleNotification(notification.id, "push")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Connected Services</CardTitle>
              <CardDescription>Configure automation connectors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border transition-all duration-300 bg-secondary/50 border-border hover:border-cyan-500/30`}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/10">
                          <Zap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Badge className={integration.connected ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-muted text-muted-foreground"}>
                        {integration.connected ? "Connected" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {integration.connected ? (
                        <>
                          <span className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</span>
                          <Button variant="ghost" size="sm" className="h-8">Disconnect</Button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground">Not configured</span>
                          <Button size="sm" className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white">Connect</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <form onSubmit={handlePasswordUpdate}>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Update password</CardTitle>
                <CardDescription>Manage security credentials for login</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-secondary border-border focus:border-cyan-500 max-w-md text-white"
                    placeholder="Enter at least 6 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-secondary border-border focus:border-cyan-500 max-w-md text-white"
                    placeholder="Re-enter to confirm"
                    required
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Save Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
