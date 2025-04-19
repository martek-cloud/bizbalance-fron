import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Printer, FileText } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { startOfMonth, format } from "date-fns";
import useProfitLossStore from "@/store/profitLossStore";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatCurrencyNoSymbol = (amount) => {
  return formatCurrency(amount).replace('$', '');
};

// Add print-specific styles at the top of the file
const printStyles = `
  @media print {
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    @page {
      size: A3;
      margin: 0.25in;
    }
    .page {
      box-sizing: border-box;
      padding: 24px;
    }
  }
  @media screen {
    .print-only {
      display: none !important;
    }
    .pdf-page {
      width: 1122px;
      height: 1587px;
      background: white;
      padding: 24px;
      box-sizing: border-box;
      margin: 0 auto;
    }
    .pdf-generation {
      position: absolute;
      left: 0;
      top: 0;
      width: 1122px;
      height: 1587px;
      background: white;
      z-index: -1000;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      transform-origin: top left;
      transform: scale(1);
    }
    .pdf-generation * {
      letter-spacing: -0.2px;
      transform: none !important;
    }
    .pdf-generation table {
      transform: none !important;
    }
    .pdf-generation td {
      height: auto !important;
      transform: none !important;
    }
  }
`;

// IRS Schedule C Format Component
const IRSFormatView = React.forwardRef(({ plData, isPdfGeneration }, ref) => {
  if (!plData) return null;

  return (
    <div 
      ref={ref} 
      className={isPdfGeneration ? "pdf-generation" : "print-only"}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '9px',
        lineHeight: '1.2',
        fontWeight: '400',
        fontKerning: 'normal',
        textRendering: 'optimizeLegibility',
        transform: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      <div className="pdf-page">
        {/* Form Header */}
        <div className="border border-black p-3 mb-2">
          <div className="grid grid-cols-3 gap-1">
            <div className="col-span-2">
              <div style={{ fontSize: '14px', fontWeight: '600' }}>SCHEDULE C</div>
              <div style={{ fontSize: '12px' }}>(Form 1040)</div>
              <div style={{ fontSize: '10px' }}>Department of the Treasury Internal Revenue Service</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginTop: '2px' }}>Profit or Loss From Business</div>
              <div style={{ fontSize: '12px' }}>(Sole Proprietorship)</div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '12px' }}>OMB No. 1545-0074</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>{new Date().getFullYear()}</div>
              <div style={{ fontSize: '12px' }}>Attachment</div>
              <div style={{ fontSize: '8px' }}>Sequence No. 09</div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="border border-black p-3 mb-2">
          <div className="grid gap-0.5">
            <div className="grid grid-cols-[auto,1fr] gap-1">
              <div style={{ fontWeight: '600', fontSize: '10px' }}>A</div>
              <div style={{ fontSize: '10px' }}>Principal business or profession, including product or service</div>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-1">
              <div style={{ fontWeight: '600', fontSize: '10px' }}>B</div>
              <div>Enter code from instructions</div>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-1">
              <div style={{ fontWeight: '600', fontSize: '10px' }}>C</div>
              <div style={{ fontSize: '10px' }}>Business name</div>
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="border border-black p-3 mb-2">
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>Part I Income</div>
          <Table>
            <TableBody style={{ transform: 'none' }}>
              <TableRow>
                <TableCell className="w-4 p-0.5">1</TableCell>
                <TableCell className="p-0.5">Gross receipts or sales</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.grossReceipts)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">2</TableCell>
                <TableCell className="p-0.5">Returns and allowances</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.returnsAndAllowances)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">3</TableCell>
                <TableCell className="p-0.5">Subtract line 2 from line 1</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.grossReceipts - plData.income.returnsAndAllowances)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">4</TableCell>
                <TableCell className="p-0.5">Cost of goods sold (from line 42)</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.costOfGoodsSold)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">5</TableCell>
                <TableCell className="p-0.5">Gross profit. Subtract line 4 from line 3</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.grossProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">6</TableCell>
                <TableCell className="p-0.5">Other income</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.otherIncome)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">7</TableCell>
                <TableCell className="p-0.5">Gross income. Add lines 5 and 6</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.income.grossIncome)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Expenses Section */}
        <div className="border border-black p-3 mb-2">
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>Part II Expenses</div>
          <Table>
            <TableBody style={{ transform: 'none' }}>
              {Object.entries(plData.expenses).map(([categoryKey, categoryValue], categoryIndex) => {
                if (categoryKey === 'totalExpenses') return null;
                const categoryTotal = Object.entries(categoryValue).reduce((total, [_, typeValue]) => {
                  return total + Object.values(typeValue).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
                }, 0);

                return (
                  <React.Fragment key={categoryKey}>
                    {/* Category Header */}
                    <TableRow>
                      <TableCell className="w-4 p-0.5">{8 + (categoryIndex * 3)}</TableCell>
                      <TableCell className="p-0.5" style={{ fontWeight: '600' }}>
                        {categoryKey.split(/(?=[A-Z])/).join(' ').split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </TableCell>
                      <TableCell className="text-right w-20 p-0.5" style={{ fontWeight: '600' }}>
                        {formatCurrencyNoSymbol(categoryTotal)}
                      </TableCell>
                    </TableRow>

                    {/* Types and Labels */}
                    {Object.entries(categoryValue).map(([typeKey, typeValue], typeIndex) => {
                      const typeTotal = Object.values(typeValue).reduce((sum, val) => 
                        sum + (typeof val === 'number' ? val : 0), 0);

                      return (
                        <React.Fragment key={`${categoryKey}-${typeKey}`}>
                          {/* Type Row */}
                          <TableRow>
                            <TableCell className="w-4 p-0.5">
                              {`${8 + (categoryIndex * 3)}${String.fromCharCode(97 + typeIndex)}`}
                            </TableCell>
                            <TableCell className="p-0.5 pl-4" style={{ fontStyle: 'italic' }}>
                              {typeKey.split(/(?=[A-Z])/).join(' ').split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </TableCell>
                            <TableCell className="text-right w-20 p-0.5" style={{ fontStyle: 'italic' }}>
                              {formatCurrencyNoSymbol(typeTotal)}
                            </TableCell>
                          </TableRow>

                          {/* Labels */}
                          {Object.entries(typeValue).map(([labelKey, labelValue], labelIndex) => (
                            <TableRow key={`${categoryKey}-${typeKey}-${labelKey}`}>
                              <TableCell className="w-4 p-0.5">
                                {`${8 + (categoryIndex * 3)}${String.fromCharCode(97 + typeIndex)}${labelIndex + 1}`}
                              </TableCell>
                              <TableCell className="p-0.5 pl-8">
                                {labelKey.split(/(?=[A-Z])/).join(' ').split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </TableCell>
                              <TableCell className="text-right w-20 p-0.5">
                                {formatCurrencyNoSymbol(labelValue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <TableRow>
                <TableCell className="w-4 p-0.5">27</TableCell>
                <TableCell className="p-0.5" style={{ fontWeight: '600' }}>Total expenses</TableCell>
                <TableCell className="text-right w-20 p-0.5" style={{ fontWeight: '600' }}>
                  {formatCurrencyNoSymbol(plData.totalExpenses)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Net Profit Section */}
        <div className="border border-black p-3">
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>Part III Net Profit or Loss</div>
          <Table>
            <TableBody style={{ transform: 'none' }}>
              <TableRow>
                <TableCell className="w-4 p-0.5">28</TableCell>
                <TableCell className="p-0.5">Tentative profit or (loss)</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.netProfit.tentativeProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">29</TableCell>
                <TableCell className="p-0.5">Expenses for business use of home</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.netProfit.businessUseOfHome)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-4 p-0.5">30</TableCell>
                <TableCell className="p-0.5">Net profit or (loss)</TableCell>
                <TableCell className="text-right w-20 p-0.5">{formatCurrencyNoSymbol(plData.netProfit.netProfit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
});

IRSFormatView.displayName = 'IRSFormatView';

// Modern UI Component
const ModernView = ({ plData }) => {
  if (!plData) return null;

  const formatLabel = (key) => {
    return key
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get total for a category
  const getCategoryTotal = (category) => {
    let total = 0;
    Object.values(category).forEach(value => {
      if (typeof value === 'object') {
        Object.values(value).forEach(subValue => {
          if (typeof subValue === 'number') {
            total += subValue;
          }
        });
      }
    });
    return total;
  };

  return (
    <div className="space-y-8 no-print">
      {/* Part I: Income */}
      <Card>
        <CardHeader>
          <CardTitle>Part I: Income</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Gross Receipts or Sales</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.income.grossReceipts)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Returns and Allowances</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.income.returnsAndAllowances)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost of Goods Sold</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.income.costOfGoodsSold)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Gross Profit</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(plData.income.grossProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Other Income</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.income.otherIncome)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Gross Income</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(plData.income.grossIncome)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Part II: Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Part II: Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {Object.entries(plData.expenses).map(([categoryKey, categoryValue]) => {
                if (categoryKey === 'totalExpenses') return null;
                const categoryTotal = getCategoryTotal(categoryValue);
                
                return (
                  <React.Fragment key={categoryKey}>
                    {/* Category Header */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-medium text-lg">
                        {formatLabel(categoryKey)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(categoryTotal)}
                      </TableCell>
                    </TableRow>

                    {/* Types */}
                    {Object.entries(categoryValue).map(([typeKey, typeValue]) => {
                      const typeTotal = Object.values(typeValue).reduce((sum, val) => 
                        sum + (typeof val === 'number' ? val : 0), 0);
                      
                      return (
                        <React.Fragment key={`${categoryKey}-${typeKey}`}>
                          {/* Type Row */}
                          <TableRow className="bg-muted/10">
                            <TableCell className="font-medium pl-8">
                              {formatLabel(typeKey)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(typeTotal)}
                            </TableCell>
                          </TableRow>

                          {/* Labels */}
                          {Object.entries(typeValue).map(([labelKey, labelValue]) => (
                            <TableRow key={`${categoryKey}-${typeKey}-${labelKey}`}>
                              <TableCell className="pl-16">
                                {formatLabel(labelKey)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(labelValue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium text-lg">Total Expenses</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(plData.totalExpenses)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Part III: Net Profit or Loss */}
      <Card>
        <CardHeader>
          <CardTitle>Part III: Net Profit or Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Tentative Profit or Loss</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.netProfit.tentativeProfit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Business Use of Home</TableCell>
                <TableCell className="text-right">{formatCurrency(plData.netProfit.businessUseOfHome)}</TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Net Profit or Loss</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(plData.netProfit.netProfit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfitLoss = () => {
  const { plData, loading, fetchProfitLoss, exportProfitLoss } = useProfitLossStore();
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [generating, setGenerating] = useState(false);
  const [isPdfGeneration, setIsPdfGeneration] = useState(false);
  const irsViewRef = useRef(null);

  const fetchPLData = useCallback(async () => {
    await fetchProfitLoss(
      format(dateRange.from, 'yyyy-MM-dd'),
      format(dateRange.to, 'yyyy-MM-dd')
    );
  }, [dateRange, fetchProfitLoss]);

  const handleExport = useCallback(async () => {
    await exportProfitLoss(
      format(dateRange.from, 'yyyy-MM-dd'),
      format(dateRange.to, 'yyyy-MM-dd')
    );
  }, [dateRange, exportProfitLoss]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    if (!irsViewRef.current || generating) return;

    try {
      setGenerating(true);
      setIsPdfGeneration(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      const element = irsViewRef.current;
      
      // A3 dimensions in pixels at 96 DPI
      const A3_WIDTH = 1122;
      const A3_HEIGHT = 1587;
      
      // Create PDF with A3 format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a3',
        compress: true,
        hotfixes: ['px_scaling']
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: A3_WIDTH,
        height: A3_HEIGHT,
        windowWidth: A3_WIDTH,
        windowHeight: A3_HEIGHT,
        backgroundColor: '#ffffff',
        letterRendering: true,
        allowTaint: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('.pdf-generation');
          if (el) {
            el.style.transform = 'none';
            el.style.transformOrigin = 'top left';
            el.style.width = `${A3_WIDTH}px`;
            el.style.height = `${A3_HEIGHT}px`;
          }
        }
      });

      pdf.addImage(
        canvas,
        'JPEG',
        0,
        0,
        A3_WIDTH,
        A3_HEIGHT,
        undefined,
        'FAST'
      );

      pdf.save(`profit-loss-schedule-c-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
      setIsPdfGeneration(false);
    }
  }, [dateRange, generating]);

  useEffect(() => {
    fetchPLData();
  }, [fetchPLData]);

  return (
    <div className="container mx-auto p-4 max-w-[800px]">
      <style>{printStyles}</style>
      {/* Controls */}
      <div className="mb-4 flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
        <div className="flex gap-4">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button 
            onClick={handleExport} 
            size="icon" 
            variant="outline"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleGeneratePDF} 
            size="icon" 
            variant="outline"
            disabled={generating}
            title="Generate PDF"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </Button>
          <Button 
            onClick={handlePrint} 
            size="icon" 
            variant="outline"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 no-print">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : plData ? (
        <div>
          <ModernView plData={plData} />
          <IRSFormatView 
            ref={irsViewRef} 
            plData={plData} 
            isPdfGeneration={isPdfGeneration}
          />
        </div>
      ) : (
        <Card className="no-print">
          <CardContent className="flex flex-col justify-center items-center h-32 gap-2">
            <p className="text-muted-foreground">
              No data available for the period: {format(dateRange.from, 'MMMM d, yyyy')} to {format(dateRange.to, 'MMMM d, yyyy')}
            </p>
            <Button 
              variant="outline" 
              onClick={fetchPLData}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfitLoss; 