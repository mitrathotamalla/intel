import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Building2, GraduationCap, Calendar, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "",
    year: "",
    college: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        department: profile.department || "",
        year: profile.year || "",
        college: profile.college || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        department: form.department,
        year: form.year,
        college: form.college,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-8 space-y-6"
        >
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
              {(form.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{form.name || "User"}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Department
                </Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                  <SelectContent>
                    {["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI/ML"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Year
                </Label>
                <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> College
              </Label>
              <Input
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="Your college name"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-primary border-0 text-primary-foreground gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
