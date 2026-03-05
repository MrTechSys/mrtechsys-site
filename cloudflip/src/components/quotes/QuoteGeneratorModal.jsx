import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function QuoteGeneratorModal({ open, onOpenChange }) {
  const [prompt, setPrompt] = useState("");
  const [clientId, setClientId] = useState("");
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const user = await api.auth.me();
      
      try {
        const result = await api.integrations.Core.InvokeLLM({
          prompt: `Generate a professional quote for the following request:
          
Client: ${data.clientName}
Description: ${data.description}

Please create a detailed quote with line items, quantities, and pricing. Format as JSON with this structure:
{
  "items": [
    {
      "name": "Item name",
      "description": "Item description", 
      "quantity": 1,
      "unit_price": 100,
      "tax_rate": 0.08
    }
  ],
  "notes": "Any additional notes"
}

Be specific and professional. Include realistic pricing for the described work.`,
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    quantity: { type: "number" },
                    unit_price: { type: "number" },
                    tax_rate: { type: "number" }
                  }
                }
              },
              notes: { type: "string" }
            }
          }
        });

        const safeItems = result?.items || [];
        const subtotal = safeItems.reduce((sum, item) => 
          sum + ((item?.quantity || 0) * (item?.unit_price || 0)), 0
        );
        const tax = safeItems.reduce((sum, item) => 
          sum + ((item?.quantity || 0) * (item?.unit_price || 0) * (item?.tax_rate || 0)), 0
        );

        return api.entities.Quote.create({
          org_id: user.current_org_id,
          client_id: data.clientId,
          items: safeItems,
          subtotal,
          tax,
          total: subtotal + tax,
          status: 'draft',
          notes: result?.notes || '',
          number: `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        });
      } catch (error) {
        console.error("AI quote generation failed:", error);
        const basicItem = {
          name: "Service",
          description: data.description,
          quantity: 1,
          unit_price: 0,
          tax_rate: 0.08
        };
        
        return api.entities.Quote.create({
          org_id: user.current_org_id,
          client_id: data.clientId,
          items: [basicItem],
          subtotal: 0,
          tax: 0,
          total: 0,
          status: 'draft',
          notes: "Failed to generate detailed items using AI. Please update pricing and details.",
          number: `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("Quote generated and saved successfully!");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create quote:", error);
      toast.error("Failed to generate quote. Please try manual quote creation.");
    }
  });

  const handleGenerate = () => {
    if (!prompt || !clientId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const selectedClient = clients.find(c => c.id === clientId);
    if (!selectedClient) {
      toast.error("Selected client not found. Please select a valid client.");
      return;
    }
    generateMutation.mutate({ clientId: clientId, clientName: selectedClient.name, description: prompt });
  };

  const handleClose = () => {
    setPrompt("");
    setClientId("");
    onOpenChange(false);
  };

  const safeClients = clients || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1929] border-amber-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Quote Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="client" className="text-white">Select Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="bg-white/5 border-amber-500/30 text-white mt-2">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1929] border-amber-500/20 text-white">
                {safeClients.map(client => (
                  <SelectItem key={client?.id} value={client?.id}>
                    {client?.name || 'Unknown Client'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt" className="text-white">Describe the Work *</Label>
            <Textarea
              id="prompt"
              placeholder="Example: Install a new 50-gallon water heater, including removal of old unit, installation of new unit with all connections, and disposal of old equipment. Customer wants same-day service."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="mt-2 bg-white/5 border-amber-500/30 text-white placeholder:text-white/40"
            />
            <p className="text-sm text-white/60 mt-2">
              Be specific about materials, labor, urgency, and any special requirements.
            </p>
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
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt || !clientId}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating & Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate & Save Quote
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}