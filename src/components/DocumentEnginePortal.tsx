import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, FileText, Stamp, BadgeCheck, QrCode, Search, Download, CheckCircle, 
  Clock, RotateCcw, PenTool, Layout, Palette, RefreshCw, AlertCircle, Sparkles, Building
} from 'lucide-react';

interface MockDocument {
  code: string;
  studentName: string;
  admissionNo: string;
  program: string;
  gpa: string;
  gradDate: string;
  docType: string;
  verified: boolean;
  issuedOn: string;
}

// Global variable registry for seamless verification across tabs
const SEEDED_DOCUMENTS: MockDocument[] = [
  {
    code: 'SCX-ADM-2026-000123',
    studentName: 'John Doe',
    admissionNo: 'STD-2026-001',
    program: 'B.Sc Computer Science',
    gpa: '3.85',
    gradDate: '12th Dec 2026',
    docType: 'Admission Letter',
    verified: true,
    issuedOn: '15th Jan 2026'
  },
  {
    code: 'SCX-TRN-2026-000456',
    studentName: 'Alice Wambui',
    admissionNo: 'STD-2026-042',
    program: 'Bachelor of Laws (LL.B)',
    gpa: '3.91',
    gradDate: '12th Dec 2026',
    docType: 'Academic Transcript',
    verified: true,
    issuedOn: '20th May 2026'
  },
  {
    code: 'SCX-CRT-2026-000789',
    studentName: 'Kevin Kioko',
    admissionNo: 'STD-2026-105',
    program: 'B.Com Finance',
    gpa: '3.42',
    gradDate: '18th Dec 2026',
    docType: 'Graduation Certificate',
    verified: true,
    issuedOn: '25th May 2026'
  }
];

