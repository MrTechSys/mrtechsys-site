import React from 'react';

export default function CopyrightFooter() {
  return (
    <div className="mt-16 pt-8 border-t border-amber-500/20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/4f2a625b6_MrTechSys-Naked-Logo.png"
            alt="MrTechSys"
            className="w-8 h-8 object-contain"
          />
          <div className="text-sm text-white/60">
            Copyright 2025 MrTechSys. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}