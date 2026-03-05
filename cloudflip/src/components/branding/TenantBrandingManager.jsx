import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Upload,
  Image,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function TenantBrandingManager() {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [previewMode, setPreviewMode] = useState(false);

  const { data: organization } = useQuery({
    queryKey: ['currentOrg'],
    queryFn: async () => {
      const user = await api.auth.me();
      if (user.current_org_id) {
        const orgs = await api.entities.Organization.filter({ id: user.current_org_id });
        return orgs[0];
      }
      return null;
    }
  });

  useEffect(() => {
    if (organization?.settings) {
      setBrandName(organization.settings.brand_name || '');
      setTagline(organization.settings.tagline || '');
      setPrimaryColor(organization.settings.primary_color || '#3b82f6');
      setSecondaryColor(organization.settings.secondary_color || '#8b5cf6');
      setAccentColor(organization.settings.accent_color || '#f59e0b');
      setLogoPreview(organization.settings.logo_url);
    }
  }, [organization]);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      return file_url;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      await api.entities.Organization.update(user.current_org_id, {
        settings: {
          ...organization.settings,
          ...data
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentOrg']);
      toast.success('Branding updated successfully!');
      window.location.reload(); // Reload to apply theme changes
    },
    onError: () => {
      toast.error('Failed to update branding');
    }
  });

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updates = {
      brand_name: brandName,
      tagline: tagline,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor
    };

    if (logoFile) {
      try {
        const logoUrl = await uploadMutation.mutateAsync(logoFile);
        updates.logo_url = logoUrl;
      } catch (error) {
        toast.error('Failed to upload logo');
        return;
      }
    }

    saveMutation.mutate(updates);
  };

  const handleReset = () => {
    if (organization?.settings) {
      setBrandName(organization.settings.brand_name || '');
      setTagline(organization.settings.tagline || '');
      setPrimaryColor('#3b82f6');
      setSecondaryColor('#8b5cf6');
      setAccentColor('#f59e0b');
      setLogoFile(null);
      setLogoPreview(organization.settings.logo_url);
      toast.info('Reset to saved values');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Tenant Branding & Theme Manager
          </CardTitle>
          <p className="text-white/60 text-sm">
            Customize your brand identity and application theme
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Identity */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Brand Identity</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Brand Name</Label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your Company Name"
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Tagline</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Your Company Tagline"
                  className="bg-white/5 border-amber-500/30 text-white"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <Label className="text-white mb-2 block">Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-24 h-24 bg-white/10 rounded-lg border border-amber-500/30 p-2 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload').click()}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-white/40 text-xs mt-2">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Theme */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Color Theme</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded border-2 border-amber-500/30 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-white/5 border-amber-500/30 text-white flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Secondary Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded border-2 border-amber-500/30 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="bg-white/5 border-amber-500/30 text-white flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Accent Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded border-2 border-amber-500/30 cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="bg-white/5 border-amber-500/30 text-white flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 bg-white/5 border border-amber-500/20 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Live Preview</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button style={{ backgroundColor: primaryColor }} className="text-white">
                Primary Button
              </Button>
              <Button style={{ backgroundColor: secondaryColor }} className="text-white">
                Secondary Button
              </Button>
              <Button style={{ backgroundColor: accentColor }} className="text-white">
                Accent Button
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-green-500"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save & Apply
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}