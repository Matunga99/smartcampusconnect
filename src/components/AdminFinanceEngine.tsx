import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Receipt, Wallet, ArrowRightLeft, Database, 
  CheckCircle, XCircle, Search, DollarSign, BookOpen, AlertTriangle
} from 'lucide-react';

interface AdminFinanceEngineProps {
  token: string;
  appendLog?: (msg: string) => void;
  isPhoneFrame?: boolean;
}

export default function AdminFinanceEngine({ token, appendLog, isPhoneFrame = false }: AdminFinanceEngineProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'clearance' | 'sponsors'>('overview');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  const totalOutstanding = balances.reduce((acc, bal) => acc + (bal.outstandingBalance || 0), 0);
  
  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [invRes, txRes, balRes, spRes] = await Promise.all([
        fetch('/api/finance/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/finance/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/finance/student-balances', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/finance/sponsors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (balRes.ok) setBalances(await balRes.json());
      if (spRes.ok) setSponsors(await spRes.json());
    } catch (e) {
      console.error(e);
      appendLog?.('[ERROR] Phase 4 Finance Engine sync failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [token]);

  // Handle Mock Invoice Generation
  const handleGenerateInvoice = async (studentId: string, name: string) => {
    try {
      const resp = await fetch('/api/finance/invoices', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            studentId,
            studentName: name,
            term: 'YEAR 1 SEMESTER 1',
            items: [
              { name: 'Tuition Fee', amount: 5000 },
              { name: 'Registration Fee', amount: 500 },
              { name: 'Library Fee', amount: 100 }
            ],
            totalAmount: 5600,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
         })
      });
      if (resp.ok) {
         appendLog?.(`[FINANCE] Auto Billing Engine generated new invoice for Student ID: ${studentId}`);
         fetchFinanceData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-mono tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            University Finance Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">Phase 4 (Stripe + M-PESA + Oracle ERP Standard)</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Ledger Dashboard</button>
           <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Invoice Engine</button>
           <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>M-PESA Payments</button>
           <button onClick={() => setActiveTab('clearance')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'clearance' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Clearance Status</button>
           <button onClick={() => setActiveTab('sponsors')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${activeTab === 'sponsors' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Corporate Sponsors</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
           <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
           </div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg mb-4">
                           <DollarSign className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase mb-1">Total Verified Revenue</p>
                        <h3 className="text-3xl font-bold text-slate-900">Ksh {totalRevenue.toLocaleString()}</h3>
                     </div>
                     <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 bg-rose-100 text-rose-600 flex items-center justify-center rounded-lg mb-4">
                           <AlertTriangle className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase mb-1">Total Outstanding Debt</p>
                        <h3 className="text-3xl font-bold text-slate-900">Ksh {totalOutstanding.toLocaleString()}</h3>
                     </div>
                     <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg mb-4">
                           <Database className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase mb-1">Double-Entry Ledger Txs</p>
                        <h3 className="text-3xl font-bold text-slate-900">{transactions.length}</h3>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-6 shadow overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Wallet className="h-32 w-32" />
                    </div>
                    <h3 className="text-white font-bold font-mono text-lg mb-2 relative z-10">Ledger Foundation Status</h3>
                    <p className="text-slate-400 text-sm max-w-2xl relative z-10 mb-4">
                       The Double Entry Transaction Engine ensures every payment follows strictly DEBIT = CREDIT. Transaction audits are hashed and un-deletable.
                    </p>
                    <div className="flex gap-2">
                       <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded text-xs font-mono">ledger_accounts: ACTIVE</span>
                       <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded text-xs font-mono">double_entry_engine: SYNCED</span>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'invoices' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-slate-900 text-sm">Automated Billing & Invoice Engine</h3>
                       <p className="text-xs text-slate-500">Auto-Generates Tuition & Registration fees.</p>
                     </div>
                     <button onClick={() => {
                        const name = prompt("Enter Student Name for manual invoice:");
                        const id = prompt("Enter Student ID:");
                        if (name && id) handleGenerateInvoice(id, name);
                     }} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition">
                        + Generate Invoice
                     </button>
                  </div>
                  <div className="p-0 overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                              <th className="p-4 border-b border-slate-200">Invoice ID</th>
                              <th className="p-4 border-b border-slate-200">Student</th>
                              <th className="p-4 border-b border-slate-200">Term</th>
                              <th className="p-4 border-b border-slate-200">Amount</th>
                              <th className="p-4 border-b border-slate-200">Paid</th>
                              <th className="p-4 border-b border-slate-200">Status</th>
                           </tr>
                        </thead>
                        <tbody className="text-xs">
                           {invoices.length === 0 ? (
                              <tr>
                                 <td colSpan={6} className="text-center p-8 text-slate-400 italic">No invoices generated yet.</td>
                              </tr>
                           ) : invoices.map(inv => (
                              <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                                 <td className="p-4 font-mono text-indigo-600">{inv.id}</td>
                                 <td className="p-4 font-medium">{inv.studentName} <br/><span className="text-slate-400 font-mono text-[10px]">{inv.studentId}</span></td>
                                 <td className="p-4 text-slate-600">{inv.term}</td>
                                 <td className="p-4 font-bold">Ksh {inv.totalAmount.toLocaleString()}</td>
                                 <td className="p-4 text-emerald-600">Ksh {inv.amountPaid.toLocaleString()}</td>
                                 <td className="p-4">
                                    <span className={`px-2 flex w-max py-0.5 rounded-full text-[10px] font-bold ${
                                       inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                       inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                       {inv.status}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'payments' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-bold text-slate-900 text-sm">Payment Engine (M-PESA / Ledger)</h3>
                     <p className="text-xs text-slate-500">Immutable ledger transaction trail.</p>
                  </div>
                  <div className="p-0 overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                              <th className="p-4 border-b border-slate-200">Transaction ID</th>
                              <th className="p-4 border-b border-slate-200">Student ID</th>
                              <th className="p-4 border-b border-slate-200">Method</th>
                              <th className="p-4 border-b border-slate-200">Amount</th>
                              <th className="p-4 border-b border-slate-200">Timestamp</th>
                           </tr>
                        </thead>
                        <tbody className="text-xs font-mono">
                           {transactions.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="text-center p-8 text-slate-400 italic font-sans">No double-entry transactions found.</td>
                              </tr>
                           ) : transactions.map(tx => (
                              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                                 <td className="p-4 text-slate-500">{tx.id}</td>
                                 <td className="p-4">{tx.studentId}</td>
                                 <td className="p-4">
                                     <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{tx.method}</span>
                                 </td>
                                 <td className="p-4 text-emerald-600 font-bold">+Ksh {tx.amount.toLocaleString()}</td>
                                 <td className="p-4 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'clearance' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-bold text-slate-900 text-sm">Financial Clearance Engine</h3>
                     <p className="text-xs text-slate-500">Academic System Integration (Block on balance &gt; 0)</p>
                  </div>
                  <div className="p-0 overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                              <th className="p-4 border-b border-slate-200">Student</th>
                              <th className="p-4 border-b border-slate-200">Total Billed</th>
                              <th className="p-4 border-b border-slate-200">Outstanding</th>
                              <th className="p-4 border-b border-slate-200">Academic Event Clearance</th>
                           </tr>
                        </thead>
                        <tbody className="text-xs">
                           {balances.length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="text-center p-8 text-slate-400 italic">No student financial records.</td>
                              </tr>
                           ) : balances.map(bal => (
                              <tr key={bal.id} className="border-b border-slate-100 hover:bg-slate-50">
                                 <td className="p-4 font-medium">{bal.studentName} <br/><span className="text-slate-400 font-mono text-[10px]">{bal.studentId}</span></td>
                                 <td className="p-4">Ksh {bal.totalBilled?.toLocaleString()}</td>
                                 <td className="p-4 font-bold text-rose-600">Ksh {bal.outstandingBalance?.toLocaleString()}</td>
                                 <td className="p-4">
                                    {bal.outstandingBalance > 0 ? (
                                       <span className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 w-max px-2 py-1 rounded">
                                          <XCircle className="h-4 w-4" /> BLOCKED (No Exams)
                                       </span>
                                    ) : (
                                       <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 w-max px-2 py-1 rounded">
                                          <CheckCircle className="h-4 w-4" /> CLEARED
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'sponsors' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                     <div>
                        <h3 className="font-bold text-slate-900 text-sm">Corporate Sponsors Engine</h3>
                        <p className="text-xs text-slate-500">Government/NGO multi-student bulk payment mapping</p>
                     </div>
                     <button className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 rounded shadow hover:bg-indigo-700 transition">
                         Onboard Sponsor
                     </button>
                  </div>
                  <div className="p-0 overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase font-mono tracking-wider">
                              <th className="p-4 border-b border-slate-200">Corporate Identity</th>
                              <th className="p-4 border-b border-slate-200">Account Username / Email</th>
                              <th className="p-4 border-b border-slate-200">Type</th>
                              <th className="p-4 border-b border-slate-200">Action</th>
                           </tr>
                        </thead>
                        <tbody className="text-xs">
                           {sponsors.length === 0 ? (
                              <tr>
                                 <td colSpan={4} className="text-center p-8 text-slate-400 italic">No corporate sponsors onboarded.</td>
                              </tr>
                           ) : sponsors.map(sp => (
                              <tr key={sp.id} className="border-b border-slate-100 hover:bg-slate-50">
                                 <td className="p-4 font-bold text-indigo-700">{sp.name}</td>
                                 <td className="p-4 font-mono text-slate-500">{sp.email}</td>
                                 <td className="p-4">{sp.sponsorType}</td>
                                 <td className="p-4">
                                    <button className="px-2 py-1 bg-slate-100 text-slate-600 font-bold tracking-tight rounded hover:bg-indigo-100 hover:text-indigo-700 transition">Assign Students</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
