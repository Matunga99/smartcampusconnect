import React, { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Tag, RefreshCw, Bookmark, User, Clock, AlertTriangle, 
  Check, FileText, Download, DollarSign, Settings, Trash, CheckSquare, Upload, Calendar, Search
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
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  copyBarcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "active" | "returned" | "overdue";
}

interface Fine {
  id: string;
  studentName: string;
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
  fileSize: string;
}

export default function LibrarianManagerDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "lendings" | "fines" | "repository">("catalog");
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [documents, setDocuments] = useState<RepositoryDocument[]>([]);

  // Add Book Form State
  const [showAddBook, setShowAddBook] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [catId, setCatId] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("2026");
  const [type, setType] = useState<"physical" | "ebook">("physical");
  const [copies, setCopies] = useState("3");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("");

  // Add Category Modal State
  const [showAddCat, setShowAddCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Digital Upload form State
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [docType, setDocType] = useState("past_paper");
  const [docUrl, setDocUrl] = useState("");
  const [docSize, setDocSize] = useState("1.4 MB");

  // Hand-in assessment Modal State
  const [returningBorrowingId, setReturningBorrowingId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<"good" | "damaged" | "lost">("good");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCatalog();
    fetchBorrowings();
    fetchFines();
    fetchDocuments();
  }, [activeSubTab]);

  const fetchCatalog = async () => {
    try {
      const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
      const catRes = await fetch("/api/library/categories", { headers: { 'Authorization': `Bearer ${token}` } });
      const catData = catRes.ok ? await catRes.json() : [];
      setCategories(Array.isArray(catData) ? catData : []);

      const bookRes = await fetch("/api/library/books", { headers: { 'Authorization': `Bearer ${token}` } });
      const bookData = bookRes.ok ? await bookRes.json() : [];
      setBooks(Array.isArray(bookData) ? bookData : []);
    } catch(e) { 
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
    } catch(e) { 
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
    } catch(e) { 
      console.error(e); 
      setFines([]);
    }
  };

  const fetchDocuments = async () => {
     try {
       const token = localStorage.getItem('scc_token') || localStorage.getItem('token');
       const res = await fetch("/api/library/repository/documents", { headers: { 'Authorization': `Bearer ${token}` } });
       const data = res.ok ? await res.json() : [];
       setDocuments(Array.isArray(data) ? data : []);
     } catch(e) { 
       console.error(e); 
       setDocuments([]);
     }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !isbn) return;
    try {
      const res = await fetch("/api/library/books", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            title, author, isbn, categoryId: catId, publisher, year, type, copiesCount: copies, fileUrl, fileSize
         })
      });
      if (res.ok) {
         setMessage({ text: "Catalog entry indexed! Barcoded inventory copies produced automatically.", type: "success" });
         setTitle(""); setAuthor(""); setIsbn(""); setCatId(""); setPublisher(""); setCopies("3");
         setShowAddBook(false);
         fetchCatalog();
      } else {
         const data = await res.json();
         setMessage({ text: data.error || "Failed to create book record", type: "error" });
      }
    } catch(err) { console.error(err); }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const res = await fetch(`/api/library/books/${bookId}`, { method: "DELETE" });
      if (res.ok) {
         setMessage({ text: "Scholarly item removed from active catalog.", type: "success" });
         fetchCatalog();
      }
    } catch(err) { console.error(err); }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    try {
       const res = await fetch("/api/library/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName, description: catDesc })
       });
       if (res.ok) {
          setMessage({ text: `Sub-category folder '${catName}' added to digital index.`, type: "success" });
          setCatName(""); setCatDesc(""); setShowAddCat(false);
          fetchCatalog();
       }
    } catch(err) { console.error(err); }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
       const res = await fetch("/api/library/repository/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: docTitle, description: docDesc, type: docType, documentUrl: docUrl, fileSize: docSize })
       });
       if (res.ok) {
          setMessage({ text: "Document file registered to active digital repository archive.", type: "success" });
          setDocTitle(""); setDocDesc(""); setShowUploadDoc(false);
          fetchDocuments();
       }
    } catch(err) { console.error(err); }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleReturnCheckin = async () => {
    if (!returningBorrowingId) return;
    try {
       const res = await fetch("/api/library/borrowings/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowingId: returningBorrowingId, condition: returnCondition })
       });
       if (res.ok) {
          const data = await res.json();
          if (data.fineGenerated) {
             setMessage({ text: `Returned with penalties! KES ${data.fineGenerated.amount} posted to Finance student balance.`, type: "error" });
          } else {
             setMessage({ text: "Book checked in cleanly! Copied barcode has been released to available cabinet pool.", type: "success" });
          }
          setReturningBorrowingId(null);
          fetchBorrowings();
       }
    } catch(err) { console.error(err); }
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl space-y-6">
      
      {/* Mini Segment Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
         <button 
           onClick={() => setActiveSubTab("catalog")}
           className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x -mb-px transition ${
             activeSubTab === "catalog" ? "bg-white border-slate-200 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
           }`}
         >
           Physical & Electronic Catalog
         </button>
         <button 
           onClick={() => setActiveSubTab("lendings")}
           className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x -mb-px transition ${
             activeSubTab === "lendings" ? "bg-white border-slate-200 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
           }`}
         >
           Circulation / Checked-Out Handouts
         </button>
         <button 
           onClick={() => setActiveSubTab("fines")}
           className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x -mb-px transition ${
             activeSubTab === "fines" ? "bg-white border-slate-200 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
           }`}
         >
           Arrears & Fine Postings
         </button>
         <button 
           onClick={() => setActiveSubTab("repository")}
           className={`px-4 py-2.5 font-bold text-xs rounded-t-xl border-t border-x -mb-px transition ${
             activeSubTab === "repository" ? "bg-white border-slate-200 text-indigo-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
           }`}
         >
           Archive Digital Materials
         </button>
      </div>

      {/* Action alerts notifier */}
      <AnimatePresence>
         {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 mb-2 rounded-xl text-xs border font-medium flex items-center gap-2 ${
                 message.type === "success" ? "bg-emerald-50 border-emerald-150 text-emerald-800" : "bg-rose-50 border-rose-150 text-rose-800"
              }`}
            >
               <AlertTriangle className="w-4 h-4 text-slate-500" />
               <span>{message.text}</span>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Sub Tabs Contents */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[350px]">
         
         {/* CATALOG SUB TAB */}
         {activeSubTab === "catalog" && (
           <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h2 className="text-base font-bold text-slate-800">Library Book Storage Indexes</h2>
                    <p className="text-xs text-slate-400">Add physical barcodes to libraries, track copies count and publisher parameters.</p>
                 </div>
                 <div className="flex gap-2 self-stretch md:self-auto shrink-0">
                    <button 
                      onClick={() => setShowAddCat(true)}
                      className="bg-slate-50 hover:bg-slate-100 border text-slate-700 text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Category
                    </button>
                    <button 
                      onClick={() => setShowAddBook(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Cataloging
                    </button>
                 </div>
              </div>

              {/* Add Category Section */}
              {showAddCat && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Add Textbook Genre Field</h3>
                    <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-3 items-end">
                       <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Subject Title</label>
                          <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required placeholder="e.g., Computer Engineering" className="text-xs p-2 rounded-lg bg-white border w-full outline-none" />
                       </div>
                       <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Brief Description</label>
                          <input type="text" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Topics in embedded circuits..." className="text-xs p-2 rounded-lg bg-white border w-full outline-none" />
                       </div>
                       <div className="flex gap-1">
                          <button type="button" onClick={() => setShowAddCat(false)} className="text-xs text-slate-500 px-3 py-2">Cancel</button>
                          <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-bold">Log Category</button>
                       </div>
                    </form>
                 </motion.div>
              )}

              {/* Add Book Section */}
              {showAddBook && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-slate-50 p-5 rounded-xl border space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Indexed Textbook Metadata</h3>
                    <form onSubmit={handleCreateBook} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Book Title Name</label>
                          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Compilers: Principles, Tools, & Techniques" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Author / Scholar</label>
                          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="e.g., Alfred Aho, Jeffrey Ullman" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                       </div>
                       <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">ISBN 13 Number</label>
                          <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required placeholder="e.g., 978-0321486813" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                       </div>

                       <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Subject Category</label>
                          <select value={catId} onChange={(e) => setCatId(e.target.value)} className="text-xs p-2 bg-white border rounded-lg w-full outline-none">
                             <option value="">Choose category</option>
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>

                       <div>
                          <label className="text-[10px] text-slate-400 font-bold block mb-1">Book Format Mode</label>
                          <select value={type} onChange={(e) => setType(e.target.value as any)} className="text-xs p-2 bg-white border rounded-lg w-full outline-none">
                             <option value="physical">Physical Book Paper</option>
                             <option value="ebook">Digital PDF E-Book</option>
                          </select>
                       </div>

                       {type === "physical" ? (
                          <div>
                             <label className="text-[10px] text-slate-400 font-bold block mb-1">Copies count to seed (barcoded)</label>
                             <input type="number" value={copies} onChange={(e) => setCopies(e.target.value)} placeholder="3" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                          </div>
                       ) : (
                          <>
                             <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1">Download PDF file URL</label>
                                <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://example.com/books/compiler.pdf" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                             </div>
                             <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1">Calculated file size estimate</label>
                                <input type="text" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="2.5 MB" className="text-xs p-2 bg-white border rounded-lg w-full outline-none" />
                             </div>
                          </>
                       )}

                       <div className="md:col-span-3 flex justify-end gap-1 pt-2">
                          <button type="button" onClick={() => setShowAddBook(false)} className="text-xs text-slate-500 px-3 py-1.5 rounded">Close</button>
                          <button type="submit" className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded font-bold">Catalog Entry</button>
                       </div>
                    </form>
                 </motion.div>
              )}

              {/* Book catalogs Table */}
              <div className="overflow-x-auto border rounded-xl overflow-hidden">
                 <table className="w-full text-xs text-left text-slate-500">
                    <thead className="bg-slate-50 text-slate-400 font-bold">
                       <tr>
                          <th className="p-3.5">Title / Scholar</th>
                          <th className="p-3.5">ISBN code</th>
                          <th className="p-3.5">Media Mode</th>
                          <th className="p-3.5">Cabinet Availability</th>
                          <th className="p-3.5 text-right">Filing Controls</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {books.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/50">
                             <td className="p-3.5 font-bold text-slate-800">
                                <div>{b.title}</div>
                                <span className="text-[10px] text-slate-400 font-normal">By {b.author}</span>
                             </td>
                             <td className="p-3.5 font-mono text-[10px]">{b.isbn}</td>
                             <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${
                                   b.type === "ebook" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                                }`}>
                                   {b.type === "ebook" ? "Digital File" : "Physical Copy"}
                                </span>
                             </td>
                             <td className="p-3.5">
                                {b.type === "ebook" ? "Unlimited Cloud" : `${b.availableCopies} available of ${b.copiesCount} total`}
                             </td>
                             <td className="p-3.5 text-right">
                                <button 
                                  onClick={() => handleDeleteBook(b.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                                  title="Withdraw Book"
                                >
                                   <Trash className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
         )}

         {/* CIRCULATION SUB TAB */}
         {activeSubTab === "lendings" && (
            <div className="space-y-4">
               <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Active lending ledger entries</h2>
                  <p className="text-xs text-slate-400">Log checking-in assessments directly and manage late returns warnings.</p>
               </div>

               {borrowings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {borrowings.map(bor => {
                        const isLate = !bor.returnDate && new Date(bor.dueDate) < new Date();
                        return (
                           <div key={bor.id} className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${
                              isLate ? "border-rose-150 bg-rose-50/10" : "border-slate-100"
                           }`}>
                              <div>
                                 <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-mono text-slate-400">Barcode: {bor.copyBarcode}</span>
                                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                                       bor.returnDate ? "bg-slate-100 text-slate-600" : isLate ? "bg-rose-150 text-rose-800" : "bg-indigo-50 text-indigo-700 whitespace-nowrap"
                                    }`}>
                                       {bor.returnDate ? "returned Check" : isLate ? "OVERDUE LIABILITY" : "Reading now"}
                                    </span>
                                 </div>
                                 <h3 className="text-xs font-bold text-slate-800 mt-2">{bor.bookTitle}</h3>
                                 <div className="flex gap-2.5 text-[10px] text-slate-500 mt-1.5 items-center">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Holder: <strong className="text-slate-700 font-bold">{bor.studentName}</strong> ({bor.studentId})</span>
                                 </div>
                                 <div className="text-[10px] text-slate-400 mt-1">Due return: {new Date(bor.dueDate).toLocaleDateString()}</div>
                              </div>

                              {!bor.returnDate && (
                                 <div className="flex justify-end pt-3 mt-3 border-t border-slate-50">
                                    <button 
                                      onClick={() => setReturningBorrowingId(bor.id)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                                    >
                                       <CheckSquare className="w-3.5 h-3.5" /> Book Return Assessment
                                    </button>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No textbooks checked-out currently.</p>
               )}

               {returningBorrowingId && (
                  <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-lg border">
                        <h3 className="font-bold text-slate-800 text-sm">Return Assessment Deck</h3>
                        <p className="text-xs text-slate-500">Determine volume condition on return to generate automatic accounting posting entries:</p>
                        
                        <div className="space-y-2 pt-2">
                           <button 
                             onClick={() => setReturnCondition("good")}
                             className={`w-full text-left text-xs p-3 rounded-xl border flex justify-between items-center ${
                                returnCondition === "good" ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 font-bold" : "border-slate-100"
                             }`}
                           >
                              <div>
                                 <strong>Prisinte Clean Condition</strong>
                                 <span className="text-[10px] text-slate-400 block font-normal">Releases copy barcode as available with zero assessments</span>
                              </div>
                              {returnCondition === "good" && <Check className="w-4 h-4 text-indigo-600" />}
                           </button>

                           <button 
                             onClick={() => setReturnCondition("damaged")}
                             className={`w-full text-left text-xs p-3 rounded-xl border flex justify-between items-center ${
                                returnCondition === "damaged" ? "border-amber-600 bg-amber-50/30 text-amber-900 font-bold" : "border-slate-100"
                             }`}
                           >
                              <div>
                                 <strong>Torn Pages or Damaged Binder</strong>
                                 <span className="text-[10px] text-amber-700 block font-normal">Automates KES 750 ledger and invoicing assessment fine</span>
                              </div>
                              {returnCondition === "damaged" && <Check className="w-4 h-4 text-amber-650" />}
                           </button>

                           <button 
                             onClick={() => setReturnCondition("lost")}
                             className={`w-full text-left text-xs p-3 rounded-xl border flex justify-between items-center ${
                                returnCondition === "lost" ? "border-rose-600 bg-rose-50/30 text-rose-900 font-bold" : "border-slate-100"
                             }`}
                           >
                              <div>
                                 <strong>Irrecoverable / Lost Volume</strong>
                                 <span className="text-[10px] text-rose-700 block font-normal">Automates KES 1,500 total loss ledger debit posting</span>
                              </div>
                              {returnCondition === "lost" && <Check className="w-4 h-4 text-rose-600" />}
                           </button>
                        </div>

                        <div className="flex gap-2 justify-end pt-3 text-xs">
                           <button onClick={() => setReturningBorrowingId(null)} className="text-slate-500 hover:text-slate-700 px-3 py-2">Close</button>
                           <button onClick={handleReturnCheckin} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold font-semibold">Post hand-in</button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </div>
         )}

         {/* FINES SUB TAB */}
         {activeSubTab === "fines" && (
            <div className="space-y-4">
               <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Generated student liabilities & fine postings</h2>
                  <p className="text-xs text-slate-400">Real-time ledger audit entries generated automatically through check-in assessments.</p>
               </div>

               <div className="overflow-x-auto border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left text-slate-500">
                     <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <tr>
                           <th className="p-3">Debtor Student</th>
                           <th className="p-3">Assessment Penalty</th>
                           <th className="p-3">Amount</th>
                           <th className="p-3">Filing Date</th>
                           <th className="p-3 text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {fines.map(f => (
                           <tr key={f.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800">{f.studentName}</td>
                              <td className="p-3 font-semibold uppercase tracking-wide text-[10px]">
                                 {String(f.reason).replace('_', ' ')}
                              </td>
                              <td className="p-3 font-bold text-slate-800">KES {f.amount}</td>
                              <td className="p-3 text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 text-right">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    f.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                 }`}>
                                    {f.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* DIGITAL REPOSITORY SUB TAB */}
         {activeSubTab === "repository" && (
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div>
                     <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Electronic archival material catalog</h2>
                     <p className="text-xs text-slate-400">Publish guidelines, slide packets, exams direct downloads.</p>
                  </div>
                  <button 
                    onClick={() => setShowUploadDoc(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 hover:bg-indigo-700 rounded-xl font-semibold flex items-center gap-1 transition"
                  >
                     <Plus className="w-3.5 h-3.5" /> Log Material
                  </button>
               </div>

               {showUploadDoc && (
                  <motion.div initial={{ opacity: 0, height: 0 }} { ...{ animate: { opacity: 1, height: "auto" } } } className="bg-slate-50 p-4 border rounded-xl space-y-3">
                     <h3 className="text-xs font-bold text-slate-700 uppercase">Input Material coordinates</h3>
                     <form onSubmit={handleCreateDocument} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div>
                           <label className="text-[10px] text-slate-400 font-semibold block mb-1">Material Name</label>
                           <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required placeholder="e.g., Programming I Exam 2024 Study guide" className="text-xs p-2 bg-white rounded-lg border w-full outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-[10px] text-slate-400 font-semibold block mb-1">Archive Type</label>
                           <select value={docType} onChange={(e) => setDocType(e.target.value)} className="text-xs p-2 bg-white rounded-lg border w-full outline-none focus:border-indigo-500">
                              <option value="past_paper">Semester Exam Past Paper booklets</option>
                              <option value="lecture_notes">Faculty Lecture Notes packets</option>
                              <option value="guidelines">Campus Institutional guidelines</option>
                           </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="text-[10px] text-slate-400 font-semibold block mb-1">Brief Description of coordinates</label>
                           <input type="text" value={docDesc} onChange={(e) => setDocDesc(e.target.value)} placeholder="Full syllabus topics breakdown..." className="text-xs p-2 bg-white rounded-lg border w-full outline-none" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-1.5 mt-2">
                           <button type="button" onClick={() => setShowUploadDoc(false)} className="text-xs text-slate-500 px-3 py-1 bg-transparent">Close</button>
                           <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs px-4 py-1 rounded-xl">Index file</button>
                        </div>
                     </form>
                  </motion.div>
               )}

               <div className="overflow-x-auto border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left text-slate-500">
                     <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">
                        <tr>
                           <th className="p-3">File Asset Name</th>
                           <th className="p-3">Extension Genre</th>
                           <th className="p-3">Calculated Space</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {documents.map((doc, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800">{doc.title}</td>
                              <td className="p-3 font-semibold uppercase tracking-wide text-[10px]">{String(doc.type).replace('_', ' ')}</td>
                              <td className="p-3 font-mono">{doc.fileSize}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

      </div>
    </div>
  );
}
