import React, { useState, useEffect } from 'react';
import { 
  Globe, Users, BookOpen, Calendar, MapPin, Search, ChevronRight, X, Phone, Mail, 
  CheckCircle, ArrowRight, FileText, Upload, CreditCard, ShieldCheck, BadgeCheck, AlertCircle, Building2, Landmark
} from 'lucide-react';

interface PublicWebsiteEngineProps {
   onBackToDirectory: () => void;
}

interface ApplicationData {
  refCode: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED';
  feesPaid: boolean;
  uploadedDocsCount: number;
  submittedOn: string;
}

// Default pre-seeded application tracking references
const SEEDED_APPLICATIONS: ApplicationData[] = [
  {
    refCode: 'APP-2026-000101',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    phone: '+254 711 222 333',
    program: 'B.Sc Computer Science',
    status: 'APPROVED',
    feesPaid: true,
    uploadedDocsCount: 3,
    submittedOn: '10th Jan 2026'
  },
  {
    refCode: 'APP-2026-000202',
    name: 'Alice Wambui',
    email: 'alice.w@outlook.com',
    phone: '+254 722 555 666',
    program: 'Bachelor of Laws (LL.B)',
    status: 'UNDER_REVIEW',
    feesPaid: true,
    uploadedDocsCount: 2,
    submittedOn: '05th Feb 2026'
  },
  {
    refCode: 'APP-2026-000303',
    name: 'Kevin Kioko',
    email: 'kevin.kioko@gmail.com',
    phone: '+254 733 999 888',
    program: 'B.Com Finance',
    status: 'SUBMITTED',
    feesPaid: false,
    uploadedDocsCount: 1,
    submittedOn: '01th Jun 2026'
  }
];

