import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FiPlus, FiTrash2, FiDownload, FiArrowLeft, FiFileText, FiImage, FiCode } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import applyWizzLogo from "@/assets/applywizz-logo.png";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  lineItems: LineItem[];
  tax: number;
  discount: number;
  date: string;
  notes: string;
  paymentLink: string;
}

const InvoiceEditor = () => {
  const navigate = useNavigate();
  
  const getNextInvoiceNumber = () => {
    const lastNumber = localStorage.getItem("lastInvoiceNumber");
    const nextNumber = lastNumber ? parseInt(lastNumber) + 1 : 1001;
    localStorage.setItem("lastInvoiceNumber", nextNumber.toString());
    return `INV-${nextNumber}`;
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: getNextInvoiceNumber(),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0 }],
    tax: 0,
    discount: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
    paymentLink: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("currentInvoiceData");
    if (saved) {
      setInvoiceData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentInvoiceData", JSON.stringify(invoiceData));
  }, [invoiceData]);

  const companyInfo = {
    name: "APPLY WIZZ",
    address: "Telangana, India",
    email: "hello@applywizz.com",
    logo: applyWizzLogo,
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
    };
    setInvoiceData({
      ...invoiceData,
      lineItems: [...invoiceData.lineItems, newItem],
    });
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length > 1) {
      setInvoiceData({
        ...invoiceData,
        lineItems: invoiceData.lineItems.filter((item) => item.id !== id),
      });
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      lineItems: invoiceData.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const calculateSubtotal = () => {
    return invoiceData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * invoiceData.tax) / 100;
    const discountAmount = (subtotal * invoiceData.discount) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  const prepareInvoiceForExport = () => {
    const element = document.getElementById("invoice-preview");
    if (!element) return null;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = "210mm";
    clone.style.maxWidth = "210mm";
    clone.style.padding = "20mm";
    clone.style.boxSizing = "border-box";
    document.body.appendChild(clone);

    const backgrounds = clone.querySelectorAll('[class*="bg-zinc"], [class*="bg-gradient"]');
    backgrounds.forEach((el) => {
      const element = el as HTMLElement;
      element.style.backgroundColor = '#ffffff';
      element.style.backgroundImage = 'none';
    });

    const styledTexts = clone.querySelectorAll('.bg-gradient-to-r, .bg-clip-text, [class*="text-transparent"]');
    styledTexts.forEach((el) => {
      const element = el as HTMLElement;
      element.style.background = 'none';
      element.style.backgroundImage = 'none';
      element.style.backgroundClip = 'unset';
      element.style.webkitBackgroundClip = 'unset';
      element.style.color = '#000000';
    });

    const borders = clone.querySelectorAll('[class*="border"]');
    borders.forEach((el) => {
      const element = el as HTMLElement;
      element.style.borderColor = '#e5e7eb';
    });

    return clone;
  };

  const exportToPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-export" });

      const clone = prepareInvoiceForExport();
      if (!clone) return;

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      });

      document.body.removeChild(clone);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`${invoiceData.invoiceNumber}.pdf`);
      toast.success("PDF exported successfully!", { id: "pdf-export" });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF", { id: "pdf-export" });
    }
  };

  const exportToImage = async () => {
    try {
      toast.loading("Generating image...", { id: "image-export" });

      const clone = prepareInvoiceForExport();
      if (!clone) return;

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      });

      document.body.removeChild(clone);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${invoiceData.invoiceNumber}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("Image exported successfully!", { id: "image-export" });
        }
      }, 'image/png');
    } catch (error) {
      console.error("Image Export Error:", error);
      toast.error("Failed to export image", { id: "image-export" });
    }
  };

  const exportToHTML = () => {
    try {
      toast.loading("Generating HTML...", { id: "html-export" });

      const element = document.getElementById("invoice-preview");
      if (!element) return;

      const clone = element.cloneNode(true) as HTMLElement;
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceData.invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #ffffff;
    }
    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 20mm;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    ${clone.innerHTML}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${invoiceData.invoiceNumber}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("HTML exported successfully!", { id: "html-export" });
    } catch (error) {
      console.error("HTML Export Error:", error);
      toast.error("Failed to export HTML", { id: "html-export" });
    }
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
        <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Diagonal Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(34,211,238,0.05)_50%,transparent_70%)] animate-slide-diagonal" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse-glow" />
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-green-400 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-glow" style={{ animationDelay: '3s' }} />
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
                      Invoice Creator
                    </span>
                  </h1>
                  <p className="text-xs text-zinc-400">Futuristic Invoice System</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={exportToPDF}
                  className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={exportToImage}
                  className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 hover:from-cyan-500/30 hover:to-green-500/30 border border-cyan-500/30 text-white"
                >
                  <FiImage className="mr-2 h-4 w-4" />
                  Image
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={exportToHTML}
                  className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 hover:from-cyan-500/30 hover:to-green-500/30 border border-cyan-500/30 text-white"
                >
                  <FiCode className="mr-2 h-4 w-4" />
                  HTML
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,550px]">
          {/* Editor Section */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-white">Invoice Details</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-300">Invoice Number</Label>
                    <Input
                      value={invoiceData.invoiceNumber}
                      disabled
                      className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Invoice Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white hover:bg-zinc-800 hover:border-cyan-500/50",
                            !invoiceData.date && "text-zinc-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-cyan-400" />
                          {invoiceData.date ? format(new Date(invoiceData.date), "PPP") : <span>Pick date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-900 border-cyan-500/30" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(invoiceData.date)}
                          onSelect={(date) => {
                            if (date) {
                              setInvoiceData({ ...invoiceData, date: date.toISOString().split("T")[0] });
                            }
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Client Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-white">Client Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-cyan-300">Client Name</Label>
                    <Input
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                      placeholder="Company Name or Individual"
                      className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500 focus:border-cyan-500/70"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Email Address</Label>
                    <Input
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                      placeholder="client@example.com"
                      className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500 focus:border-cyan-500/70"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Billing Address</Label>
                    <Textarea
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                      placeholder="Street Address&#10;City, State, ZIP"
                      className="mt-1.5 resize-none bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500 focus:border-cyan-500/70"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Line Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-white">Line Items</h2>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm" 
                      onClick={addLineItem}
                      className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 hover:from-cyan-500/30 hover:to-green-500/30 border border-cyan-500/30 text-cyan-300"
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {invoiceData.lineItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 border border-cyan-500/20 rounded-lg bg-zinc-800/30 backdrop-blur-sm hover:border-cyan-500/40 transition-all"
                      >
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs text-zinc-400">Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                              placeholder="Service or product name"
                              className="mt-1.5 bg-zinc-900/50 border-cyan-500/20 text-white placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs text-zinc-400">Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              min="0"
                              className="mt-1.5 bg-zinc-900/50 border-cyan-500/20 text-white"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs text-zinc-400">Rate ($)</Label>
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="mt-1.5 bg-zinc-900/50 border-cyan-500/20 text-white"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2 flex items-end gap-2">
                            <div className="flex-1">
                              <Label className="text-xs text-zinc-400">Amount</Label>
                              <div className="mt-1.5 h-10 flex items-center px-3 rounded-md bg-zinc-900/50 border border-cyan-500/20">
                                <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                                  ${(item.quantity * item.rate).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {invoiceData.lineItems.length > 1 && (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLineItem(item.id)}
                                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Adjustments */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-white">Adjustments</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-cyan-300">Tax (%)</Label>
                    <Input
                      type="number"
                      value={invoiceData.tax}
                      onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <Label className="text-cyan-300">Discount (%)</Label>
                    <Input
                      type="number"
                      value={invoiceData.discount}
                      onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Payment Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-white">Payment Information</h2>
                </div>
                <div>
                  <Label className="text-cyan-300">Payment Link</Label>
                  <Input
                    value={invoiceData.paymentLink}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentLink: e.target.value })}
                    placeholder="https://payment.example.com/your-link"
                    className="mt-1.5 bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500 focus:border-cyan-500/70"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-zinc-900/80 backdrop-blur-xl border-cyan-500/20 p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-white">Additional Notes</h2>
                </div>
                <Textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  placeholder="Payment terms, thank you message, or additional information..."
                  className="resize-none bg-zinc-800/50 border-cyan-500/30 text-white placeholder:text-zinc-500 focus:border-cyan-500/70"
                  rows={4}
                />
              </Card>
            </motion.div>
          </div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <Card className="bg-zinc-900/50 backdrop-blur-xl border-cyan-500/20 p-4 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiFileText className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Live Preview</h3>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
              
              <div id="invoice-preview" className="bg-zinc-950/90 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-cyan-500/10">
                <div className="p-8 space-y-8">
                  {/* Header with Gradient Border */}
                  <div className="relative pb-6 border-b border-gradient-to-r from-transparent via-cyan-500/50 to-transparent">
                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="flex items-start justify-between">
                      <div>
                        <motion.img
                          src={companyInfo.logo}
                          alt="Company Logo"
                          className="h-16 w-auto object-contain mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          animate={{ 
                            filter: [
                              "drop-shadow(0 0 15px rgba(34,211,238,0.4))",
                              "drop-shadow(0 0 20px rgba(34,211,238,0.6))",
                              "drop-shadow(0 0 15px rgba(34,211,238,0.4))"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                          {companyInfo.name}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">{companyInfo.address}</p>
                        <p className="text-sm text-zinc-400">{companyInfo.email}</p>
                      </div>
                      <div className="text-right">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                          INVOICE
                        </h2>
                        <div className="mt-3 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/30 rounded-lg">
                          <p className="text-xs text-zinc-400">Invoice Number</p>
                          <p className="text-sm font-bold text-cyan-300">
                            {invoiceData.invoiceNumber}
                          </p>
                        </div>
                        <p className="text-sm text-zinc-400 mt-2">
                          {format(new Date(invoiceData.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bill To with Glow Effect */}
                  <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-green-500/5 border border-cyan-500/20 rounded-lg">
                    <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                      Bill To
                    </h4>
                    <p className="font-semibold text-white text-lg">
                      {invoiceData.clientName || "Client Name"}
                    </p>
                    {invoiceData.clientEmail && (
                      <p className="text-sm text-zinc-400 mt-1">{invoiceData.clientEmail}</p>
                    )}
                    {invoiceData.clientAddress && (
                      <p className="text-sm text-zinc-400 whitespace-pre-line mt-1">
                        {invoiceData.clientAddress}
                      </p>
                    )}
                  </div>

                  {/* Introduction Text */}
                  <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-green-500/5 border-l-4 border-cyan-500 rounded-r-lg">
                    <p className="text-sm text-zinc-300 italic leading-relaxed">
                      Thank you for choosing Apply Wizz. Please find below the detailed breakdown of services and charges for your order:
                    </p>
                  </div>

                  {/* Futuristic Table */}
                  <div>
                    <div className="border border-cyan-500/20 rounded-lg overflow-hidden bg-zinc-900/50">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-cyan-500/10 to-green-500/10">
                          <tr className="border-b border-cyan-500/20">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-300 uppercase tracking-wider w-16">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-300 uppercase tracking-wider w-24">
                              Rate
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-300 uppercase tracking-wider w-28">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.lineItems.map((item, index) => (
                            <tr key={item.id} className={cn(
                              "border-b border-cyan-500/10",
                              index % 2 === 0 ? "bg-zinc-900/30" : "bg-transparent"
                            )}>
                              <td className="px-4 py-3 text-sm text-white">
                                {item.description || "—"}
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-zinc-400">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right text-sm text-zinc-400">
                                ${item.rate.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-cyan-300">
                                ${(item.quantity * item.rate).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals with Gradient */}
                  <div className="flex justify-end">
                    <div className="w-72 space-y-3 p-5 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 border border-cyan-500/20 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="font-medium text-white">
                          ${calculateSubtotal().toFixed(2)}
                        </span>
                      </div>
                      {invoiceData.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Tax ({invoiceData.tax}%)</span>
                          <span className="font-medium text-white">
                            ${((calculateSubtotal() * invoiceData.tax) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {invoiceData.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">
                            Discount ({invoiceData.discount}%)
                          </span>
                          <span className="font-medium text-green-400">
                            -${((calculateSubtotal() * invoiceData.discount) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-cyan-500/30">
                        <span className="font-semibold text-white text-lg">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Section */}
                  {invoiceData.paymentLink && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-green-500/5 border border-cyan-500/20 rounded-lg">
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                          Payment Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-zinc-400 font-medium">Payment Link:</span>
                            <a 
                              href={invoiceData.paymentLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-cyan-400 hover:text-cyan-300 underline break-all"
                            >
                              {invoiceData.paymentLink}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-green-500/5 to-cyan-500/5 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm text-zinc-300 italic leading-relaxed">
                          The payment link is attached. Once payment is complete, please reply to this email to confirm so we can proceed with the work.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {invoiceData.notes && (
                    <div className="pt-6 border-t border-cyan-500/20">
                      <div className="p-4 bg-gradient-to-br from-cyan-500/5 to-green-500/5 border border-cyan-500/20 rounded-lg">
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <div className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-green-500 rounded-full" />
                          Notes
                        </h4>
                        <p className="text-sm text-zinc-300 whitespace-pre-line">
                          {invoiceData.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-6 border-t border-cyan-500/20 text-center">
                    <p className="text-xs text-zinc-500">
                      Thank you for your business! • Powered by Apply Wizz
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceEditor;
