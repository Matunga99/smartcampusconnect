import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, Receipt, CreditCard, ChevronRight, CheckCircle, XCircle, FileText } from 'lucide-react';

interface StudentFinancePortalProps {
  token: string;
  user: any;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function StudentFinancePortal({ token, user, appendLog, isPhoneFrame = false }: StudentFinancePortalProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [invRes, txRes, balRes] = await Promise.all([
        fetch('/api/finance/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/finance/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/finance/student-balances', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (balRes.ok) {
        const bals = await balRes.json();
        if (bals.length > 0) setBalance(bals[0]);
      }
    } catch (e) {
      console.error(e);
      appendLog?.('[ERROR] Student Finance Portal sync failed.');
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [token]);

  const handleMpesaPayment = async (invoiceId: string, amount: number) => {
    const phoneNumber = prompt("Enter M-PESA Phone Number (e.g. 2547XXXXXXXX):", "2547");
    if (!phoneNumber) return;
    
    appendLog?.(`[FINANCE] Initiating M-PESA STK Push to ${phoneNumber} for Ksh ${amount}...`);
    
    // Simulate STK Push delay
    setTimeout(async () => {
       try {
         const resp = await fetch('/api/finance/payments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               studentId: user.id,
               amount,
               method: 'M_PESA',
               invoiceId,
               reference: 'MPESA_' + Date.now()
            })
         });
         
         if (resp.ok) {
            appendLog?.(`[FINANCE] M-PESA Payment Success! Ledger updated and Event emitted.`);
            fetchFinanceData();
         }
       } catch (e) {
          console.error(e);
       }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-12">
         <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const outstanding = balance?.outstandingBalance || 0;
  const isCleared = outstanding === 0;

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <Wallet className="absolute top-4 right-4 h-24 w-24 text-indigo-500 opacity-20" />
           <p className="text-indigo-100 font-mono text-[10px] uppercase tracking-widest mb-1 relative z-10">Outstanding Balance</p>
           <h3 className="text-4xl font-bold font-mono relative z-10">Ksh {outstanding.toLocaleString()}</h3>
           
           <div className="mt-6 flex gap-2 relative z-10">
              <span className="bg-black/20 px-2 py-1 rounded text-[10px] font-bold">Total Billed: Ksh {balance?.totalBilled?.toLocaleString() || 0}</span>
              <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 px-2 py-1 rounded text-[10px] font-bold">Total Paid: Ksh {balance?.totalPaid?.toLocaleString() || 0}</span>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
           <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mb-2">Academic Event Clearance</p>
           {isCleared ? (
              <div className="flex items-center gap-3 text-emerald-600">
                 <div className="bg-emerald-100 p-2 rounded-full"><CheckCircle className="h-6 w-6" /></div>
                 <div>
                    <h4 className="font-bold">CLEARED</h4>
                    <p className="text-xs text-slate-500">You are eligible to sit for exams.</p>
                 </div>
              </div>
           ) : (
              <div className="flex items-center gap-3 text-rose-600">
                 <div className="bg-rose-100 p-2 rounded-full"><XCircle className="h-6 w-6" /></div>
                 <div>
                    <h4 className="font-bold">BLOCKED</h4>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xs">Clear your outstanding balance to unlock exam registration and results.</p>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Invoices */}
      <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2 mt-8 mb-4">
        <Receipt className="h-4 w-4" /> Unpaid Invoices
      </h3>
      
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {invoices.filter(i => i.status !== 'PAID').length === 0 ? (
           <div className="p-8 text-center text-slate-500 text-sm italic">No unpaid invoices.</div>
        ) : (
           <div className="divide-y divide-slate-100">
              {invoices.filter(i => i.status !== 'PAID').map(inv => (
                 <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 text-sm">{inv.term} Fees</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {inv.id} &bull; Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-right">
                          <p className="font-bold text-slate-900">Ksh {(inv.totalAmount - inv.amountPaid).toLocaleString()}</p>
                          <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">{inv.status}</p>
                       </div>
                       <button onClick={() => handleMpesaPayment(inv.id, inv.totalAmount - inv.amountPaid)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 shadow-sm">
                          <CreditCard className="h-4 w-4" /> Pay with M-PESA
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* Ledger History */}
      <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2 mt-8 mb-4">
        <Wallet className="h-4 w-4" /> Double-Entry Ledger History
      </h3>
      
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
         <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono tracking-wider">
                     <th className="p-3 border-b border-slate-200">Date</th>
                     <th className="p-3 border-b border-slate-200">Method</th>
                     <th className="p-3 border-b border-slate-200">Ref</th>
                     <th className="p-3 border-b border-slate-200 text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="text-xs">
                  {transactions.length === 0 ? (
                     <tr><td colSpan={4} className="text-center p-6 text-slate-400 italic">No payments recorded.</td></tr>
                  ) : transactions.map(tx => (
                     <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 font-mono">
                        <td className="p-3 text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="p-3">
                           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">{tx.method}</span>
                        </td>
                        <td className="p-3 text-slate-400">{tx.reference}</td>
                        <td className="p-3 text-emerald-600 font-bold text-right">+Ksh {tx.amount.toLocaleString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
