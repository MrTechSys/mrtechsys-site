import React from 'react';
import { Palette } from 'lucide-react';
import TenantBrandingManager from '../components/branding/TenantBrandingManager';

export default function BrandingSettings() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Palette className="w-8 h-8 text-amber-400" />
          Branding & <span className="text-amber-400">Personalization</span>
        </h1>
        <p className="text-white/60">
          Customize your brand identity, colors, and theme to match your business
        </p>
      </div>

      <TenantBrandingManager />
    </div>
  );
}