import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Receipt,
  Eye,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  Smartphone
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const statusColors = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-red-500/20 text-red-400",
  void: "bg-gray-500/20 text-gray-400"
};

export default function Invoices() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await api.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const all = await api.entities.Invoice.list('-created_date', 100);
      return all.filter(i => i.org_id === user.current_org_id);
    },
    enabled: !!user
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async (invoiceId) => {
      const { data } = await api.functions.invoke('stripeCheckout', {
        invoiceId,
        mode: 'payment'
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      toast.error(`Payment failed: ${error.message}`);
    }
  });

  const handlePayment = (invoiceId) => {
    createCheckoutMutation.mutate(invoiceId);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pending = invoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const overdue = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Receipt className="w-8 h-8 text-green-400" />
          Invoices & <span className="text-amber-400">Payments</span>
        </h1>
        <p className="text-white/70 mt-2">Manage invoices and accept Stripe payments</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400">Paid</Badge>
            </div>
            <p className="text-3xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
            <p className="text-white/60 text-xs">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400">Pending</Badge>
            </div>
            <p className="text-3xl font-bold text-blue-400">${pending.toFixed(2)}</p>
            <p className="text-white/60 text-xs">Outstanding</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400">Overdue</Badge>
            </div>
            <p className="text-3xl font-bold text-red-400">{overdue}</p>
            <p className="text-white/60 text-xs">Need Follow-up</p>
          </CardContent>
        </Card>

        <Link to={createPageUrl("StripePOS")}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">POS</Badge>
              </div>
              <p className="text-lg font-bold text-purple-400">Stripe Terminal</p>
              <p className="text-white/60 text-xs">In-person payments</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Invoices Table */}
      <Card className="bg-[#0a1929]/60 backdrop-blur border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Invoices</span>
            <Badge className="bg-white/10 text-white">{invoices.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No invoices yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-amber-500/20 hover:bg-transparent">
                  <TableHead className="text-cyan-400">Invoice #</TableHead>
                  <TableHead className="text-cyan-400">Client</TableHead>
                  <TableHead className="text-cyan-400">Amount</TableHead>
                  <TableHead className="text-cyan-400">Due Date</TableHead>
                  <TableHead className="text-cyan-400">Status</TableHead>
                  <TableHead className="text-cyan-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-amber-500/20 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{invoice.number}</TableCell>
                    <TableCell className="text-white/70">{invoice.client_id || 'N/A'}</TableCell>
                    <TableCell className="text-white font-bold">${invoice.total?.toFixed(2)}</TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {invoice.pdf_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        
                        {(invoice.status === 'draft' || invoice.status === 'sent') && (
                          <Button
                            onClick={() => handlePayment(invoice.id)}
                            disabled={createCheckoutMutation.isPending}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-500"
                          >
                            {createCheckoutMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        )}

                        {invoice.status === 'paid' && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stripe Integration Info */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Stripe Payments Active</h3>
              <p className="text-white/70 text-sm mb-3">
                Accept online payments via Stripe Checkout and in-person payments with Stripe Terminal POS
              </p>
              <div className="flex gap-3">
                <Link to={createPageUrl("StripePOS")}>
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-500">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open POS Terminal
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  asChild
                >
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Stripe Dashboard
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}