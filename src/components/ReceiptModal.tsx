import React from 'react';
import { Printer, X } from 'lucide-react';
import { Sale } from '../types';
import { AskLogo } from './AskLogo';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Thermal Receipt Preview
          </span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-neutral-900" id="thermal-receipt-printable">
          {/* Farm Header */}
          <div className="text-center pb-3 border-b border-dashed border-neutral-400 flex flex-col items-center">
            <AskLogo variant="mark" size="sm" className="mb-1.5" />
            <h1 className="text-sm font-bold tracking-wider">ASK DAIRY MANAGEMENT</h1>
            <p className="text-[10px] text-neutral-600">Pure Farm Fresh Milk &amp; Dairy Products</p>
            <p className="text-[10px] text-neutral-600">Okara Bypass / Gujranwala &middot; Punjab, PK</p>
            <p className="text-[10px] text-neutral-600">Helpline: +92 300 4567890</p>
          </div>

          {/* Invoice Info */}
          <div className="py-2.5 border-b border-dashed border-neutral-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-600">Inv #:</span>
              <span className="font-semibold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Date:</span>
              <span>{sale.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Customer:</span>
              <span className="font-semibold">{sale.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-neutral-400">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-300 text-[10px] text-neutral-600 uppercase">
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Rate</th>
                  <th className="pb-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px]">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 pr-1 font-sans font-medium text-neutral-800 leading-tight">
                      {item.productName}
                    </td>
                    <td className="py-1 text-center tabular-nums">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {item.unitPrice}
                    </td>
                    <td className="py-1 text-right font-semibold tabular-nums">
                      ₨ {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal:</span>
              <span className="tabular-nums">₨ {sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Discount:</span>
                <span className="tabular-nums">- ₨ {sale.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold pt-1 border-t border-neutral-300">
              <span>Net Total:</span>
              <span className="tabular-nums">₨ {sale.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-neutral-600">Paid Amount ({sale.paymentMethod.toUpperCase()}):</span>
              <span className="tabular-nums font-semibold">₨ {sale.paidAmount.toLocaleString()}</span>
            </div>
            {sale.creditAmount > 0 && (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Added to Credit Ledger:</span>
                <span className="tabular-nums">₨ {sale.creditAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer note in English & Urdu */}
          <div className="pt-3 text-center text-[10px] text-neutral-500 space-y-1">
            <p>خالص دودھ، صحت مند زندگی — شکریہ</p>
            <p>Thank you for choosing ASK Dairy!</p>
            <p className="text-[9px]">Software powered by ASK Dairy ERP</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