export default function PublicWebsiteEngine({ onBackToDirectory }: PublicWebsiteEngineProps) {
   const [activeTab, setActiveTab] = useState<'home' | 'admissions' | 'programs' | 'news' | 'verification'>('home');
   
   // Online Admissions Form Steps: 1: Bio, 2: Program select, 3: Document Uploads, 4: simulation Fee payment, 5: Success
   const [applyStep, setApplyStep] = useState(1);
   const [appBioName, setAppBioName] = useState('');
   const [appBioEmail, setAppBioEmail] = useState('');
   const [appBioPhone, setAppBioPhone] = useState('');
   
   const [selectedProgram, setSelectedProgram] = useState('B.Sc Computer Science');
   const [mockFiles, setMockFiles] = useState<string[]>([]);
   const [uploading, setUploading] = useState(false);
   
   const [paying, setPaying] = useState(false);
   const [paymentSuccess, setPaymentSuccess] = useState(false);
   const [generatedRefCode, setGeneratedRefCode] = useState('');

   // Tracker lookup state
   const [trackCode, setTrackCode] = useState('');
   const [trackedApp, setTrackedApp] = useState<ApplicationData | null>(null);
   const [trackSearched, setTrackSearched] = useState(false);

   // Employer certificate verifier list
   const [verifyCode, setVerifyCode] = useState('');
   const [verificationResult, setVerificationResult] = useState<any | null>(null);
   const [employerVerifySearched, setEmployerVerifySearched] = useState(false);

   const [admissionList, setAdmissionList] = useState<ApplicationData[]>([]);

   useEffect(() => {
     const stored = localStorage.getItem('scc_online_applications');
     if (stored) {
       try {
         setAdmissionList(JSON.parse(stored));
       } catch (e) {
         setAdmissionList(SEEDED_APPLICATIONS);
       }
     } else {
       localStorage.setItem('scc_online_applications', JSON.stringify(SEEDED_APPLICATIONS));
       setAdmissionList(SEEDED_APPLICATIONS);
     }
   }, []);

   const saveAdmissionsRegistry = (list: ApplicationData[]) => {
     setAdmissionList(list);
     localStorage.setItem('scc_online_applications', JSON.stringify(list));
   };

   // File Upload Mock
   const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
       const name = e.target.files[0].name;
       setUploading(true);
       setTimeout(() => {
         setMockFiles(prev => [...prev, name]);
         setUploading(false);
       }, 800);
     }
   };

   // Simulate admissions fee checkout payment success
   const handleSimulatePayment = () => {
     setPaying(true);
     setTimeout(() => {
       setPaying(false);
       setPaymentSuccess(true);
       
       // Generate final application profile
       const ref = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
       setGeneratedRefCode(ref);

       const newApplication: ApplicationData = {
         refCode: ref,
         name: appBioName || 'Unnamed Scholar',
         email: appBioEmail || 'scholar@test.com',
         phone: appBioPhone || '+254 700 000 000',
         program: selectedProgram,
         status: 'SUBMITTED',
         feesPaid: true,
         uploadedDocsCount: mockFiles.length || 1,
         submittedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
       };

       const updated = [newApplication, ...admissionList];
       saveAdmissionsRegistry(updated);
       setApplyStep(5);
     }, 1200);
   };

   // Tracking flow lookup
   const handleTrackLookup = (e: React.FormEvent) => {
     e.preventDefault();
     setTrackSearched(true);
     const code = trackCode.trim().toUpperCase();
     const found = admissionList.find(a => a.refCode === code) || SEEDED_APPLICATIONS.find(a => a.refCode === code);
     if (found) {
       setTrackedApp(found);
     } else {
       setTrackedApp(null);
     }
   };

   // Graduate Verification lookup synchronized with real DocumentEnginePortal localStorage
   const handleEmployerVerify = (e: React.FormEvent) => {
     e.preventDefault();
     setEmployerVerifySearched(true);
     const code = verifyCode.trim().toUpperCase();
     
     // Retrieve from local storage documents database
     const storedDocs = localStorage.getItem('scc_verifiable_docs');
     let parsedDocs = [];
     if (storedDocs) {
       try {
         parsedDocs = JSON.parse(storedDocs);
       } catch (e) {}
     }

     const found = parsedDocs.find((d: any) => d.code === code);
     if (found) {
       setVerificationResult(found);
     } else {
       setVerificationResult(null);
     }
   };

   return (
      <div className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans border-t-4 border-indigo-600 animate-fade-in relative z-50">
         {/* Top Branding Header */}
         <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-xl z-20 shrink-0">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white rounded-lg flex flex-col items-center justify-center p-1 font-bold text-slate-900 leading-none shadow-sm">
                  <span className="text-[14px]">SM</span><span className="text-[8px]">U</span>
               </div>
               <div>
                  <h1 className="font-serif text-base font-black tracking-widest uppercase">Smart Campus Univ</h1>
                  <p className="text-[9px] text-indigo-300 font-mono tracking-widest uppercase">Knowledge & Excellence Web Portal</p>
               </div>
            </div>
            <button onClick={onBackToDirectory} className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-[10px] font-bold uppercase transition-colors shadow-sm tracking-wider font-mono">
               Close Web Console
            </button>
         </div>

         {/* Website Navigation Menu */}
         <div className="bg-white border-b border-slate-200 p-2 flex gap-1 justify-center z-20 shadow-sm overflow-x-auto shrink-0 select-none">
            {[
              { id: 'home', label: 'Home' },
              { id: 'admissions', label: 'Online Admissions' },
              { id: 'programs', label: 'Program Catalog' },
              { id: 'news', label: 'News & Events' },
              { id: 'verification', label: 'Student Degree Verification' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-3.5 py-2 text-[10.5px] font-bold uppercase transition-all rounded-lg whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-100 font-extrabold shadow-sm' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>

         {/* Website Body Scroll Area */}
         <div className="flex-1 overflow-y-auto bg-slate-50 relative pb-12">
            
            {activeTab === 'home' && (
               <div className="animate-fade-in">
                  {/* Hero Banner */}
                  <div className="relative h-64 bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center text-center px-4 overflow-hidden border-b border-indigo-900">
                     {/* Decorative pattern mesh */}
                     <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400 to-transparent"></div>
                     <div className="relative z-10 w-full max-w-xl">
                        <span className="text-amber-400 font-bold uppercase tracking-widest text-[9px] mb-2 block font-mono">Official Fall Sep Term Intake 2026/2027</span>
                        <h2 className="text-3xl font-serif text-white font-extrabold tracking-tightleading-tight">Shape Your Legacy At SmartCampus University.</h2>
                        <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">Explore accredited high-performance learning partitions across Technology, Business and Jurisprudence Law.</p>
                        <div className="flex justify-center gap-3 mt-6">
                           <button onClick={() => setActiveTab('programs')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500 shadow-xl transition-transform hover:scale-105">Explore Programs</button>
                           <button onClick={() => setActiveTab('admissions')} className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 shadow-xl transition-transform hover:scale-105">Apply Online</button>
                        </div>
                     </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="max-w-4xl mx-auto px-4 py-8">
                     <div className="text-center mb-10">
                        <h3 className="text-xl font-bold font-serif text-slate-800">Governance & Academic Integrity</h3>
                        <div className="w-12 h-1 bg-indigo-600 mx-auto mt-2"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-center hover:shadow-md transition">
                           <BookOpen className="h-8 w-8 text-indigo-500 mx-auto mb-4" />
                           <h4 className="font-bold text-slate-800 text-sm mb-2">35+ Accredited Programs</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">From AI Software Engineering to Business Law, all under global TVETA standard directives.</p>
                        </div>
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-center hover:shadow-md transition col-span-1">
                           <Globe className="h-8 w-8 text-emerald-500 mx-auto mb-4" />
                           <h4 className="font-bold text-slate-800 text-sm mb-2">Two-Way Degree Verification</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">Integrated certificate checking eliminates academic transcript fraud for employers instantly.</p>
                        </div>
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm text-center hover:shadow-md transition">
                           <MapPin className="h-8 w-8 text-amber-500 mx-auto mb-4" />
                           <h4 className="font-bold text-slate-800 text-sm mb-2">Dual-Engine Classrooms</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">State-of-the-art labs, high speed campus wi-fi, and active digital student smart cards.</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'programs' && (
               <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold font-serif text-slate-800 mb-1.5">Academic Program Catalog</h3>
                    <p className="text-xs text-slate-500 border-b border-slate-200 pb-4">
                      Browse certified degrees dynamically linked with SmartCampus administrators.
                    </p>
                  </div>

                  {/* Organized Program Catalog */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Faculty of Tech */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Building2 className="text-indigo-600 h-5 w-5" />
                        <h4 className="font-bold text-slate-900 text-xs">School of Computing & Digital Tech</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-105">
                          <p className="font-bold text-[11px] text-slate-900">B.Sc Computer Science</p>
                          <div className="text-[9.5px] text-slate-500 mt-1 flex justify-between">
                            <span>Duration: 4 Years</span>
                            <span className="font-bold text-indigo-600">KES 65,000 / Sem</span>
                          </div>
                          <p className="text-[8.5px] italic text-slate-400 mt-1">Prerequisite: KCSE C+ min grade, Mathematics B- or above.</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-105">
                          <p className="font-bold text-[11px] text-slate-900">B.Sc Software Engineering</p>
                          <div className="text-[9.5px] text-slate-500 mt-1 flex justify-between">
                            <span>Duration: 4 Years</span>
                            <span className="font-bold text-indigo-600">KES 70,000 / Sem</span>
                          </div>
                          <p className="text-[8.5px] italic text-slate-400 mt-1">Prerequisite: KCSE C+ min grade, Physics C+.</p>
                        </div>
                      </div>
                    </div>

                    {/* Faculty of Business */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Landmark className="text-emerald-600 h-5 w-5" />
                        <h4 className="font-bold text-slate-900 text-xs">School of Business & Economics</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-105">
                          <p className="font-bold text-[11px] text-slate-900">B.Com Finance & Wealth</p>
                          <div className="text-[9.5px] text-slate-500 mt-1 flex justify-between">
                            <span>Duration: 4 Years</span>
                            <span className="font-bold text-emerald-600">KES 58,000 / Sem</span>
                          </div>
                          <p className="text-[8.5px] italic text-slate-400 mt-1">Prerequisite: KCSE C+ average, English B- or above.</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-105">
                          <p className="font-bold text-[11px] text-slate-900">BBA Business Administration</p>
                          <div className="text-[9.5px] text-slate-500 mt-1 flex justify-between">
                            <span>Duration: 4 Years</span>
                            <span className="font-bold text-emerald-600">KES 52,000 / Sem</span>
                          </div>
                          <p className="text-[8.5px] italic text-slate-400 mt-1">Prerequisite: KCSE C standard entry clearance.</p>
                        </div>
                      </div>
                    </div>

                    {/* Faculty of Law */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 md:col-span-2">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <FileText className="text-amber-500 h-5 w-5" />
                        <h4 className="font-bold text-slate-900 text-xs">School of Law & Social Jurisprudence</h4>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-105">
                        <p className="font-bold text-[11px] text-slate-900">Bachelor of Laws (LL.B)</p>
                        <div className="text-[9.5px] text-slate-500 mt-1 flex justify-between">
                          <span>Duration: 4 Years</span>
                          <span className="font-bold text-amber-600">KES 82,000 / Sem</span>
                        </div>
                        <p className="text-[8.5px] italic text-slate-400 mt-1">Prerequisite: KCSE grade B (Plain) average, Grade B+ in English / Kiswahili.</p>
                      </div>
                    </div>

                  </div>
               </div>
            )}

            {activeTab === 'admissions' && (
               <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  
                  {/* LEFT: STEP BY STEP APPLICATION FORM */}
                  <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-start">
                     <h3 className="text-sm font-black text-slate-900 border-b pb-2 mb-4">
                        Admissions Intake System Application Portal
                     </h3>

                     {applyStep === 1 && (
                       <div className="space-y-4">
                         <div className="flex gap-2 mb-2">
                           <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">1</div>
                           <h4 className="font-bold text-xs text-slate-800">Biographical Information</h4>
                         </div>
                         
                         <div className="space-y-3 text-[10px]">
                           <div>
                             <label className="block text-slate-500 mb-1">Applicant Full Name</label>
                             <input 
                               type="text" 
                               placeholder="e.g. John Doe"
                               value={appBioName}
                               onChange={e => setAppBioName(e.target.value)}
                               className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono"
                             />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3">
                             <div>
                               <label className="block text-slate-500 mb-1">Email Address</label>
                               <input 
                                 type="email" 
                                 placeholder="e.g. john@me.com"
                                 value={appBioEmail}
                                 onChange={e => setAppBioEmail(e.target.value)}
                                 className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono"
                               />
                             </div>
                             <div>
                               <label className="block text-slate-500 mb-1">Phone Number</label>
                               <input 
                                 type="text" 
                                 placeholder="e.g. +254 700 000"
                                 value={appBioPhone}
                                 onChange={e => setAppBioPhone(e.target.value)}
                                 className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono"
                               />
                             </div>
                           </div>
                         </div>

                         <button 
                           onClick={() => setApplyStep(2)}
                           disabled={!appBioName || !appBioEmail}
                           className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                         >
                           Continue to Program Catalog Selection <ArrowRight className="h-3.5 w-3.5" />
                         </button>
                       </div>
                     )}

                     {applyStep === 2 && (
                       <div className="space-y-4">
                         <div className="flex gap-2 mb-2">
                           <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">2</div>
                           <h4 className="font-bold text-xs text-slate-800">Choose Mapped Program Option</h4>
                         </div>

                         <div className="space-y-2 text-[10px]">
                           {[
                             'B.Sc Computer Science', 
                             'B.Sc Software Engineering', 
                             'B.Com Finance & Wealth', 
                             'Bachelor of Laws (LL.B)'
                           ].map(p => (
                             <label key={p} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${selectedProgram === p ? 'border-indigo-500 bg-indigo-50/50 font-bold' : 'border-slate-200'}`}>
                               <div className="flex items-center gap-2">
                                 <input 
                                   type="radio" 
                                   checked={selectedProgram === p} 
                                   onChange={() => setSelectedProgram(p)} 
                                   className="text-indigo-600"
                                 />
                                 <span>{p}</span>
                               </div>
                               <span className="text-[9px] text-slate-400 font-mono">4 Years term</span>
                             </label>
                           ))}
                         </div>

                         <div className="flex gap-2">
                           <button onClick={() => setApplyStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">Back</button>
                           <button onClick={() => setApplyStep(3)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">Next Step <ArrowRight className="h-3.5 w-3.5" /></button>
                         </div>
                       </div>
                     )}

                     {applyStep === 3 && (
                       <div className="space-y-4">
                         <div className="flex gap-2 mb-2">
                           <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">3</div>
                           <h4 className="font-bold text-xs text-slate-800">Support Documents Upload</h4>
                         </div>

                         <p className="text-[10px] text-slate-500">Please upload your high-school secondary certificate result transcripts (Simulated PDF upload accepts instant formats below).</p>

                         <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-500 transition relative">
                           <input 
                             type="file" 
                             onChange={handleMockFileUpload} 
                             className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                           <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                           <span className="text-[10.5px] font-bold text-indigo-650 block">Click or Drag Result Form Files Here</span>
                           <span className="text-[8px] text-slate-400 font-mono">Accepted standard PDF, JPEG inside browser</span>
                         </div>

                         {uploading && <div className="text-[9px] font-mono text-indigo-500 text-center animate-pulse">Uploading file sandbox...</div>}

                         {mockFiles.length > 0 && (
                           <div className="space-y-1 pt-2">
                             <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Attached Files</span>
                             {mockFiles.map((f, i) => (
                               <div key={i} className="flex justify-between items-center bg-slate-50 border p-2 rounded-lg text-[9px] font-mono">
                                 <span>{f}</span>
                                 <span className="text-emerald-600 font-bold">Attachment OK</span>
                               </div>
                             ))}
                           </div>
                         )}

                         <div className="flex gap-2">
                           <button onClick={() => setApplyStep(2)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition">Back</button>
                           <button onClick={() => setApplyStep(4)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 font-bold select-none">Admissions Checkout <ArrowRight className="h-3.5 w-3.5" /></button>
                         </div>
                       </div>
                     )}

                     {applyStep === 4 && (
                       <div className="space-y-4">
                         <div className="flex gap-2 mb-2">
                           <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">4</div>
                           <h4 className="font-bold text-xs text-slate-800">Admission Processing Fee Checkout</h4>
                         </div>

                         <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                           <div className="flex justify-between text-[11px] font-bold border-b pb-2">
                             <span>Processing Type:</span>
                             <span className="text-slate-700">Official Non-Refundable Form Fee</span>
                           </div>
                           <div className="flex justify-between text-xs font-extrabold text-slate-900 pt-1">
                             <span>TOTAL ADMISSION FEE:</span>
                             <span>KES 2,000</span>
                           </div>
                         </div>

                         <p className="text-[10px] text-slate-500">You must authorize a simulated test checkout of KES 2,000 to submit application references.</p>

                         <button 
                           onClick={handleSimulatePayment}
                           disabled={paying}
                           className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black tracking-widest transition flex items-center justify-center gap-2"
                         >
                           <CreditCard className="h-4 w-4" /> 
                           {paying ? 'AUTHORIZING SIMULATED PAYMENT DEPOSIT...' : 'AUTHORIZE KES 2,000 DEMO TRANSACTION'}
                         </button>

                         <button onClick={() => setApplyStep(3)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-650 py-1.5 rounded-xl text-[10px] font-bold transition">Back</button>
                       </div>
                     )}

                     {applyStep === 5 && (
                       <div className="space-y-4 text-center p-6 animate-fade-in">
                         <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                         <div>
                           <h4 className="font-black text-slate-900 text-sm">Application Submitted Successfully!</h4>
                           <p className="text-slate-500 text-[10px] mt-1">We have established your processing matriculation folder on the registry network.</p>
                         </div>

                         <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl max-w-sm mx-auto">
                           <span className="text-[9px] uppercase font-bold text-indigo-500 block">APPLICATION TRACKING REFERENCE</span>
                           <span className="font-mono text-indigo-700 font-extrabold text-sm block mt-1 tracking-widest">{generatedRefCode}</span>
                           <p className="text-[8.5px] mt-2 leading-relaxed text-indigo-705">
                             Copy this code to track your processing status dynamically on the tab to the right!
                           </p>
                         </div>

                         <button 
                           onClick={() => {
                             setApplyStep(1);
                             setAppBioName('');
                             setAppBioEmail('');
                             setAppBioPhone('');
                             setMockFiles([]);
                           }} 
                           className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] rounded-lg transition"
                         >
                           Submit Another Application
                         </button>
                       </div>
                     )}

                  </div>

                  {/* RIGHT: REAL-TIME TRACK APPLICATION STATUS */}
                  <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-start">
                     <h3 className="text-sm font-black text-indigo-900 mb-1">
                        Track Application Status
                     </h3>
                     <p className="text-[10px] text-slate-500 border-b pb-2 mb-4 leading-relaxed">
                        Enter your tracking credential to access status audits and letter downloads.
                     </p>

                     <form onSubmit={handleTrackLookup} className="space-y-3">
                       <div className="space-y-1.5 text-[10px]">
                         <label className="text-slate-550 font-bold block uppercase tracking-wide">Tracking Code</label>
                         <div className="flex gap-2">
                           <input 
                             type="text" 
                             required
                             placeholder="e.g. APP-2026-000101"
                             value={trackCode}
                             onChange={e => setTrackCode(e.target.value)}
                             className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono font-bold uppercase tracking-wider"
                           />
                           <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 font-semibold rounded-lg text-[10px] uppercase font-mono tracking-wider transition">Look Up</button>
                         </div>
                       </div>
                     </form>

                     {trackSearched && (
                       <div className="mt-4 border border-indigo-100 rounded-2xl p-4 bg-indigo-50/20 animate-fade-in text-[10.5px]">
                         {trackedApp ? (
                           <div className="space-y-3.5">
                             <div className="flex justify-between items-center border-b pb-1.5">
                               <span className="font-bold text-slate-800">{trackedApp.name}</span>
                               <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                                 trackedApp.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                                 trackedApp.status === 'UNDER_REVIEW' ? 'bg-amber-500 text-white animate-pulse' : 'bg-blue-500 text-white'
                               }`}>
                                 {trackedApp.status}
                               </span>
                             </div>

                             <div className="space-y-1 text-[10.5px]">
                               <div className="flex justify-between font-mono">
                                 <span className="text-slate-400">Program:</span>
                                 <span className="font-bold text-slate-800">{trackedApp.program}</span>
                               </div>
                               <div className="flex justify-between font-mono">
                                 <span className="text-slate-400">Date Log:</span>
                                 <span className="text-slate-600">{trackedApp.submittedOn}</span>
                               </div>
                               <div className="flex justify-between font-mono pb-1 border-b">
                                 <span className="text-slate-400">Documents Verification:</span>
                                 <span className="font-bold text-emerald-600">{trackedApp.uploadedDocsCount} Attachments Verified</span>
                               </div>
                             </div>

                             {trackedApp.status === 'APPROVED' ? (
                               <div className="pt-2 text-center">
                                 <p className="text-[10px] text-emerald-600 font-bold mb-2">Congratulations! Your Admission has been approved</p>
                                 <button 
                                   onClick={() => {
                                     alert(`Redirecting to secure PDF generator... Opening Admission Letter for tracking key: ${trackedApp.refCode}`);
                                     setActiveTab('verification');
                                     setVerifyCode(`SCX-ADM-2026-000123`);
                                   }}
                                   className="w-full bg-slate-900 text-white font-mono font-bold text-[9px] uppercase tracking-wider py-2 rounded-lg hover:bg-slate-800 transition shadow-md"
                                 >
                                   Download Letter of Admission
                                 </button>
                               </div>
                             ) : (
                               <p className="text-[9px] italic text-slate-400 text-center">
                                 Your application is currently being evaluated. Academic officers will updates this workspace.
                               </p>
                             )}
                           </div>
                         ) : (
                           <div className="text-center p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                             <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-1" />
                             <p className="font-bold text-rose-800 text-[10px]">Reference Code Not Found</p>
                             <p className="text-[8.5px] text-rose-600 mt-1">Could not locate matching application files. Verify syntax.</p>
                           </div>
                         )}
                       </div>
                     )}

                     {/* Preseed references help box */}
                     <div className="mt-4 bg-slate-50 border p-3 rounded-2xl text-[9px]">
                       <span className="font-mono text-slate-400 uppercase font-black tracking-widest block mb-1.5">Preloaded Admissions Tracker IDs</span>
                       <div className="space-y-1 font-mono text-slate-600">
                         <div onClick={() => setTrackCode('APP-2026-000101')} className="flex justify-between underline cursor-pointer hover:text-indigo-600"><span>1. John (Approved CS):</span><span>APP-2026-000101</span></div>
                         <div onClick={() => setTrackCode('APP-2026-000202')} className="flex justify-between underline cursor-pointer hover:text-indigo-600"><span>2. Alice (Law Review):</span><span>APP-2026-000202</span></div>
                       </div>
                     </div>
                  </div>

               </div>
            )}
            
            {activeTab === 'news' && (
               <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-6">
                  <h3 className="text-2xl font-bold font-serif text-slate-800 border-b pb-2 mb-2">Campus News & Announcements</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                     <div className="bg-white border text-left border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition hover:shadow-md">
                        <div className="h-36 bg-indigo-950 flex flex-col items-center justify-center text-indigo-400 p-4 shrink-0 text-center relative overflow-hidden">
                           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                           <FileText className="h-10 w-10 mb-1" />
                           <span className="text-[8px] font-mono tracking-widest uppercase">OFFICIAL COMMUNIQUE</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                           <div>
                              <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-widest"><Calendar className="h-3 w-3 inline mr-1 -mt-0.5" /> 16 November 2026</span>
                              <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">55th Graduation Commencement Details Confirmed Online</h4>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">Registry confirms all clearance letters must utilize custom Phase 11.7 cryptographic barcodes.</p>
                           </div>
                           <span className="text-[9px] text-indigo-600 font-bold uppercase mt-3 inline-block">Read Posting →</span>
                        </div>
                     </div>

                     <div className="bg-white border text-left border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition hover:shadow-md">
                        <div className="h-36 bg-slate-900 shrink-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center relative">
                           <Globe className="h-10 w-10 mb-1 text-emerald-400 animate-spin" style={{ animationDuration: '20s' }} />
                           <span className="text-[8px] font-mono tracking-widest uppercase text-slate-400">INNOVATION EXPANSION</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                           <div>
                              <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-widest"><Calendar className="h-3 w-3 inline mr-1 -mt-0.5" /> 12 October 2026</span>
                              <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">Multi-Tenant Governance Engine Launches</h4>
                              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">Our university adopts the SCC software framework syncing departments and finance models.</p>
                           </div>
                           <span className="text-[9px] text-indigo-600 font-bold uppercase mt-3 inline-block">Read Posting →</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'verification' && (
               <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
                  <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg mx-auto space-y-6">
                     <div className="text-center">
                       <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                       <h3 className="font-extrabold text-slate-900 text-sm">Graduates & Credentials Verification Portal</h3>
                       <p className="text-slate-550 text-[10px] mt-1 max-w-sm mx-auto">
                         Employers can instantly find and verify graduation transcripts or valid admission letters generated inside the SCC document engine.
                       </p>
                     </div>

                     <form onSubmit={handleEmployerVerify} className="space-y-4">
                       <div className="text-left">
                         <label className="text-[9px] uppercase font-mono font-bold text-slate-400 block mb-1">
                           Document Certificate Code
                         </label>
                         <div className="flex gap-2">
                           <input
                             type="text"
                             required
                             placeholder="e.g. SCX-TRN-2026-000456"
                             value={verifyCode}
                             onChange={e => setVerifyCode(e.target.value)}
                             className="flex-1 bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono font-bold tracking-wider"
                           />
                           <button
                             type="submit"
                             className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold font-mono transition"
                           >
                             Verify Code
                           </button>
                         </div>
                       </div>
                     </form>

                     {employerVerifySearched && (
                       <div className="text-left border border-indigo-100 rounded-2xl p-4 bg-indigo-50/10 animate-fade-in">
                         {verificationResult ? (
                           <div className="space-y-3.5">
                             <div className="flex justify-between items-center text-[10.5px] pb-2 border-b border-indigo-100/50">
                               <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                 <BadgeCheck className="h-4 w-4 text-emerald-600 animate-bounce" /> CERTIFIED UNIVERSITY RECORD
                               </span>
                               <span className="text-[8px] text-slate-400 font-mono">Issued: {verificationResult.issuedOn}</span>
                             </div>

                             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px]">
                               <div>
                                 <span className="text-slate-400 block">GRADUATED/HOLDER:</span>
                                 <span className="font-bold text-slate-800 text-[11px]">{verificationResult.studentName}</span>
                               </div>
                               <div>
                                 <span className="text-slate-400 block">REG NUMBER:</span>
                                 <span className="font-mono text-slate-800 bg-slate-50 border px-1 rounded">{verificationResult.admissionNo}</span>
                               </div>
                               <div>
                                 <span className="text-slate-400 block">PROGRAM COMPLETED:</span>
                                 <span className="font-bold text-indigo-705">{verificationResult.program}</span>
                               </div>
                               <div>
                                 <span className="text-slate-400 block">FINAL GPA:</span>
                                 <span className="font-bold text-emerald-600 font-mono text-[11px]">{verificationResult.gpa}</span>
                               </div>
                               <div className="col-span-2 border-t pt-2 mt-1">
                                 <span className="text-slate-400 block">SECURE CREDENTIAL STATUS:</span>
                                 <span className="font-bold text-indigo-700 uppercase">{verificationResult.docType} Validated</span>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="text-center p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1.5">
                             <AlertCircle className="h-6 w-6 text-rose-505 mx-auto text-rose-500" />
                             <p className="font-extrabold text-rose-800 text-[10px]">VERIFICATION FAILED (RECORD NOT FOUND)</p>
                             <p className="text-[8.5px] text-rose-600 max-w-sm mx-auto leading-relaxed">
                               The cryptographic fingerprint entered does not point to any registered university credentials. Verify syntax.
                             </p>
                           </div>
                         )}
                       </div>
                     )}

                     {/* Help guidelines */}
                     <div className="bg-slate-50 rounded-xl p-3 text-[9px] text-left border">
                       <span className="text-slate-450 font-bold block uppercase tracking-wider mb-1">Preloaded Verification Keys</span>
                       <ul className="list-disc pl-3 space-y-1 text-slate-600">
                         <li onClick={() => setVerifyCode('SCX-ADM-2026-000123')} className="cursor-pointer underline hover:text-indigo-650">John Doe CS: <span className="font-mono font-bold">SCX-ADM-2026-000123</span></li>
                         <li onClick={() => setVerifyCode('SCX-TRN-2026-000456')} className="cursor-pointer underline hover:text-indigo-650">Alice Wambui Law: <span className="font-mono font-bold">SCX-TRN-2026-000456</span></li>
                         <li onClick={() => setVerifyCode('SCX-CRT-2026-000789')} className="cursor-pointer underline hover:text-indigo-650">Kevin Kioko Finance: <span className="font-mono font-bold">SCX-CRT-2026-000789</span></li>
                       </ul>
                     </div>
                  </div>
               </div>
            )}

            {/* Footer */}
            <div className="mt-12 bg-slate-950 text-slate-500 text-[10px] p-6 text-center shrink-0">
               <div className="flex justify-center gap-4 mb-4">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +254 700 000 000</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> info@smartcampus.edu</span>
               </div>
               <p>Powered by SmartCampusConnect X • Phase 11.9 Admissions & Public Portal</p>
            </div>
         </div>
      </div>
   );
}
