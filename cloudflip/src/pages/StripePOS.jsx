import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Receipt,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StripePOS() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: async () => {
      const all = await api.entities.Invoice.list('-created_date', 100);
      return all.filter(i => 
        i.org_id === user.current_org_id && 
        (i.status === 'sent' || i.status === 'draft')
      );
    },
    enabled: !!user
  });

  const { data: readers = [] } = useQuery({
    queryKey: ['stripe-readers'],
    queryFn: async () => {
      const { data } = await api.functions.invoke('stripePOS', {
        action: 'list_readers'
      });
      return data.readers || [];
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const createPaymentMutation = useMutation({
    mutationFn: async ({ amount, invoiceId }) => {
      const { data } = await api.functions.invoke('stripePOS', {
        action: 'create_payment_intent',
        amount: parseFloat(amount),
        invoiceId
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success("Payment intent created! Present card to reader.");
      setAmount('');
      setSelectedInvoice(null);
      queryClient.invalidateQueries({ queryKey: ['unpaid-invoices'] });
    },
    onError: (error) => {
      toast.error(`Failed to create payment: ${error.message}`);
    }
  });

  const handleQuickPayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    createPaymentMutation.mutate({ 
      amount: parseFloat(amount),
      invoiceId: selectedInvoice 
    });
    setTimeout(() => setProcessing(false), 3000);
  };

  const handleInvoicePayment = (invoice) => {
    setAmount(invoice.total.toString());
    setSelectedInvoice(invoice.id);
    createPaymentMutation.mutate({ 
      amount: invoice.total,
      invoiceId: invoice.id 
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-400" />
          Stripe <span className="text-amber-400">Point of Sale</span>
        </h1>
        <p className="text-white/70 mt-2">Accept in-person card payments with Stripe Terminal</p>
      </div>

      {/* Terminal Status */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <Badge className={readers.length > 0 ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                {readers.length > 0 ? 'Connected' : 'No Readers'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-blue-400">{readers.length}</p>
            <p className="text-white/60 text-xs">Terminal Readers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="w-5 h-5 text-purple-400" />
              <Badge className="bg-purple-500/20 text-purple-400">Pending</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-400">{unpaidInvoices.length}</p>
            <p className="text-white/60 text-xs">Unpaid Invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400">Total</Badge>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              ${unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toFixed(2)}
            </p>
            <p className="text-white/60 text-xs">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Payment */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Quick Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10 bg-white/5 border-blue-500/30 text-white text-2xl font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Link to Invoice (Optional)</Label>
              <Select value={selectedInvoice || "none"} onValueChange={(v) => setSelectedInvoice(v === 'none' ? null : v)}>
                <SelectTrigger className="bg-white/5 border-blue-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Invoice</SelectItem>
                  {unpaidInvoices.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.number} - ${inv.total?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleQuickPayment}
              disabled={!amount || processing || createPaymentMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg py-6"
            >
              {processing || createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Charge ${amount || '0.00'}
                </>
              )}
            </Button>

            {readers.length === 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ No terminal readers connected. Set up Stripe Terminal in your Stripe Dashboard.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminal Readers */}
        <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              Connected Readers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readers.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 mb-2">No readers connected</p>
                <p className="text-white/40 text-sm">
                  Set up Stripe Terminal hardware in your{' '}
                  <a 
                    href="https://dashboard.stripe.com/terminal/readers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Stripe Dashboard
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {readers.map((reader) => (
                  <div key={reader.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{reader.label || reader.id}</p>
                        <p className="text-white/60 text-xs">{reader.device_type}</p>
                      </div>
                      <Badge className={
                        reader.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }>
                        {reader.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            Unpaid Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unpaidInvoices.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/60">All invoices paid!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">{invoice.number}</p>
                    <p className="text-white/60 text-sm">
                      {invoice.client_id && `Client: ${invoice.client_id}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">${invoice.total?.toFixed(2)}</p>
                      <Badge className={
                        invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleInvoicePayment(invoice)}
                      className="bg-gradient-to-r from-green-600 to-green-500"
                    >
                      Charge Card
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            Stripe Terminal Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-white/70 text-sm">
          <p>
            <strong className="text-white">1. Get Stripe Terminal Hardware:</strong> Order a reader from{' '}
            <a href="https://stripe.com/terminal" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
              stripe.com/terminal
            </a>
          </p>
          <p>
            <strong className="text-white">2. Register Reader:</strong> Connect your reader in the{' '}
            <a href="https://dashboard.stripe.com/terminal/readers" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
              Stripe Dashboard
            </a>
          </p>
          <p>
            <strong className="text-white">3. Start Accepting Payments:</strong> Once registered, your reader will appear above and you can start processing in-person payments
          </p>
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mt-3">
            <p className="text-blue-400 text-xs">
              💡 <strong>Mobile POS:</strong> Use Stripe Terminal mobile readers (BBPOS WisePad 3, Stripe Reader M2) for on-the-go payments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}