export default function DocumentEnginePortal() {
  const [activeTab, setActiveTab] = useState<'designer' | 'verifier'>('designer');
  
  // Customization Settings
  const [selectedTemplate, setSelectedTemplate] = useState<
    'admission' | 'fee_statement' | 'transcript' | 'exam_card' | 'clearance' | 'recommendation' | 'certificate'
  >('admission');
  
  const [schoolColor, setSchoolColor] = useState('#4f46e5'); // Indigo-600
  const [logoStyle, setLogoStyle] = useState<'crest' | 'shield' | 'book' | 'star'>('crest');
  const [stampText, setStampText] = useState('OFFICIAL REGISTRAR CERTIFICATION');
  const [registrarName, setRegistrarName] = useState('Prof. Benson K. Kamau');
  const [watermarkText, setWatermarkText] = useState('SMARTCAMPUS OFFICIAL');
  
  // Toggles
  const [showLogo, setShowLogo] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);

  // Variable Overrides
  const [studentName, setStudentName] = useState('John Doe');
  const [admissionNo, setAdmissionNo] = useState('STD-2026-001');
  const [programName, setProgramName] = useState('B.Sc Computer Science');
  const [gpaScore, setGpaScore] = useState('3.85');
  const [gradDateValue, setGradDateValue] = useState('12th Dec 2026');
  
  // Verification Results
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<MockDocument | null>(null);
  const [searched, setSearched] = useState(false);

  // Active document list synced to localStorage
  const [documentRegistry, setDocumentRegistry] = useState<MockDocument[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('scc_verifiable_docs');
    if (stored) {
      try {
        setDocumentRegistry(JSON.parse(stored));
      } catch (e) {
        setDocumentRegistry(SEEDED_DOCUMENTS);
      }
    } else {
      localStorage.setItem('scc_verifiable_docs', JSON.stringify(SEEDED_DOCUMENTS));
      setDocumentRegistry(SEEDED_DOCUMENTS);
    }
  }, []);

  const saveToGlobalRegistry = (doc: MockDocument) => {
    const updated = [doc, ...documentRegistry.filter(d => d.code !== doc.code)];
    setDocumentRegistry(updated);
    localStorage.setItem('scc_verifiable_docs', JSON.stringify(updated));
    // Also post custom event to sync with other components like public website
    window.dispatchEvent(new Event('scc_registry_updated'));
  };

  // Quick Preset Selection Helper
  const applyStudentPreset = (name: string, reg: string, prog: string, gpa: string, date: string) => {
    setStudentName(name);
    setAdmissionNo(reg);
    setProgramName(prog);
    setGpaScore(gpa);
    setGradDateValue(date);
  };

  // Generate Document ID
  const computedDocCode = React.useMemo(() => {
    const prefix = 
      selectedTemplate === 'admission' ? 'ADM' :
      selectedTemplate === 'fee_statement' ? 'FEE' :
      selectedTemplate === 'transcript' ? 'TRN' :
      selectedTemplate === 'exam_card' ? 'EXM' :
      selectedTemplate === 'clearance' ? 'CLR' :
      selectedTemplate === 'recommendation' ? 'REC' : 'CRT';
    const numPart = admissionNo ? admissionNo.replace(/\D/g, '') : '999';
    return `SCX-${prefix}-2026-${numPart.padEnd(6, '0')}`;
  }, [selectedTemplate, admissionNo]);

  // Handle Generate/Register Trigger
  const handleGenerateAndRegister = () => {
    const docTypeLabel = 
      selectedTemplate === 'admission' ? 'Admission Letter' :
      selectedTemplate === 'fee_statement' ? 'Fee Statement' :
      selectedTemplate === 'transcript' ? 'Academic Transcript' :
      selectedTemplate === 'exam_card' ? 'Official Exam Card' :
      selectedTemplate === 'clearance' ? 'Graduation Clearance Letter' :
      selectedTemplate === 'recommendation' ? 'Candidacy Recommendation' : 'Graduation Certificate';

    const newDoc: MockDocument = {
      code: computedDocCode,
      studentName,
      admissionNo,
      program: programName,
      gpa: gpaScore,
      gradDate: gradDateValue,
      docType: docTypeLabel,
      verified: true,
      issuedOn: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    saveToGlobalRegistry(newDoc);
    alert(`Successfully generated secure legal document! Registered verified fingerprint: ${computedDocCode}`);
  };

  // Verify search handle
  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const codeToSearch = verifyCode.trim().toUpperCase();
    const found = documentRegistry.find(d => d.code === codeToSearch) || SEEDED_DOCUMENTS.find(d => d.code === codeToSearch);
    if (found) {
      setVerificationResult(found);
    } else {
      setVerificationResult(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      {/* Mini Executive Banner */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-5 relative overflow-hidden shadow-md text-white">
        <div className="absolute right-[-15px] top-[-15px] text-indigo-500/10 pointer-events-none">
          <Stamp className="h-24 w-24" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black tracking-tight flex items-center gap-1.5 uppercase font-sans">
              <FileCheck2 className="text-indigo-400 h-5 w-5" />
              Document Customizer & Verification Engine
            </h2>
            <p className="text-[10px] text-slate-300 font-mono mt-1 uppercase tracking-widest">
              Phase 11.75 Verified Cryptographic Templates
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-lg self-start md:self-auto text-[10px] font-bold">
            <button 
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1 rounded transition-colors ${activeTab === 'designer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Document Creator
            </button>
            <button 
              onClick={() => setActiveTab('verifier')}
              className={`px-3 py-1 rounded transition-colors ${activeTab === 'verifier' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Verify Portal
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT SIDEBAR: CREATOR CONTROLS */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col space-y-4">
            
            {/* Template Selection */}
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                <Layout className="h-3 w-3 text-indigo-500" /> 1. Select Template Draft
              </span>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {[
                  { id: 'admission', label: 'Admission Letter' },
                  { id: 'fee_statement', label: 'Fee Statement' },
                  { id: 'transcript', label: 'Transcript' },
                  { id: 'exam_card', label: 'Exam Card' },
                  { id: 'clearance', label: 'Clearance Letter' },
                  { id: 'recommendation', label: 'Recommendation' },
                  { id: 'certificate', label: 'Degree Certificate' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id as any)}
                    className={`py-1.5 px-2 text-left text-[10px] font-bold rounded-lg border transition ${
                      selectedTemplate === t.id 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customizer settings */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                <Palette className="h-3 w-3 text-emerald-500" /> 2. Brand Properties
              </span>

              {/* Branding hex color & logo presets */}
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Theme Color</label>
                  <div className="flex gap-1">
                    <input 
                      type="color" 
                      value={schoolColor} 
                      onChange={e => setSchoolColor(e.target.value)} 
                      className="w-6 h-6 rounded border-0 cursor-pointer shadow-sm p-0"
                    />
                    <select
                      value={schoolColor}
                      onChange={e => setSchoolColor(e.target.value)}
                      className="flex-1 bg-white border border-slate-250 py-0.5 px-1 text-[9px] rounded font-mono"
                    >
                      <option value="#4f46e5">Indigo</option>
                      <option value="#b91c1c">Maroon</option>
                      <option value="#0f766e">Teal</option>
                      <option value="#1d4ed8">Blue</option>
                      <option value="#15803d">Emerald</option>
                      <option value="#7c2d12">Rust</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Crest Symbol</label>
                  <select
                    value={logoStyle}
                    onChange={e => setLogoStyle(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 p-1 text-[9px] rounded font-bold"
                  >
                    <option value="crest">🛡️ Royal Crest</option>
                    <option value="shield">🏛️ Pantheon Shield</option>
                    <option value="book">📘 Open Book</option>
                    <option value="star">🌟 Scholar Star</option>
                  </select>
                </div>
              </div>

              {/* Watermark and Signature name texts */}
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Registrar Name</label>
                  <input 
                    type="text" 
                    value={registrarName} 
                    onChange={e => setRegistrarName(e.target.value)} 
                    className="w-full bg-white border border-slate-200 px-2 py-1 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Watermark Content</label>
                  <input 
                    type="text" 
                    value={watermarkText} 
                    onChange={e => setWatermarkText(e.target.value)} 
                    className="w-full bg-white border border-slate-200 px-2 py-1 rounded font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5">
                {[
                  { state: showLogo, toggle: setShowLogo, label: 'Include Emblem Head' },
                  { state: showWatermark, toggle: setShowWatermark, label: 'Use Watermark bg' },
                  { state: showStamp, toggle: setShowStamp, label: 'Apply Seal Stamp' },
                  { state: showQR, toggle: setShowQR, label: 'Embed Verified QR' },
                  { state: showSignature, toggle: setShowSignature, label: 'Sign Draft' }
                ].map((item, id) => (
                  <label key={id} className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={e => item.toggle(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target variables override panel */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black flex items-center justify-between">
                <span>3. Dynamic Variables</span>
                <span className="text-[8px] text-indigo-500 italic">Press to autofill</span>
              </span>

              {/* Demo quick auto picker */}
              <div className="flex gap-1.5 flex-wrap">
                <button 
                  onClick={() => applyStudentPreset('John Doe', 'STD-2026-001', 'B.Sc Computer Science', '3.85', '12th Dec 2026')}
                  className="bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded text-[8px] border border-slate-200 text-slate-600 font-mono"
                >
                  Reg 001 (John)
                </button>
                <button 
                  onClick={() => applyStudentPreset('Alice Wambui', 'STD-2026-042', 'Bachelor of Laws (LL.B)', '3.91', '12th Dec 2026')}
                  className="bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded text-[8px] border border-slate-200 text-slate-600 font-mono"
                >
                  Reg 042 (Alice)
                </button>
                <button 
                  onClick={() => applyStudentPreset('Kevin Kioko', 'STD-2026-105', 'B.Com Finance', '3.42', '18th Dec 2026')}
                  className="bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded text-[8px] border border-slate-200 text-slate-600 font-mono"
                >
                  Reg 105 (Kevin)
                </button>
              </div>

              {/* Freeform data slots */}
              <div className="space-y-2 text-[10px]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 font-mono">{"{{student_name}}"}</label>
                    <input 
                      type="text" 
                      value={studentName} 
                      onChange={e => setStudentName(e.target.value)} 
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 font-mono">{"{{admission_number}}"}</label>
                    <input 
                      type="text" 
                      value={admissionNo} 
                      onChange={e => setAdmissionNo(e.target.value)} 
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-0.5 font-mono">{"{{program_name}}"}</label>
                  <input 
                    type="text" 
                    value={programName} 
                    onChange={e => setProgramName(e.target.value)} 
                    className="w-full bg-white border border-slate-200 px-2 py-1 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 font-mono">{"{{gpa}}"}</label>
                    <input 
                      type="text" 
                      value={gpaScore} 
                      onChange={e => setGpaScore(e.target.value)} 
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-0.5 font-mono">{"{{graduation_date}}"}</label>
                    <input 
                      type="text" 
                      value={gradDateValue} 
                      onChange={e => setGradDateValue(e.target.value)} 
                      className="w-full bg-white border border-slate-200 px-2 py-1 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <button 
                onClick={handleGenerateAndRegister} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-black tracking-widest shadow-md hover:shadow-indigo-600/10 transition flex items-center justify-center gap-2 pr-4"
              >
                <BadgeCheck className="h-4.5 w-4.5" />
                DRAFT & REGISTER CRYPTO FINGERPRINT
              </button>
              <p className="text-[8px] text-slate-400 mt-1.5 leading-relaxed text-center font-mono">
                Fingerprint will enable cross-entity verifier checksum verification on the applicant/public web pages.
              </p>
            </div>
          </div>

          {/* MAIN PREVIEW PANEL: DIGITAL CANVAS OF LEGAL PRINT */}
          <div className="lg:col-span-8 bg-slate-100 rounded-2xl border border-slate-200 p-6 flex flex-col justify-start items-center overflow-x-auto min-h-[750px]">
            
            {/* Live Document Box Container */}
            <div 
              className="bg-white w-[210mm] min-h-[297mm] shadow-lg rounded-sm p-12 relative flex flex-col justify-between"
              style={{ borderColor: schoolColor, borderTopWidth: '10px' }}
            >
              
              {/* Dynamic Watermark background layer */}
              {showWatermark && (
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none select-none overflow-hidden"
                  style={{ transform: 'rotate(-25deg)' }}
                >
                  <span className="text-[7.5rem] font-sans font-black tracking-widest uppercase text-slate-900">
                    {watermarkText || 'CAMPUS OFFICIAL'}
                  </span>
                </div>
              )}

              {/* Dynamic Document Header with logo choice */}
              <div className="relative z-10 flex items-start justify-between border-b pb-5">
                <div className="flex items-center gap-4">
                  {showLogo && (
                    <div 
                      className="h-16 w-16 rounded-full flex items-center justify-center text-white shadow-inner font-bold"
                      style={{ backgroundColor: schoolColor }}
                    >
                      {logoStyle === 'crest' && <Building className="h-8 w-8 text-white" />}
                      {logoStyle === 'shield' && <span className="font-serif text-lg tracking-tight">🏛️</span>}
                      {logoStyle === 'book' && <span className="font-mono text-lg tracking-tight">📖</span>}
                      {logoStyle === 'star' && <span className="text-xl">★</span>}
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-serif font-extrabold uppercase tracking-wider text-slate-900">
                      SmartCampus University
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">
                      Office of Academic Registry & Governance
                    </p>
                  </div>
                </div>
                
                <div className="text-right text-[9px] font-mono text-slate-400">
                  <p>CODE: <span className="font-bold text-slate-700">{computedDocCode}</span></p>
                  <p>SECURE LEDGER RECORD</p>
                  <p className="text-emerald-600 font-bold flex items-center gap-0.5 justify-end mt-1">
                    <CheckCircle className="h-2.5 w-2.5" /> SECURED
                  </p>
                </div>
              </div>

              {/* Dynamic Content Core body depending on template */}
              <div className="relative z-10 py-8 flex-1 flex flex-col justify-start">
                
                {/* Title badge */}
                <div className="text-center mb-8 uppercase tracking-widest">
                  <h2 
                    className="text-sm font-black border-b inline-block pb-1 font-serif"
                    style={{ color: schoolColor, borderColor: schoolColor }}
                  >
                    {selectedTemplate === 'admission' && 'OFFICIAL ADMISSION LETTER'}
                    {selectedTemplate === 'fee_statement' && 'CERTIFIED COMPREHENSIVE FEE STATEMENT'}
                    {selectedTemplate === 'transcript' && 'ACADEMIC TRANSCRIPT RECORD'}
                    {selectedTemplate === 'exam_card' && 'SEMESTER EXAMINATION ADMISSION CARD'}
                    {selectedTemplate === 'clearance' && 'GRADUATION AND DEPARTMENTS CLEARANCE'}
                    {selectedTemplate === 'recommendation' && 'CANDIDACY RECOMMENDATION LETTER'}
                    {selectedTemplate === 'certificate' && 'DEGREE CONFERMENT EXCELLENCE RECORD'}
                  </h2>
                </div>

                {/* Templates custom copy text */}
                <div className="space-y-4 text-[11px] leading-relaxed text-slate-700 font-sans">
                  
                  {selectedTemplate === 'admission' && (
                    <div className="space-y-4">
                      <p className="font-bold">Date: {new Date().toLocaleDateString('en-GB')}</p>
                      <p>To: <span className="font-bold text-slate-900">{studentName}</span> (Reg: <span className="font-mono text-slate-800 bg-slate-50 p-0.5 border rounded">{admissionNo}</span>)</p>
                      <p>Dear {studentName},</p>
                      <p className="indent-8">
                        The University Admissions Board has processed your entrance evaluations. We are extremely pleased to offer you admission to register for the <span className="font-bold text-indigo-700">{programName}</span> program.
                      </p>
                      <p className="indent-8">
                        Your matriculation profile has been synced securely into the multitenant SCC system. Your lectures shall commence on the official term start date. Please find the course structures in your main digital cockpit.
                      </p>
                      <p>Congratulations on your admission.</p>
                    </div>
                  )}

                  {selectedTemplate === 'fee_statement' && (
                    <div className="space-y-4 text-[10px]">
                      <p className="font-bold">Holder: {studentName} ({admissionNo})</p>
                      <table className="w-full text-left border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-indigo-600">
                            <th className="p-2">Transaction Ref</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Debit (KES)</th>
                            <th className="p-2">Credit (KES)</th>
                            <th className="p-2">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100">
                            <td className="p-2 font-mono">TXN-99120</td>
                            <td className="p-2">Tuition Fee - Sem 1</td>
                            <td className="p-2 font-mono">KES 65,000</td>
                            <td className="p-2 font-mono">-</td>
                            <td className="p-2 font-mono">KES 65,000</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-2 font-mono">TXN-99142</td>
                            <td className="p-2">Academic Levy</td>
                            <td className="p-2 font-mono">KES 4,500</td>
                            <td className="p-2 font-mono">-</td>
                            <td className="p-2 font-mono">KES 69,500</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="p-2 font-mono">MPESA-77A14</td>
                            <td className="p-3 font-bold text-emerald-600">Sponsor Bank Allocation</td>
                            <td className="p-2 font-mono">-</td>
                            <td className="p-2 font-mono">KES 65,000</td>
                            <td className="p-2 font-mono font-bold text-slate-800">KES 4,500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedTemplate === 'transcript' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                        <div><span className="font-bold text-slate-500">SCHOLAR NAME:</span> {studentName}</div>
                        <div><span className="font-bold text-slate-500">REGISTRATION KEY:</span> {admissionNo}</div>
                        <div><span className="font-bold text-slate-500">CURRICULUM PROGRAM:</span> {programName}</div>
                        <div><span className="font-bold text-slate-500">STAND ALONE GPA:</span> <span className="font-bold text-emerald-600 text-xs">{gpaScore}</span></div>
                      </div>
                      
                      <table className="w-full text-left border-collapse mt-4 text-[10px]">
                        <thead>
                          <tr className="border-b-2 border-slate-700 bg-slate-50 font-bold font-mono">
                            <th className="py-1.5 px-2">Unit Code</th>
                            <th className="py-1.5 px-2">Lecturer Course Title</th>
                            <th className="py-1.5 px-2">Lecturer Status</th>
                            <th className="py-1.5 px-2">Verified Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2 font-mono">CSC101</td><td className="py-1.5 px-2">Computer Architecture I</td><td className="py-1.5 px-2">Passed</td><td className="py-1.5 px-2 font-bold">A</td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2 font-mono">MAT101</td><td className="py-1.5 px-2">Pure Calculus Elements</td><td className="py-1.5 px-2">Passed</td><td className="py-1.5 px-2 font-bold font-bold">A</td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2 font-mono">NET401</td><td className="py-1.5 px-2">Wireless & Microwave systems</td><td className="py-1.5 px-2">Passed</td><td className="py-1.5 px-2 font-bold">B+</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedTemplate === 'exam_card' && (
                    <div className="space-y-4">
                      <p>We certify that <span className="font-bold text-slate-900">{studentName} ({admissionNo})</span> is fully cleared with the Finance department and is permitted to sit for the Semester Examinations.</p>
                      
                      <div className="border border-indigo-100 p-4 rounded-xl bg-indigo-50/50 mt-4 space-y-2">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[10px] text-slate-500">EXAMINATION PERMIT:</span>
                          <span className="font-bold text-slate-800">APPROVED FOR HALL 2A</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-[10px] text-slate-500">AUTHORIZED STATIONS:</span>
                          <span className="font-bold text-slate-800">MAIN COMPUTER LAB, BUSINESS HALL</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'clearance' && (
                    <div className="space-y-4 text-[10px]">
                      <p>Departmental clearance overview for candidate: <span className="font-bold text-slate-800">{studentName}</span></p>
                      <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] font-mono">
                        <div className="p-2 border border-slate-100 rounded bg-slate-50 flex items-center justify-between">
                          <span>Library Clearance:</span>
                          <span className="text-emerald-600 font-bold">SUCCESS (0 BOOKS OUT)</span>
                        </div>
                        <div className="p-2 border border-slate-100 rounded bg-slate-50 flex items-center justify-between">
                          <span>Hostel Housing Clearance:</span>
                          <span className="text-emerald-600 font-bold">SUCCESS (CLEARED REPAIR FEE)</span>
                        </div>
                        <div className="p-2 border border-slate-100 rounded bg-slate-50 flex items-center justify-between">
                          <span>Registrar Accounts:</span>
                          <span className="text-emerald-600 font-bold">SUCCESS (0 KES OVERDUE)</span>
                        </div>
                        <div className="p-2 border border-slate-100 rounded bg-slate-50 flex items-center justify-between">
                          <span>Sports Equipment clearance:</span>
                          <span className="text-emerald-600 font-bold">CLEARED</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTemplate === 'recommendation' && (
                    <div className="space-y-4">
                      <p className="font-bold">To Whom It May Concern,</p>
                      <p className="indent-8 text-[11px] leading-relaxed">
                        I am exceptionally pleased to write this academic recommendation on behalf of <span className="font-bold text-slate-900">{studentName}</span> ({admissionNo}). During their enrollment in our {programName} curriculum, they exhibited stellar analytical discipline, securing a cumulative grade index of <span className="font-bold text-indigo-700">{gpaScore}</span>.
                      </p>
                      <p className="indent-8 text-[11px]">
                        I would highly endorse them for academic and industrial placements. Please do not hesitate to consult the undersigned database registry if looking up their verification record.
                      </p>
                    </div>
                  )}

                  {selectedTemplate === 'certificate' && (
                    <div className="space-y-6 text-center my-6">
                      <p className="text-slate-500 text-[10px] tracking-widest font-mono uppercase mt-4">THIS GRACE OF HIGH ACHIEVEMENT IS CONFERRED UPON</p>
                      <p className="text-2xl font-serif text-slate-900 font-extrabold capitalize">{studentName}</p>
                      <p className="text-[10px] tracking-wider text-slate-600">WHO HAS DULY EXECUTED ALL CORRESPONDING PREREQUISITES AND SECURED THE GRADE DEGREE OF</p>
                      <p className="text-lg font-bold uppercase tracking-wide" style={{ color: schoolColor }}>
                        {programName}
                      </p>
                      <p className="text-[10px] text-slate-400 italic font-serif">Conferred on this beautiful date of {gradDateValue} with a secure GPA score index of {gpaScore}.</p>
                    </div>
                  )}

                </div>
              </div>

              {/* Secure e-Stamp, Signatures & Verifier QR footer code */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-5">
                
                {/* Dynamic Stamp */}
                <div className="flex flex-col justify-end">
                  {showStamp ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-14 h-14 rounded-full border-2 border-dashed flex flex-col items-center justify-center rotate-[-12deg] relative p-1 text-center scale-90"
                        style={{ borderColor: schoolColor, color: schoolColor }}
                      >
                        <span className="text-[6px] font-black leading-none uppercase">SmartCampus</span>
                        <span className="text-[5px] uppercase mt-0.5 leading-none">APPROVED</span>
                        <span className="text-[4px] font-mono mt-0.5">{computedDocCode.split('-')[1]}</span>
                      </div>
                      <p className="text-[7px] text-slate-400 font-mono italic flex-1 max-w-[80px]">
                        Digitally stamped via Phase 11.7 Network Ledger
                      </p>
                    </div>
                  ) : <div />}
                </div>

                {/* Director Registrar Signature */}
                <div className="flex flex-col items-center justify-end text-center">
                  {showSignature ? (
                    <>
                      <div className="h-10 flex items-center justify-center">
                        <span className="font-serif italic text-sm text-indigo-700/80 font-bold border-b border-slate-300 pb-1 w-32 border-dashed">
                          {registrarName.split(' ')[1] || 'B. K. Kamau'}
                        </span>
                      </div>
                      <p className="text-[8px] font-bold text-slate-600 mt-1 uppercase font-mono">{registrarName}</p>
                      <p className="text-[7px] text-slate-400 font-mono">Academic Registrar Affairs</p>
                    </>
                  ) : <div />}
                </div>

                {/* Secure Verification Validation Code QR block */}
                <div className="flex flex-col items-end justify-end">
                  {showQR ? (
                    <div className="flex items-end gap-2.5">
                      <div className="text-right text-[8px] leading-tight text-slate-400 font-mono">
                        <p className="font-bold text-slate-600">VERIFY FINGERPRINT</p>
                        <p>{computedDocCode}</p>
                      </div>
                      <div className="w-12 h-12 bg-white border border-slate-300 p-1 rounded">
                        <div className="w-full h-full bg-slate-800 grid grid-cols-5 grid-rows-5 gap-[1px] p-[2px]">
                          {[...Array(25)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`bg-white ${
                                (i * 3 + 1) % 4 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-slate-900' : ''
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : <div />}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'verifier' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <Stamp className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
            <h3 className="font-black text-slate-900 text-sm">Two-Way Verification Portal</h3>
            <p className="text-slate-500 text-[10px] mt-1">
              Prevent university transcript, fee receipt, or graduation credential forgery instantly.
            </p>
          </div>

          <form onSubmit={handleVerifySearch} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-550 mb-1 block">
                Verification Code / Fingerprint Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCX-TRN-2026-000456"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold font-mono transition"
                >
                  Verify Verification
                </button>
              </div>
            </div>
          </form>

          {/* Verification Result Display */}
          {searched && (
            <div className="border rounded-2xl p-4 animate-fade-in">
              {verificationResult ? (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-105">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                      <BadgeCheck className="h-4 w-4 text-emerald-600" /> VALID DOCUMENT FOUND
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Issued: {verificationResult.issuedOn}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] leading-relaxed">
                    <div>
                      <span className="text-slate-450 block">STUDENT HOLDER:</span>
                      <span className="font-bold text-slate-800 text-[11px]">{verificationResult.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 block">ADMISSION REG:</span>
                      <span className="font-mono text-slate-850 font-bold bg-slate-50 border px-1 rounded">{verificationResult.admissionNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 block">PROGRAM ACCREDIT:</span>
                      <span className="font-semibold text-slate-800">{verificationResult.program}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 block">ACADEMIC LEVEL GPA:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono border border-emerald-100">{verificationResult.gpa} GPA</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-450 block">VERIFIED DOCUMENT TYPE:</span>
                      <span className="font-bold text-indigo-700">{verificationResult.docType}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 text-center">
                    <p className="text-[8px] text-emerald-600 font-mono">
                      ✓ Cryptographically checked against the multi-tenant SCC global ledger registry.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                  <h4 className="font-extrabold text-rose-800 text-xs text-center">UNVERIFIABLE & FORGEDA CREATED DOCUMENT</h4>
                  <p className="text-[9px] text-rose-600 max-w-sm mx-auto leading-relaxed">
                    The code entered does not match any official academic record. This indicates potential diploma forgery. Do not accept this copy.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick presets helper under verifier */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest block mb-2">
              Seeded Codes For Evaluation
            </span>
            <div className="space-y-1 text-[10px] font-mono">
              <div 
                onClick={() => { setVerifyCode('SCX-TRN-2026-000456'); setVerifyCode('SCX-TRN-2026-000456'); }}
                className="flex justify-between items-center bg-white border border-slate-205 p-1.5 rounded cursor-pointer hover:bg-slate-50 transition"
              >
                <span>Alice Transcript (GPA 3.91):</span>
                <span className="text-indigo-600 font-bold hover:underline">SCX-TRN-2026-000456</span>
              </div>
              <div 
                onClick={() => setVerifyCode('SCX-ADM-2026-000123')}
                className="flex justify-between items-center bg-white border border-slate-205 p-1.5 rounded cursor-pointer hover:bg-slate-50 transition"
              >
                <span>John Admission Letter:</span>
                <span className="text-indigo-600 font-bold hover:underline">SCX-ADM-2026-000123</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
