
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Plus,
  Check,
  X,
  Send,
  Bell
} from "lucide-react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import BookingFormModal from "../components/booking/BookingFormModal";
import { toast } from "sonner";

export default function SmartBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => api.entities.Appointment.list('-start_time', 200),
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment updated!");
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (appointment) => {
      const client = clients.find(c => c.id === appointment.client_id);
      if (!client?.email) {
        throw new Error("Client email not found");
      }

      await api.integrations.Core.SendEmail({
        to: client.email,
        subject: `Reminder: ${appointment.title}`,
        body: `Hi ${client.name},\n\nThis is a reminder for your upcoming appointment:\n\n${appointment.title}\nDate: ${format(parseISO(appointment.start_time), 'PPP')}\nTime: ${format(parseISO(appointment.start_time), 'p')}\n\nSee you soon!`
      });

      return api.entities.Appointment.update(appointment.id, {
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Reminder sent!");
    },
    onError: (error) => {
      toast.error(`Failed to send reminder: ${error.message}`);
    }
  });

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const selectedDateAppointments = safeAppointments.filter(apt => 
    isSameDay(parseISO(apt.start_time), selectedDate)
  ).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  const statusColors = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    no_show: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  const upcomingCount = safeAppointments.filter(apt => 
    new Date(apt.start_time) > new Date() && apt.status !== 'cancelled'
  ).length;

  const todayCount = safeAppointments.filter(apt => 
    isSameDay(parseISO(apt.start_time), new Date()) && apt.status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#0d1f3c] to-[#0a1929] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Smart Booking</h1>
            <p className="text-white/60">Manage appointments with calendar sync & auto-reminders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-400 text-sm font-medium">Today: {todayCount}</p>
            </div>
            <div className="px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-sm font-medium">Upcoming: {upcomingCount}</p>
            </div>
            <Button
              onClick={() => setShowBookingForm(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border border-amber-500/20"
                modifiers={{
                  booked: safeAppointments
                    .filter(apt => apt.status !== 'cancelled')
                    .map(apt => parseISO(apt.start_time))
                }}
                modifiersStyles={{
                  booked: { 
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    color: 'rgb(251, 191, 36)',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No appointments scheduled for this day</p>
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    variant="outline"
                    className="mt-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    Add Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments.map((apt) => {
                    const client = clients.find(c => c.id === apt.client_id);
                    
                    return (
                      <div
                        key={apt.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{apt.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(parseISO(apt.start_time), 'p')} - {format(parseISO(apt.end_time), 'p')}
                              </span>
                              {client && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {client.name}
                                </span>
                              )}
                              {apt.location?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {apt.location.city}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={statusColors[apt.status]}>
                            {apt.status}
                          </Badge>
                        </div>

                        {apt.client_preferences && (
                          <div className="mb-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                            <p className="text-blue-400 text-xs">💡 {apt.client_preferences}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {apt.status === 'pending' && (
                            <Button
                              onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'confirmed' } })}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {apt.status === 'confirmed' && (
                            <Button
                              onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'in_progress' } })}
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                              Start
                            </Button>
                          )}
                          {apt.status === 'in_progress' && (
                            <Button
                              onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'completed' } })}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Complete
                            </Button>
                          )}
                          {!apt.reminder_sent && new Date(apt.start_time) > new Date() && (
                            <Button
                              onClick={() => sendReminderMutation.mutate(apt)}
                              disabled={sendReminderMutation.isPending}
                              size="sm"
                              variant="outline"
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send Reminder
                            </Button>
                          )}
                          {apt.reminder_sent && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              Reminded
                            </Badge>
                          )}
                          <Button
                            onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'cancelled' } })}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeAppointments
                .filter(apt => new Date(apt.start_time) > new Date() && apt.status !== 'cancelled')
                .slice(0, 6)
                .map(apt => {
                  const client = clients.find(c => c.id === apt.client_id);
                  
                  return (
                    <div
                      key={apt.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedDate(parseISO(apt.start_time))}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={statusColors[apt.status]}>
                          {apt.status}
                        </Badge>
                        <span className="text-white/50 text-xs">
                          {format(parseISO(apt.start_time), 'MMM d')}
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-2">{apt.title}</h4>
                      <div className="space-y-1 text-sm text-white/60">
                        <p className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(apt.start_time), 'p')}
                        </p>
                        {client && (
                          <p className="flex items-center gap-2">
                            <User className="w-3 h-3" />
                            {client.name}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <BookingFormModal
        open={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        clients={clients}
        selectedDate={selectedDate}
      />
    </div>
  );
}
