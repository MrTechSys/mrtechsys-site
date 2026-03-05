import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionLink
}) {
  return (
    <Card className="bg-white/5 border-amber-500/20">
      <CardContent className="p-12 text-center">
        {Icon && <Icon className="w-16 h-16 text-white/20 mx-auto mb-4" />}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {description && <p className="text-white/60 mb-6">{description}</p>}
        {(actionLabel && (onAction || actionLink)) && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-amber-600 to-amber-500"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}