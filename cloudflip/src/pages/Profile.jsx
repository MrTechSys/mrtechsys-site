import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building,
  Upload,
  Save,
  Crown,
  Image as ImageIcon,
  Palette,
  Mail,
  Phone,
  Globe,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  
  // Personal Settings
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  // Organization Settings
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [replyEmail, setReplyEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setFullName(currentUser.full_name || "");
      setEmail(currentUser.email || "");

      if (currentUser.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: currentUser.current_org_id });
        if (orgs.length > 0) {
          const org = orgs[0];
          setOrganization(org);
          
          const settings = org.settings || {};
          setBrandName(settings.brand_name || "");
          setTagline(settings.tagline || "");
          setPrimaryColor(settings.primary_color || "#3b82f6");
          setSecondaryColor(settings.secondary_color || "#8b5cf6");
          setReplyEmail(settings.reply_email || "");
          setPhoneNumber(settings.sms_from || "");
          setLogoUrl(settings.logo_url || "");
        }

        const subs = await api.entities.BillingSubscription.filter({ 
          org_id: currentUser.current_org_id 
        });
        if (subs.length > 0) {
          setSubscription(subs[0]);
        }
      }
    };

    loadData();
  }, []);

  const updatePersonalMutation = useMutation({
    mutationFn: async (data) => {
      return api.auth.updateMe(data);
    },
    onSuccess: () => {
      toast.success("Personal settings saved!");
      queryClient.invalidateQueries();
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (data) => {
      return api.entities.Organization.update(organization.id, data);
    },
    onSuccess: () => {
      toast.success("Organization settings saved! Refreshing...");
      setTimeout(() => window.location.reload(), 1000);
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!subscription || subscription.plan === 'free') {
      toast.error("Logo upload is available for Starter+ tiers only");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
      toast.success("Logo uploaded!");
    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePersonal = () => {
    updatePersonalMutation.mutate({ full_name: fullName });
  };

  const handleSaveOrganization = () => {
    if (!organization) return;

    updateOrgMutation.mutate({
      settings: {
        ...organization.settings,
        brand_name: brandName,
        tagline: tagline,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        reply_email: replyEmail,
        sms_from: phoneNumber,
        logo_url: logoUrl
      }
    });
  };

  const plan = subscription?.plan || 'free';
  const canUploadLogo = ['starter', 'pro', 'partner'].includes(plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-amber-400" />
            Profile & Settings
          </h1>
          <p className="text-white/60">Manage your personal and organization settings</p>
        </div>

        {subscription && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="text-white font-medium capitalize">Current Plan: {plan}</p>
                    <p className="text-white/60 text-sm">
                      {canUploadLogo ? "Custom branding enabled" : "Upgrade to Starter+ for custom branding"}
                    </p>
                  </div>
                </div>
                {!canUploadLogo && (
                  <Button
                    onClick={() => window.location.href = '/Billing'}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    value={email}
                    disabled
                    className="bg-white/5 border-white/20 text-white/50 cursor-not-allowed"
                  />
                  <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
                </div>

                <Button
                  onClick={handleSavePersonal}
                  disabled={updatePersonalMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Personal Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-400" />
                  Organization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Business Name</Label>
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your Business Name"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Tagline</Label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your catchy tagline"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Reply Email</Label>
                  <Input
                    type="email"
                    value={replyEmail}
                    onChange={(e) => setReplyEmail(e.target.value)}
                    placeholder="replies@yourbusiness.com"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                <Button
                  onClick={handleSaveOrganization}
                  disabled={updateOrgMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-bold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Organization Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="bg-[#0a1929]/60 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  Brand Customization
                  {canUploadLogo && (
                    <Badge className="bg-amber-500/20 text-amber-400 ml-2">
                      Starter+
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label className="text-white mb-3 block">Business Logo</Label>
                  <div className="flex items-start gap-6">
                    {logoUrl && (
                      <div className="w-32 h-32 rounded-lg border-2 border-amber-500/30 bg-white/5 p-2 flex items-center justify-center">
                        <img 
                          src={logoUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={!canUploadLogo || uploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          asChild
                          disabled={!canUploadLogo || uploading}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold cursor-pointer"
                        >
                          <span>
                            {uploading ? (
                              <>Uploading...</>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      {!canUploadLogo && (
                        <p className="text-amber-400 text-sm mt-2">
                          ⭐ Upgrade to Starter+ to upload a custom logo
                        </p>
                      )}
                      <p className="text-white/50 text-xs mt-2">
                        Recommended: Square image, PNG format, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                {canUploadLogo && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Primary Color</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-white/20"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="bg-white/5 border-white/20 text-white h-12"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Secondary Color</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-white/20"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <Input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="bg-white/5 border-white/20 text-white h-12"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="bg-white/5 border-white/20 text-white"
                          placeholder="#8b5cf6"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!canUploadLogo && (
                  <div className="p-6 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg border border-amber-500/30 text-center">
                    <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-white font-bold text-lg mb-2">Unlock Custom Branding</h3>
                    <p className="text-white/70 mb-4">
                      Upload your logo and customize brand colors with Starter, Pro, or Partner plans
                    </p>
                    <Button
                      onClick={() => window.location.href = '/Billing'}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                )}

                {canUploadLogo && (
                  <Button
                    onClick={handleSaveOrganization}
                    disabled={updateOrgMutation.isPending}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Branding Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Card */}
        {canUploadLogo && (
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Brand Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                  )}
                  <div>
                    <h3 className="text-white text-xl font-bold">{brandName || "Your Business Name"}</h3>
                    <p className="text-white/60">{tagline || "Your tagline here"}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div 
                    className="flex-1 p-4 rounded-lg text-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <p className="font-bold" style={{ color: '#fff' }}>Primary</p>
                  </div>
                  <div 
                    className="flex-1 p-4 rounded-lg text-center"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    <p className="font-bold" style={{ color: '#fff' }}>Secondary</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}