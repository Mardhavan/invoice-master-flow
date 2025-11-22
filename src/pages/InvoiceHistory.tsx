import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiTrash2, FiEye, FiPlus } from "react-icons/fi";
import applyWizzLogo from "@/assets/applywizz-logo.png";
import { toast } from "sonner";
import { format } from "date-fns";

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  total: number;
  data: any;
}

const InvoiceHistory = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const saved = localStorage.getItem("invoiceHistory");
    if (saved) {
      setInvoices(JSON.parse(saved));
    }
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    localStorage.setItem("invoiceHistory", JSON.stringify(updated));
    toast.success("Invoice deleted");
  };

  const loadInvoice = (invoice: SavedInvoice) => {
    localStorage.setItem("currentInvoiceData", JSON.stringify(invoice.data));
    navigate("/invoice");
    toast.success("Invoice loaded");
  };

  const createNewInvoice = () => {
    localStorage.removeItem("currentInvoiceData");
    navigate("/invoice");
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Futuristic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite_4s]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Diagonal Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(34,211,238,0.05)_50%,transparent_70%)] animate-[slide-diagonal_20s_linear_infinite]" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-[pulse-glow_3s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-green-400 rounded-full animate-[pulse-glow_4s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-[pulse-glow_5s_ease-in-out_infinite_2s]" />
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-[pulse-glow_4s_ease-in-out_infinite_3s]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-cyan-500/20 bg-zinc-900/50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/")}
                  className="hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <div className="flex items-center gap-3">
                <motion.img 
                  src={applyWizzLogo} 
                  alt="Logo" 
                  className="h-12 w-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  animate={{ 
                    filter: [
                      "drop-shadow(0 0 20px rgba(34,211,238,0.3))",
                      "drop-shadow(0 0 30px rgba(34,211,238,0.5))",
                      "drop-shadow(0 0 20px rgba(34,211,238,0.3))"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div>
                  <h1 className="text-xl font-bold">
                    <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                      Invoice History
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-400">All your invoices</p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={createNewInvoice}
                className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {invoices.length === 0 ? (
            <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-12 shadow-[0_0_30px_rgba(34,211,238,0.1)] text-center">
              <FiFileText className="h-16 w-16 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No invoices yet</h3>
              <p className="text-zinc-400 mb-6">Create your first invoice to get started</p>
              <Button 
                onClick={createNewInvoice}
                className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                          <FiFileText className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                          <p className="text-sm text-zinc-400">{invoice.clientName || "No client name"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">
                            {format(new Date(invoice.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                            ${invoice.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => loadInvoice(invoice)}
                              className="text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <FiEye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InvoiceHistory;
