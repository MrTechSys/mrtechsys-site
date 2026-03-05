import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, setHours, setMinutes } from "date-fns";
import { toast } from "sonner";

export default function BookingFormModal({ open, onClose, clients = [], selectedDate }) {
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState(selectedDate || new Date());
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [duration, setDuration] = useState(60);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      
      const startTime = setMinutes(setHours(date, parseInt(startHour)), parseInt(startMinute));
      const endTime = new Date(startTime.getTime() + duration * 60000);

      return api.entities.Appointment.create({
        org_id: user.current_org_id,
        client_id: data.clientId,
        title: data.title,
        description: data.description,
        service_type: data.serviceType,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: duration,
        status: 'pending',
        booking_source: 'admin'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment created!");
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create appointment: ${error.message}`);
    }
  });

  const handleSubmit = () => {
    if (!clientId || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({ clientId, title, description, serviceType });
  };

  const handleClose = () => {
    setClientId("");
    setTitle("");
    setDescription("");
    setServiceType("");
    onClose();
  };

  const safeClients = Array.isArray(clients) ? clients : [];
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-[#0a1929] border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Create Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-white">Select Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {safeClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Appointment Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., HVAC Maintenance"
              className="bg-white/5 border-amber-500/30 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Service Type</Label>
            <Input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="e.g., Plumbing, Electrical"
              className="bg-white/5 border-amber-500/30 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="bg-white/5 border-amber-500/30 text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md border border-amber-500/20 bg-white/5"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-white">Start Time</Label>
                <div className="flex gap-2">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Duration (minutes)</Label>
                <Select value={String(duration)} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger className="bg-white/5 border-amber-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-amber-500/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}