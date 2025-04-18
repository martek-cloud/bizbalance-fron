import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";

const printStyles = `
  @media print {
    @page { 
      margin: 0;
      size: A4;
    }
    
    body {
      visibility: hidden;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    #invoice-content {
      visibility: visible;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      padding: 20px;
      color: black !important;
      background: white !important;
    }

    #invoice-content * {
      color: black !important;
      border-color: #ddd !important;
      font-family: Arial, sans-serif !important;
    }

    #invoice-content .text-destructive {
      color: #dc2626 !important;
    }

    #invoice-content .text-muted-foreground {
      color: #6b7280 !important;
    }

    #invoice-content table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    #invoice-content th,
    #invoice-content td {
      border: 1px solid #ddd !important;
      padding: 8px !important;
    }

    .no-print {
      display: none !important;
    }

    .print-break-inside-avoid {
      break-inside: avoid;
    }
  }
`;

const InvoiceViewer = ({ isOpen, onClose, data }) => {
  const [tvaEnabled, setTvaEnabled] = useState(false);
  const [tvaRate, setTvaRate] = useState("20");
  const invoiceRef = useRef(null);

  if (!data) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full max-w-[1200px] p-0 sm:max-w-[1200px]"
        >
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-lg text-muted-foreground">Loading invoice data...</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const calculateSubtotal = () => {
    if (!data) return 0;
    const grossTotal = data.gross_receipts_sales;
    const returnsTotal = data.returns;
    const costTotal = data.cost_of_goods_sold;
    return grossTotal - returnsTotal - costTotal;
  };

  const calculateTVA = () => {
    const subtotal = calculateSubtotal();
    return tvaEnabled ? (subtotal * parseFloat(tvaRate)) / 100 : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tva = calculateTVA();
    return subtotal + tva;
  };

  const handleDownload = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const opt = {
      margin: 1,
      filename: `invoice-${data.business_id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <style>{printStyles}</style>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="p-4 w-full max-w-[1000px] sm:max-w-[1000px] overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SheetHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <SheetTitle className="text-2xl font-bold">
                    Receipt Preview
                  </SheetTitle>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <label className="text-sm font-medium">TVA Status:</label>
                      <Select
                        value={tvaEnabled ? "yes" : "no"}
                        onValueChange={(value) => setTvaEnabled(value === "yes")}
                      >
                        <SelectTrigger className="w-full sm:w-28">
                          <SelectValue placeholder="TVA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Enabled</SelectItem>
                          <SelectItem value="no">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {tvaEnabled && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-sm font-medium">TVA Rate:</label>
                        <Select value={tvaRate} onValueChange={setTvaRate}>
                          <SelectTrigger className="w-full sm:w-28">
                            <SelectValue placeholder="Rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="15">15%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Invoice Content */}
            <div className="flex-1 overflow-auto px-4 py-6">
              <div
                id="invoice-content"
                ref={invoiceRef}
                className="bg-card rounded-lg p-6 max-w-[850px] mx-auto shadow-sm"
              >
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-primary">RECEIPT</h2>
                    <p className="text-muted-foreground mt-1">
                      #{data.business_id}
                    </p>
                  </div>
                  <div className="text-right no-print">
                    <p className="text-sm font-medium text-muted-foreground">Date:</p>
                    <p className="text-sm">{formatDate(data.income_date)}</p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">From:</p>
                    <div className="space-y-1">
                      <p className="font-medium">Your Company Name</p>
                      <p className="text-sm text-muted-foreground">123 Business Street</p>
                      <p className="text-sm text-muted-foreground">City, Country</p>
                      <p className="text-sm text-muted-foreground">contact@company.com</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">To:</p>
                    <div className="space-y-1">
                      <p className="font-medium">Business ID: {data.business_id}</p>
                      <p className="text-sm text-muted-foreground">Created by: {data.created_by}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="print-break-inside-avoid overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-4">Product/Service</td>
                        <td className="text-right p-4">
                          {(data.gross_receipts_sales || 0).toLocaleString()} $
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Returns</td>
                        <td className="text-right p-4 text-destructive">
                          -{(data.returns || 0).toLocaleString()} $
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Cost of Goods</td>
                        <td className="text-right p-4 text-destructive">
                          -{(data.cost_of_goods_sold || 0).toLocaleString()} $
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-8 print-break-inside-avoid space-y-2">
                  <div className="flex justify-between items-center py-2 text-sm">
                    <p className="text-muted-foreground">Subtotal:</p>
                    <p className="font-medium">{calculateSubtotal().toLocaleString()} $</p>
                  </div>
                  {tvaEnabled && (
                    <div className="flex justify-between items-center py-2 text-sm">
                      <p className="text-muted-foreground">TVA ({tvaRate}%):</p>
                      <p className="font-medium">{calculateTVA().toLocaleString()} $</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-lg font-semibold">Total:</p>
                    <p className="text-lg font-semibold">{calculateTotal().toLocaleString()} $</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex justify-end gap-3 no-print">
                <Button variant="outline" onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default InvoiceViewer;