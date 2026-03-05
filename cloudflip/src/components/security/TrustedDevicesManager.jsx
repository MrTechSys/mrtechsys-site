import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Smartphone, Trash2, Plus, Monitor, Tablet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const deviceIcons = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet
};

export default function TrustedDevicesManager({ trustedDevices = [], onAddDevice, onRemoveDevice }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("desktop");

  const handleAddDevice = () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    const now = new Date();
    const trustedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const deviceId = `device-${Date.now()}`;
    const newDevice = {
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType,
      trusted_at: now.toISOString(),
      last_used_at: now.toISOString(),
      trusted_until: trustedUntil.toISOString(),
      confirmed: false, // Will need email/SMS confirmation
      ip_address: 'pending',
      user_agent: navigator.userAgent
    };

    onAddDevice(newDevice);
    setShowAddDialog(false);
    setDeviceName("");
    toast.info("Device added - confirmation required via email");
  };

  return (
    <>
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              Trusted Devices
            </CardTitle>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-white hover:bg-amber-500/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trustedDevices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">No trusted devices yet</p>
              <p className="text-white/40 text-xs mt-1">
                Add devices you use frequently to skip MFA on those devices
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {trustedDevices.map((device, idx) => {
                  const Icon = deviceIcons[device.device_type] || Monitor;
                  return (
                    <motion.div
                      key={device.device_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-white/5 rounded-lg border border-amber-500/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{device.device_name}</p>
                          <div className="space-y-0.5">
                            <p className="text-white/50 text-xs">
                              Added {device.trusted_at && format(new Date(device.trusted_at), 'MMM d, yyyy')}
                            </p>
                            {device.trusted_until && (
                              <p className="text-white/50 text-xs">
                                Expires {format(new Date(device.trusted_until), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!device.confirmed && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            Pending
                          </Badge>
                        )}
                        {device.last_used_at && (
                          <Badge variant="outline" className="text-white/60 text-xs">
                            Last used {format(new Date(device.last_used_at), 'MMM d')}
                          </Badge>
                        )}
                        <Button
                          onClick={() => onRemoveDevice(device.device_id)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Device Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#0a1929] border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Add Trusted Device
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Device Name</label>
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="My iPhone, Work Laptop, etc."
                className="bg-white/5 border-amber-500/30 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Device Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['desktop', 'mobile', 'tablet'].map(type => {
                  const Icon = deviceIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setDeviceType(type)}
                      className={`p-3 rounded-lg border transition-all ${
                        deviceType === type
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${
                        deviceType === type ? 'text-blue-400' : 'text-white/60'
                      }`} />
                      <p className={`text-xs capitalize ${
                        deviceType === type ? 'text-blue-400' : 'text-white/60'
                      }`}>
                        {type}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                ⚠️ MFA will be skipped on this device. Only add devices you personally control.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-amber-500/30 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDevice}
              className="bg-gradient-to-r from-blue-600 to-blue-500"
            >
              Add Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}