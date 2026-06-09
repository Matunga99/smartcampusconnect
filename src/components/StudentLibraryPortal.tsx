import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, Download, History, AlertTriangle, CheckCircle, 
  Upload, Clock, FileText, Bookmark, Calendar, DollarSign, ArrowRight, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  publisher: string;
  year: number;
  type: "physical" | "ebook";
  copiesCount: number;
  availableCopies: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Borrowing {
  id: string;
  bookId: string;
  bookTitle: string;
  copyBarcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  renewalsCount: number;
  status: "active" | "returned" | "overdue";
}

interface Fine {
  id: string;
  amount: number;
  reason: "late_return" | "lost_book" | "damaged_book";
  status: "unpaid" | "paid";
  createdAt: string;
}

interface RepositoryDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  documentUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Thesis {
  id: string;
  title: string;
  authorName: string;
  supervisorName: string;
  submissionDate: string;
  status: "pending" | "approved" | "rejected";
}

export default function StudentLibraryPortal() {
  const [activeTab, setActiveTab] = useState<"catalog" | "borrowings" | "repository" | "research">("catalog");
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);
  const [theses, setTheses] = useState<Thesis[]>([]);
  
  // Form/UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "physical" | "ebook">("all");
  const [thesisTitle, setThesisTitle] = useState("");
  const [submittingThesis, setSubmittingThesis] = useState(false);
  const [payingFineId, setPayingFineId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCatalog();
    fetchBorrowings();
    fetchFines();
    fetchRepoDocuments();
    fetchTheses();
  }, [activeTab]);

  const fetchCatalog = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const catRes = await fetch("/api/library/categories", { headers: { 'Authorization': `Bearer ${token}` } });
      const catData = catRes.ok ? await catRes.json() : [];
      setCategories(Array.isArray(catData) ? catData : []);

      let url = "/api/library/books";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (selectedType !== "all") params.append("type", selectedType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const bookRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const bookData = bookRes.ok ? await bookRes.json() : [];
      setBooks(Array.isArray(bookData) ? bookData : []);
    } catch (e) {
      console.error(e);
      setBooks([]);
    }
  };

  const fetchBorrowings = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const res = await fetch("/api/library/borrowings", { headers: { 'Authorization': `Bearer ${token}` } });
      const data = res.ok ? await res.json() : [];
      setBorrowings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setBorrowings([]);
    }
  };

  const fetchFines = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const res = await fetch("/api/library/fines", { headers: { 'Authorization': `Bearer ${token}` } });
      const data = res.ok ? await res.json() : [];
      setFines(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFines([]);
    }
  };

  const fetchRepoDocuments = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const res = await fetch("/api/library/repository/documents", { headers: { 'Authorization': `Bearer ${token}` } });
      const data = res.ok ? await res.json() : [];
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setDocuments([]);
    }
  };

  const fetchTheses = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const res = await fetch("/api/library/research/theses", { headers: { 'Authorization': `Bearer ${token}` } });
      const data = res.ok ? await res.json() : [];
      setTheses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTheses([]);
    }
  };

  const handleBorrow = async (book: Book) => {
    try {
      const response = await fetch("/api/library/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id })
      });
      const data = await response.json();
      if (!response.ok) {
         setMessage({ text: data.error || "Borrowing request failed", type: "error" });
      } else {
         if (book.type === "ebook") {
            window.open(data.downloadUrl, "_blank");
            setMessage({ text: "eBook ready to view! File opened in new tab.", type: "success" });
         } else {
            setMessage({ text: `Physical book checked out: barcode ${data.copyBarcode}. Pick it up from Main Desk!`, type: "success" });
            fetchCatalog();
         }
      }
    } catch (e) {
      setMessage({ text: "Failed to connect to lending desk services", type: "error" });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRenew = async (borrowingId: string) => {
    try {
       const res = await fetch("/api/library/borrowings/renew", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowingId })
       });
       const data = await res.json();
       if (!res.ok) {
          setMessage({ text: data.error || "Renewal failed", type: "error" });
       } else {
          setMessage({ text: `Extension approved! New due date: ${new Date(data.dueDate).toLocaleDateString()}`, type: "success" });
          fetchBorrowings();
       }
    } catch (e) {
       setMessage({ text: "Lending desk failed to process renewal request", type: "error" });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSettleFine = async (fineId: string) => {
    if (!paymentRef.trim()) {
       setMessage({ text: "Please key in a simulation confirmation code (M-PESA / Ledger transaction ref)", type: "error" });
       return;
    }
    try {
       const res = await fetch("/api/library/fines/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fineId, reference: paymentRef })
       });
       if (res.ok) {
          setMessage({ text: "Library Fine settled! Financial Ledger records reconciled.", type: "success" });
          setPayingFineId(null);
          setPaymentRef("");
          fetchFines();
       } else {
          setMessage({ text: "Fine payment rejected", type: "error" });
       }
    } catch(e) {
       console.error(e);
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmitThesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thesisTitle.trim()) return;
    setSubmittingThesis(true);
    try {
       const res = await fetch("/api/library/research/theses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             title: thesisTitle,
             type: "thesis"
          })
       });
       if (res.ok) {
          setMessage({ text: "Final-year draft uploaded for supervisor review!", type: "success" });
          setThesisTitle("");
          fetchTheses();
       } else {
          const data = await res.json();
          setMessage({ text: data.error || "Thesis upload failed", type: "error" });
       }
    } catch (err) {
       console.error(err);
    } finally {
       setSubmittingThesis(false);
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const totalUnpaidFines = fines
    .filter(f => f.status === "unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="bg-slate-50 min-h-screen p-6 rounded-xl">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Knowledge & Library Services</h1>
              <p className="text-sm text-slate-500">Search 500,000+ academic titles, archives, journals, and repository downloads.</p>
            </div>
          </div>
        </div>

        {totalUnpaidFines > 0 && (
          <div className="mt-4 md:mt-0 bg-rose-50 border border-rose-150 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-xs text-rose-700 font-semibold">Outstanding Library Liabilities</p>
              <p className="text-sm font-bold text-rose-900">KES {totalUnpaidFines.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setActiveTab("borrowings")}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition"
            >
              Resolve Fine
            </button>
          </div>
        )}
      </div>

      {/* Alert Notices */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${
              message.type === "success" 
                ? "bg-emerald-50 border-emerald-150 text-emerald-800" 
                : "bg-rose-50 border-rose-150 text-rose-800"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Controller navigation */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === "catalog" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Books & Catalogue Search
        </button>
        <button
          onClick={() => setActiveTab("borrowings")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap relative ${
            activeTab === "borrowings" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          My Lendings & Fines
          {borrowings.filter(b => b.status === "overdue").length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">LATE</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("repository")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === "repository" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Digital Repository Resources
        </button>
        <button
          onClick={() => setActiveTab("research")}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === "research" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Undergrad Research & Theses
        </button>
      </div>

      {/* Tabs panels */}
      <div className="min-h-[400px]">
        
        {/* CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Filtering engine bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query with book title, author initials, or ISBN parameters..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-sm transition outline-none"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:border-indigo-500 outline-none flex-1 md:flex-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl focus:border-indigo-500 outline-none flex-1 md:flex-none"
                >
                  <option value="all">Formats (All)</option>
                  <option value="physical">Physical Book</option>
                  <option value="ebook">Digital E-Book</option>
                </select>

                <button 
                  onClick={fetchCatalog}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Filter Catalogue
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.length > 0 ? (
                books.map((book) => (
                  <motion.div 
                    layout
                    key={book.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition duration-200"
                  >
                    {/* Format Tag */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        book.type === "ebook" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {book.type === "ebook" ? "⚡ E-Book" : "📚 Physical"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">ISBN: {book.isbn}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 line-clamp-2 transition mb-1">{book.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-3">By {book.author}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-50 pt-3 mb-4">
                        <div>
                          <span className="text-slate-400">Publisher:</span> {book.publisher}
                        </div>
                        <div>
                          <span className="text-slate-400">Published:</span> {book.year}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                      <p className="text-xs">
                        {book.type === "ebook" ? (
                          <span className="text-emerald-700 font-semibold">Available Silently</span>
                        ) : (
                          <span className={`${book.availableCopies > 0 ? "text-slate-600" : "text-amber-600"} font-semibold`}>
                            {book.availableCopies} of {book.copiesCount} in Cabinets
                          </span>
                        )}
                      </p>

                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={book.type === "physical" && book.availableCopies === 0}
                        className={`text-xs px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                          book.type === "ebook"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : book.availableCopies > 0 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-slate-150 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {book.type === "ebook" ? (
                          <>
                            <Download className="w-3.5 h-3.5" /> Read eBook
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" /> Check Out
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No textbook matching criteria exists in system index.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BORROWINGS & FINES TAB */}
        {activeTab === "borrowings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Lendings */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-500" /> Currently Possessed Books
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    {borrowings.length} total lendings
                  </span>
                </div>

                {borrowings.length > 0 ? (
                  borrowings.map((bor) => {
                    const isLate = !bor.returnDate && new Date(bor.dueDate) < new Date();
                    return (
                      <div 
                        key={bor.id}
                        className={`bg-white p-5 rounded-2xl border transition shadow-sm ${
                          isLate ? "border-rose-150 bg-rose-50/10" : "border-slate-100"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{bor.bookTitle}</h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Barcode Assignment: {bor.copyBarcode}</p>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            bor.returnDate 
                              ? "bg-slate-100 text-slate-600" 
                              : isLate 
                                ? "bg-rose-100 text-rose-700" 
                                : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {bor.returnDate ? "Returned" : isLate ? "LATE RETURN NOTICE" : "Reading out"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-3 mt-3 border-t border-slate-50 text-slate-600">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Borrowed On</span>
                            <span className="font-semibold">{new Date(bor.borrowDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Due Return Date</span>
                            <span className={`font-semibold ${isLate ? "text-rose-600 font-bold" : ""}`}>
                              {new Date(bor.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                            {!bor.returnDate && (
                              <button
                                onClick={() => handleRenew(bor.id)}
                                disabled={bor.renewalsCount >= 2}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                                  bor.renewalsCount >= 2
                                    ? "bg-slate-150 text-slate-400 cursor-not-allowed"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                }`}
                              >
                                <RefreshCw className="w-3 h-3" /> Renew ({bor.renewalsCount}/2)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white p-8 text-center rounded-2xl border border-dashed border-slate-200">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">You currently hold no physical books from this center.</p>
                  </div>
                )}
              </div>

              {/* Outstanding Fines & Liabilities Column */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Fine Ledgers & Clearance
                </h2>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl text-center">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Accumulated Fine Liability</p>
                    <p className="text-2xl font-black text-slate-800">KES {totalUnpaidFines.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Blocked from Semester Graduation until resolved.</p>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Fines Ledger List */}
                  <div className="space-y-3">
                    {fines.length > 0 ? (
                      fines.map((f) => (
                        <div key={f.id} className="text-xs border border-slate-50 p-3 rounded-lg flex justify-between items-center bg-slate-50/50">
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {f.reason === "late_return" ? "Late Return Checkpoint" : f.reason === "lost_book" ? "Lost Archive Record" : "Damaged binder"}
                            </span>
                            <span className="text-slate-400 text-[10px] block">{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-800 block">KES {f.amount}</span>
                            {f.status === "paid" ? (
                              <span className="text-emerald-600 text-[9px] font-bold">SETTLED</span>
                            ) : (
                              <button 
                                onClick={() => setPayingFineId(payingFineId === f.id ? null : f.id)}
                                className="text-rose-600 text-[9px] bg-rose-50 hover:bg-rose-100 font-bold px-2 py-0.5 rounded"
                              >
                                Pay fine
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs text-center py-4">Your record is clean! No fines.</p>
                    )}
                  </div>

                  {payingFineId && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-3 bg-indigo-50 rounded-xl border border-indigo-150 space-y-2 mt-2"
                     >
                        <p className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-indigo-700" /> Settle Fine Simulation API
                        </p>
                        <p className="text-[10px] text-indigo-700">Enter simulation Reference confirmation to pay instantly:</p>
                        <input 
                          type="text"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="M-PESA Reference Code e.g. RC281NS93"
                          className="w-full text-xs p-2 rounded border border-indigo-200 outline-none focus:border-indigo-600 uppercase font-mono"
                        />
                        <div className="flex gap-1 justify-end pt-1">
                           <button 
                             onClick={() => setPayingFineId(null)}
                             className="text-[10px] text-slate-500 hover:text-slate-700 px-2 py-1"
                           >
                             Cancel
                           </button>
                           <button 
                             onClick={() => handleSettleFine(payingFineId)}
                             className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded"
                           >
                             Post payment
                           </button>
                        </div>
                     </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DIGITAL REPOSITORY TAB */}
        {activeTab === "repository" && (
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">Department Archives</span>
                <h2 className="text-xl font-bold">Past Paper booklets & Syllabi documents</h2>
                <p className="text-xs text-indigo-200">Instant direct download without holding restrictions. Updated weekly by department chairs.</p>
              </div>
              <span className="p-3 bg-indigo-800 text-indigo-300 rounded-full shrink-0">
                <FileText className="w-8 h-8" />
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-xl border border-slate-100 flex items-start gap-4 hover:border-slate-300 transition shadow-sm">
                    <span className="p-3 bg-slate-50 text-slate-500 rounded-lg shrink-0 mt-1">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold tracking-wider uppercase mb-1.5 inline-block">
                        {String(doc.type).replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm truncate">{doc.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 border-t border-slate-50 pt-3">
                        <span>Size: {doc.fileSize}</span>
                        <span>By: {doc.uploadedBy}</span>
                        <span>Date: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <a 
                      href={doc.documentUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                      title="Download Resource"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white text-center py-12 rounded-xl border">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">No digital materials archived in index yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UNDERGRAD RESEARCH TAB */}
        {activeTab === "research" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Draft Submission form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" /> Submit Thesis/Project Work
                </h2>

                <form onSubmit={handleSubmitThesis} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Proposed Research / Project Title</label>
                    <textarea 
                      value={thesisTitle}
                      onChange={(e) => setThesisTitle(e.target.value)}
                      required
                      placeholder="e.g., Performance evaluation of ad-hoc networks during active path congestion..."
                      rows={4}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-medium outline-none transition"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                     <p className="font-bold text-slate-600 flex items-center gap-1">
                       <Clock className="w-3.5 h-3.5 text-slate-400" /> Automatic Supervisor Match
                     </p>
                     <p>Submitted drafts matched automatically with department coordinator (Dr. Isaac Newton) for peer analysis.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingThesis}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-2.5 text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    {submittingThesis ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Submit Research Packet
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Research logs */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Upload Histories
                </h2>

                {theses.length > 0 ? (
                  theses.map((the) => (
                    <div key={the.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold uppercase tracking-wider">
                          Final Year dissertation
                        </span>

                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          the.status === "approved" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : the.status === "rejected" 
                              ? "bg-rose-50 text-rose-700" 
                              : "bg-amber-50 text-amber-700"
                        }`}>
                          {the.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm mt-2">{the.title}</h3>

                      <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-500 border-t border-slate-50 pt-3 mt-4">
                         <div>
                            <span className="text-slate-400">Assigned Advisor:</span> {the.supervisorName}
                         </div>
                         <div className="text-right">
                            <span className="text-slate-400">Posted on:</span> {the.submissionDate}
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white text-center p-12 rounded-2xl border border-dashed text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No project submissions generated yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
