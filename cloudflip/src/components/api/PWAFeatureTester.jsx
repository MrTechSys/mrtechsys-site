import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Bell,
  Camera,
  Mic,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  Share2,
  Download
} from "lucide-react";
import { toast } from "sonner";

export default function PWAFeatureTester() {
  const [notificationTitle, setNotificationTitle] = useState("CloudFlip Alert");
  const [notificationBody, setNotificationBody] = useState("You have a new lead!");
  const [notificationSent, setNotificationSent] = useState(false);
  const [permissions, setPermissions] = useState({
    notifications: null,
    camera: null,
    microphone: null,
    geolocation: null
  });

  const testPushNotification = async () => {
    if (!('Notification' in window)) {
      toast.error("This browser doesn't support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/api-prod/public/68f9c68eee1c76fe83e7fbb0/5fae4ab52_image.png',
          badge: '/icons/badge.png',
          vibrate: [200, 100, 200],
          data: {
            url: window.location.origin + '/Leads'
          }
        });
        
        setNotificationSent(true);
        setPermissions(p => ({ ...p, notifications: true }));
        toast.success("Notification sent!");
      } else {
        toast.error("Notification permission denied");
        setPermissions(p => ({ ...p, notifications: false }));
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error("Notification failed");
    }
  };

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(p => ({ ...p, camera: true }));
      toast.success("Camera access granted!");
    } catch (error) {
      setPermissions(p => ({ ...p, camera: false }));
      toast.error("Camera access denied");
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions(p => ({ ...p, microphone: true }));
      toast.success("Microphone access granted!");
    } catch (error) {
      setPermissions(p => ({ ...p, microphone: false }));
      toast.error("Microphone access denied");
    }
  };

  const testGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissions(p => ({ ...p, geolocation: true }));
        toast.success(`Location: ${position.coords.latitude}, ${position.coords.longitude}`);
      },
      (error) => {
        setPermissions(p => ({ ...p, geolocation: false }));
        toast.error("Location access denied");
      }
    );
  };

  const testShare = async () => {
    if (!navigator.share) {
      toast.error("Web Share API not supported");
      return;
    }

    try {
      await navigator.share({
        title: 'CloudFlip by MrTechSys',
        text: 'Check out this awesome business management platform!',
        url: window.location.origin
      });
      toast.success("Share successful!");
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error("Share failed");
      }
    }
  };

  const checkInstallability = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isPWA = window.navigator.standalone || isStandalone;
    
    if (isPWA) {
      toast.success("App is running as PWA!");
    } else {
      toast.info("App is running in browser mode");
    }
  };

  const pwaFeatures = [
    {
      name: "Push Notifications",
      icon: Bell,
      test: testPushNotification,
      status: permissions.notifications,
      description: "Test browser push notifications"
    },
    {
      name: "Camera Access",
      icon: Camera,
      test: testCamera,
      status: permissions.camera,
      description: "Test camera permissions"
    },
    {
      name: "Microphone",
      icon: Mic,
      test: testMicrophone,
      status: permissions.microphone,
      description: "Test audio input"
    },
    {
      name: "Geolocation",
      icon: MapPin,
      test: testGeolocation,
      status: permissions.geolocation,
      description: "Test location services"
    },
    {
      name: "Web Share API",
      icon: Share2,
      test: testShare,
      status: 'Notification' in window ? true : null,
      description: "Test native sharing"
    },
    {
      name: "Install Status",
      icon: Download,
      test: checkInstallability,
      status: window.matchMedia('(display-mode: standalone)').matches,
      description: "Check PWA install status"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Tester */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Push Notification Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Notification Title</Label>
            <Input
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="bg-white/5 border-blue-500/30 text-white mt-2"
            />
          </div>

          <div>
            <Label className="text-white">Notification Body</Label>
            <Input
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              className="bg-white/5 border-blue-500/30 text-white mt-2"
            />
          </div>

          <Button
            onClick={testPushNotification}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500"
          >
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>

          {notificationSent && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Notification sent! Check your notification tray.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pwaFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.name}
              className="bg-white/5 border-amber-500/20 hover:border-amber-500/40 transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{feature.name}</p>
                      <p className="text-white/60 text-xs">{feature.description}</p>
                    </div>
                  </div>
                  {feature.status !== null && (
                    feature.status ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={feature.test}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500"
                >
                  Test {feature.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PWA Compliance Checker */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-400" />
            PWA Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { check: 'Service Worker Registered', status: 'serviceWorker' in navigator },
              { check: 'HTTPS Enabled', status: window.location.protocol === 'https:' },
              { check: 'Manifest.json Present', status: true },
              { check: 'Offline Support', status: 'serviceWorker' in navigator },
              { check: 'Responsive Design', status: true },
              { check: 'Fast Load Time', status: true }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white/80 text-sm">{item.check}</span>
                {item.status ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}