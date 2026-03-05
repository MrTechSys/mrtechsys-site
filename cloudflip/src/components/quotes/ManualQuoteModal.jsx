
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
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

export default function ManualQuoteModal({ open, onClose, clients = [] }) {
  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState(addDays(new Date(), 30));
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    {
      name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 0.08
    }
  ]);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      
      const subtotal = data.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );
      const tax = data.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price * (item.tax_rate || 0)), 0
      );
      
      return api.entities.Quote.create({
        org_id: user.current_org_id,
        client_id: data.client_id,
        items: data.items,
        subtotal,
        tax,
        total: subtotal + tax,
        status: 'draft',
        valid_until: data.valid_until,
        notes: data.notes,
        number: `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Quote created successfully!");
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to create quote: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    const validItems = lineItems.filter(item => item.name && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one line item with a name and quantity");
      return;
    }

    saveMutation.mutate({ 
      client_id: clientId, 
      items: validItems,
      valid_until: format(validUntil, 'yyyy-MM-dd'),
      notes
    });
  };

  const handleClose = () => {
    setClientId("");
    setValidUntil(addDays(new Date(), 30));
    setNotes("");
    setLineItems([{
      name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 0.08
    }]);
    onClose();
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 0.08
    }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) {
      toast.error("You must have at least one line item");
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const safeClients = Array.isArray(clients) ? clients : [];

  const subtotal = lineItems.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.unit_price || 0)), 0
  );
  const tax = lineItems.reduce((sum, item) => 
    sum + ((item.quantity || 0) * (item.unit_price || 0) * (item.tax_rate || 0)), 0
  );
  const total = subtotal + tax;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a1929] border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            Create Manual <span className="text-amber-400">Quote</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client" className="text-white">Select Client *</Label>
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
              <Label className="text-white">Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white/5 border-amber-500/30 text-white hover:bg-white/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(validUntil, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={setValidUntil}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-white text-lg">Line Items *</Label>
              <Button
                onClick={addLineItem}
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {lineItems.map((item, index) => (
                <div key={index} className="p-4 border border-amber-500/20 rounded-lg bg-white/5 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 grid md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm">Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                          placeholder="e.g., HVAC Installation"
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Additional details..."
                          className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          className="bg-white/5 border-amber-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Unit Price ($)</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="bg-white/5 border-amber-500/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Tax Rate (%)</Label>
                        <Input
                          type="number"
                          value={(item.tax_rate * 100).toFixed(2)}
                          onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value) / 100 || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="bg-white/5 border-amber-500/30 text-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="text-sm text-amber-400 font-semibold">
                          Line Total: ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-6"
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or terms..."
              rows={3}
              className="bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
            />
          </div>

          <div className="border-t border-amber-500/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-white/80">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>Tax:</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white border-t border-amber-500/20 pt-2">
              <span>Total:</span>
              <span className="text-amber-400">${total.toFixed(2)}</span>
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
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-[#0a1929] font-bold"
          >
            {saveMutation.isPending ? 'Creating...' : 'Create Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
