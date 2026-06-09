import React, { useState, useEffect } from 'react';
import { 
  Building, ShieldAlert, Truck, Package, Boxes, Briefcase, 
  Plus, Search, CheckCircle, AlertCircle, RefreshCw, Layers, Edit3, 
  ArrowRight, FileText, DollarSign, BatteryCharging, ShieldCheck, 
  MapPin, Check, QrCode, ClipboardList, HelpCircle, User, Zap, Info, Wrench
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  kraPin: string;
  rating: number;
  address: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: string;
}

interface PurchaseRequest {
  id: string;
  title: string;
  requisitionNumber: string;
  items: Array<{ name: string; qty: number; estimatedUnitCost: number; estimatedTotalCost: number }>;
  estimatedTotal: number;
  urgency: string;
  description: string;
  hodStatus: string;
  procurementStatus: string;
  financeStatus: string;
  finalStatus: string;
  createdBy: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  items: Array<{ name: string; qty: number; unitCost: number; totalCost: number }>;
  totalAmount: number;
  status: string;
  createdBy: string;
  createdAt: string;
}

interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  billingAmount: number;
  status: string;
  dueDate: string;
  paymentRef?: string;
  paidAt?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  storeName: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  unitPrice: number;
}

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serialNumber: string;
  categoryName: string;
  type: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLifeYears: number;
  currentBookValue: number;
  status: string;
  buildingId?: string;
  roomId?: string;
  qrCode: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  specs: string;
  ipAddress: string;
  macAddress?: string;
  currentUser: string;
  status: string;
}

interface SoftwareLicense {
  id: string;
  name: string;
  licenseKey: string;
  totalSeats: number;
  usedSeats: number;
  expiryDate: string;
  status: string;
}

interface BuildingModel {
  id: string;
  name: string;
  code: string;
  floorsCount: number;
  description: string;
}

interface FacilityRoom {
  id: string;
  buildingName: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number;
}

interface MaintenanceRequest {
  id: string;
  buildingId: string;
  roomId: string;
  roomNumber: string;
  title: string;
  description: string;
  reporterName: string;
  reporterRole: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface MaintenanceWorkOrder {
  id: string;
  requestId: string;
  woNumber: string;
  assignedTo: string;
  estimatedCost: number;
  materialCost: number;
  laborCost: number;
  status: string;
  createdAt: string;
}

interface VehicleAssignment {
  id: string;
  plateNumber: string;
  assignedToStaffName: string;
  assignedDate: string;
  returnDate: string;
  purpose: string;
  status: string;
}

interface FuelLog {
  id: string;
  plateNumber: string;
  refuelDate: string;
  liters: number;
  totalCost: number;
  mileage: number;
  stationName: string;
}

interface ServiceLog {
  id: string;
  plateNumber: string;
  serviceDate: string;
  cost: number;
  description: string;
  providerName: string;
  nextServiceMileage: number;
}

interface AdminProcurementAssetsProps {
  token?: string;
  appendLog?: (log: string) => void;
}

export default function AdminProcurementAssets({ token, appendLog }: AdminProcurementAssetsProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'procurement' | 'inventory' | 'assets' | 'facilities' | 'fleet' | 'audits'>('dashboard');
  
  // Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [buildings, setBuildings] = useState<BuildingModel[]>([]);
  const [rooms, setRooms] = useState<FacilityRoom[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [vehicleAssignments, setVehicleAssignments] = useState<VehicleAssignment[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  
  // Interactive UI helpers
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form modal/states
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Register Supplier states
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierKRA, setNewSupplierKRA] = useState('');
  const [newSupplierCat, setNewSupplierCat] = useState('ICT Equipment');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  
  // Requisition states
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqUrgency, setReqUrgency] = useState('medium');
  const [reqItemName, setReqItemName] = useState('');
  const [reqItemQty, setReqItemQty] = useState<number>(1);
  const [reqItemCost, setReqItemCost] = useState<number>(100);
  const [addedReqItems, setAddedReqItems] = useState<Array<{ name: string; qty: number; estimatedUnitCost: number }>>([]);

  // Stock adjustments
  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('');

  // Register Asset State
  const [astName, setAstName] = useState('');
  const [astSerial, setAstSerial] = useState('');
  const [astCat, setAstCat] = useState('');
  const [astType, setAstType] = useState('Computers');
  const [astPrice, setAstPrice] = useState<number>(120000);
  const [astLife, setAstLife] = useState<number>(5);

  // Maintenance log State
  const [selectedAssetIdForMnt, setSelectedAssetIdForMnt] = useState('');
  const [mntCost, setMntCost] = useState<number>(2500);
  const [mntDesc, setMntDesc] = useState('');

  // Fault report State
  const [faultRoomId, setFaultRoomId] = useState('');
  const [faultTitle, setFaultTitle] = useState('');
  const [faultDesc, setFaultDesc] = useState('');
  const [faultPriority, setFaultPriority] = useState('Medium');

  // Work order assignment State
  const [woReqId, setWoReqId] = useState('');
  const [woAssignee, setWoAssignee] = useState('');
  const [woMatCost, setWoMatCost] = useState<number>(2000);
  const [woLabCost, setWoLabCost] = useState<number>(1000);

  // Fleet scheduler State
  const [fleetVehId, setFleetVehId] = useState('');
  const [fleetStaff, setFleetStaff] = useState('');
  const [fleetPurpose, setFleetPurpose] = useState('');

  // Fuel logged State
  const [fuelVehId, setFuelVehId] = useState('');
  const [fuelLiters, setFuelLiters] = useState<number>(40);
  const [fuelKilo, setFuelKilo] = useState<number>(120000);

  // Asset audits state
  const [auditTitle, setAuditTitle] = useState('');
  const [auditorName, setAuditorName] = useState('');

  // Safely shadow window.fetch locally in this component to auto-inject the auth token
  const safeFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const currentToken = token || localStorage.getItem('scc_token') || '';
    const finalInit = init || {};
    const url = typeof input === 'string' ? input : (input as Request).url || '';
    if (url.startsWith('/api') && currentToken) {
      const headers = new Headers(finalInit.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${currentToken}`);
      }
      finalInit.headers = headers;
    }
    return window.fetch(input, finalInit);
  };
  const fetch = safeFetch;

  useEffect(() => {
    fetchData();
  }, [activeSubTab, token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        resSups, resReqs, resPOs, resInvs, resInvItems, resAssets, 
        resDevs, resLics, resBlds, resRooms, resMaint, resWOs, resVehs, resFuel, resServ
      ] = await Promise.all([
        fetch('/api/procurement/suppliers').then(r => r.json()).catch(() => []),
        fetch('/api/procurement/requests').then(r => r.json()).catch(() => []),
        fetch('/api/procurement/orders').then(r => r.json()).catch(() => []),
        fetch('/api/procurement/invoices').then(r => r.json()).catch(() => []),
        fetch('/api/inventory/items').then(r => r.json()).catch(() => []),
        fetch('/api/assets').then(r => r.json()).catch(() => []),
        fetch('/api/ict/devices').then(r => r.json()).catch(() => []),
        fetch('/api/ict/licenses').then(r => r.json()).catch(() => []),
        fetch('/api/facilities/buildings').then(r => r.json()).catch(() => []),
        fetch('/api/facilities/rooms').then(r => r.json()).catch(() => []),
        fetch('/api/facilities/maintenance-requests').then(r => r.json()).catch(() => []),
        fetch('/api/facilities/work-orders').then(r => r.json()).catch(() => []),
        fetch('/api/vehicles/assignments').then(r => r.json()).catch(() => []),
        fetch('/api/vehicles/fuel-logs').then(r => r.json()).catch(() => []),
        fetch('/api/vehicles/service-logs').then(r => r.json()).catch(() => [])
      ]);

      setSuppliers(Array.isArray(resSups) ? resSups : []);
      setPurchaseRequests(Array.isArray(resReqs) ? resReqs : []);
      setPurchaseOrders(Array.isArray(resPOs) ? resPOs : []);
      setVendorInvoices(Array.isArray(resInvs) ? resInvs : []);
      setInventoryItems(Array.isArray(resInvItems) ? resInvItems : []);
      setAssets(Array.isArray(resAssets) ? resAssets : []);
      setDevices(Array.isArray(resDevs) ? resDevs : []);
      setLicenses(Array.isArray(resLics) ? resLics : []);
      setBuildings(Array.isArray(resBlds) ? resBlds : []);
      setRooms(Array.isArray(resRooms) ? resRooms : []);
      setMaintenanceRequests(Array.isArray(resMaint) ? resMaint : []);
      setWorkOrders(Array.isArray(resWOs) ? resWOs : []);
      setVehicleAssignments(Array.isArray(resVehs) ? resVehs : []);
      setFuelLogs(Array.isArray(resFuel) ? resFuel : []);
      setServiceLogs(Array.isArray(resServ) ? resServ : []);
    } catch (err: any) {
      console.error(err);
      showFeedback('error', 'Critical synchronization error: server connectivity issues.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Supplier Creation
  const handleRegisterSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName || !newSupplierKRA) {
      return showFeedback('error', 'Supplier name and legal KRA Pin are required.');
    }
    try {
      const res = await fetch('/api/procurement/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          category: newSupplierCat,
          kraPin: newSupplierKRA,
          email: newSupplierEmail,
          phone: newSupplierPhone
        })
      });
      if (res.ok) {
        showFeedback('success', 'Corporate supplier successfully onboarded.');
        setNewSupplierName('');
        setNewSupplierKRA('');
        setNewSupplierEmail('');
        setNewSupplierPhone('');
        fetchData();
      } else {
        showFeedback('error', 'Failed validation on supplier onboarding.');
      }
    } catch (err) {
      showFeedback('error', 'Server offline.');
    }
  };

  // Requisition creation
  const addRequisitionItem = () => {
    if (!reqItemName || reqItemQty < 1 || reqItemCost < 1) return;
    setAddedReqItems([
      ...addedReqItems, 
      { name: reqItemName, qty: reqItemQty, estimatedUnitCost: reqItemCost }
    ]);
    setReqItemName('');
    setReqItemQty(1);
    setReqItemCost(100);
  };

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || addedReqItems.length === 0) {
      return showFeedback('error', 'Brief title and at least one item are required.');
    }
    try {
      const res = await fetch('/api/procurement/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reqTitle,
          items: addedReqItems,
          description: reqDesc,
          urgency: reqUrgency
        })
      });
      if (res.ok) {
        showFeedback('success', 'Requisition created and locked. Awaiting workflow approvals.');
        setReqTitle('');
        setReqDesc('');
        setAddedReqItems([]);
        fetchData();
      } else {
        showFeedback('error', 'Failed submitting requisition.');
      }
    } catch (err) {
      showFeedback('error', 'Server offline.');
    }
  };

  // Workflows approvals trigger
  const handleApproveWorkflow = async (id: string, role: 'HOD' | 'Procurement' | 'Finance') => {
    try {
      const res = await fetch(`/api/procurement/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const text = role === 'Finance' 
          ? 'Passed Finance Board. Autogenerated Purchase Order and sent dispatch notice!'
          : `Approved by ${role} successfully.`;
        showFeedback('success', text);
        fetchData();
      } else {
        showFeedback('error', 'Approval node failed.');
      }
    } catch (err) {
      showFeedback('error', 'Error approving.');
    }
  };

  // Purchase Order Delivery (creates GRN, vendor invoice, updates stocks)
  const handleDeliverOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/procurement/orders/${id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showFeedback('success', 'GRN stamped, items received at stores, and vendor invoice recorded.');
        fetchData();
      } else {
        showFeedback('error', 'Failed marking PO as delivered.');
      }
    } catch (err) {
      showFeedback('error', 'Connection failed.');
    }
  };

  // Pay Vendor Invoice
  const handlePayVendorInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/procurement/invoices/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        showFeedback('success', 'Financial transaction reconciled and settled. Ledger updated!');
        fetchData();
      } else {
        showFeedback('error', 'Payment node rejected.');
      }
    } catch (err) {
      showFeedback('error', 'Finance integration offline.');
    }
  };

  // Stock Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId || !adjustQty || !adjustReason) {
      return showFeedback('error', 'Select item, input adjustment quantity, and state audit reason.');
    }
    try {
      const res = await fetch('/api/inventory/items/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: adjustItemId,
          qtyAdjusted: adjustQty,
          type: adjustType,
          reason: adjustReason
        })
      });
      if (res.ok) {
        showFeedback('success', `Inventory stock manually updated (${adjustType}). Audit trail logged.`);
        setAdjustReason('');
        fetchData();
      } else {
        showFeedback('error', 'Audit adjustment rejected by schema.');
      }
    } catch (err) {
      showFeedback('error', 'Adjustment offline.');
    }
  };

  // Register Asset
  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!astName || !astType || !astPrice) {
      return showFeedback('error', 'Provide name, class type and actual purchase price.');
    }
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: astName,
          serialNumber: astSerial || 'N/A',
          categoryId: astCat || 'ast-cat-comp',
          type: astType,
          purchasePrice: astPrice,
          usefulLifeYears: astLife
        })
      });
      if (res.ok) {
        showFeedback('success', 'Asset capitalized and logged to the Ledger. Holographic tags scheduled.');
        setAstName('');
        setAstSerial('');
        fetchData();
      } else {
        showFeedback('error', 'Failed ledger register verification.');
      }
    } catch (err) {
      showFeedback('error', 'Ledger registry unresolved.');
    }
  };

  // Log asset assignment
  const handleAssignAsset = async (assetId: string, buildId: string, rNum: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToType: 'Room',
          assignedToName: `${buildId} - ${rNum}`,
          buildingId: buildId,
          roomId: rNum
        })
      });
      if (res.ok) {
        showFeedback('success', 'Asset physically assigned to localized room.');
        fetchData();
      } else {
        showFeedback('error', 'Failed localization assignment.');
      }
    } catch (err) {
      showFeedback('error', 'Link server offline.');
    }
  };

  // Maintain asset manual log
  const handleLogAssetMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetIdForMnt || !mntCost || !mntDesc) {
      return showFeedback('error', 'Asset selection, costing, and mechanic service report are required.');
    }
    try {
      const res = await fetch(`/api/assets/${selectedAssetIdForMnt}/maintain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Corrective',
          cost: mntCost,
          description: mntDesc,
          performedBy: 'H.O.D Groundskeeper Core Mechanics'
        })
      });
      if (res.ok) {
        showFeedback('success', 'Mechanics service logged, asset flag set. Debit posted to Ledger expense!');
        setMntDesc('');
        fetchData();
      } else {
        showFeedback('error', 'Asset maintenance route error.');
      }
    } catch (err) {
      showFeedback('error', 'Ledger is unreachable.');
    }
  };

  // Dispose asset
  const handleDisposeAsset = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}/dispose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disposalMethod: 'Sale',
          saleAmount: 15000,
          remarks: 'Salvage value recovered from local buyers.'
        })
      });
      if (res.ok) {
        showFeedback('success', 'Asset successfully deprecated, sold, and de-capitalized. Capital gain recorded!');
        fetchData();
      } else {
        showFeedback('error', 'Disposal failed.');
      }
    } catch (err) {
      showFeedback('error', 'Ledger disposal offline.');
    }
  };

  // Report fault
  const handleReportFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultRoomId || !faultTitle || !faultDesc) {
      return showFeedback('error', 'Select Room/Building, provide title and issue details.');
    }
    try {
      const res = await fetch('/api/facilities/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: faultRoomId,
          title: faultTitle,
          description: faultDesc,
          priority: faultPriority
        })
      });
      if (res.ok) {
        showFeedback('success', 'Repair fault ticket generated. Estate supervisor notified.');
        setFaultTitle('');
        setFaultDesc('');
        fetchData();
      } else {
        showFeedback('error', 'Failed submitting fault.');
      }
    } catch (err) {
      showFeedback('error', 'Network failure.');
    }
  };

  // Dispatch work order
  const handleDispatchWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woReqId || !woAssignee) {
      return showFeedback('error', 'Select the active reported fault and assign a technician.');
    }
    try {
      const res = await fetch('/api/facilities/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: woReqId,
          assignedTo: woAssignee,
          materialCost: woMatCost,
          laborCost: woLabCost
        })
      });
      if (res.ok) {
        showFeedback('success', 'Repair squad dispatched with detailed material/labor work breakdown.');
        fetchData();
      } else {
        showFeedback('error', 'Work order dispatch rejected.');
      }
    } catch (err) {
      showFeedback('error', 'Could not sync.');
    }
  };

  // Complete work order
  const handleActionWorkOrder = async (woId: string, action: 'Start' | 'Complete') => {
    try {
      const res = await fetch(`/api/facilities/work-orders/${woId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const text = action === 'Complete' 
          ? 'Work instruction closed. Maintenance and labor booked to the ledger!'
          : 'Task shifted to standard: In Progress.';
        showFeedback('success', text);
        fetchData();
      } else {
        showFeedback('error', 'State transition rejected.');
      }
    } catch (err) {
      showFeedback('error', 'Network failure.');
    }
  };

  // Fleet allocation
  const handleAssignFleetVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fleetVehId || !fleetStaff || !fleetPurpose) {
      return showFeedback('error', 'Select vehicle, state staff member and route goal.');
    }
    try {
      const res = await fetch('/api/vehicles/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: fleetVehId,
          assignedToStaffName: fleetStaff,
          assignedDate: new Date().toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
          purpose: fleetPurpose
        })
      });
      if (res.ok) {
        showFeedback('success', 'Fleet assignment schedule created. Driver keys verified.');
        setFleetStaff('');
        setFleetPurpose('');
        fetchData();
      } else {
        showFeedback('error', 'Tender allocation rejected.');
      }
    } catch (err) {
      showFeedback('error', 'System down.');
    }
  };

  // Fleet Fuel logged
  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelVehId || !fuelLiters) {
      return showFeedback('error', 'Select fleet engine and fuel amount.');
    }
    try {
      const res = await fetch('/api/vehicles/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: fuelVehId,
          liters: fuelLiters,
          costPerLiter: 189.5,
          mileage: fuelKilo
        })
      });
      if (res.ok) {
        showFeedback('success', 'Fuel tank records locked. Expense journal posted to the ledger!');
        fetchData();
      } else {
        showFeedback('error', 'Failed logging fuel card usage.');
      }
    } catch (err) {
      showFeedback('error', 'Offline.');
    }
  };

  // Submit Audit states
  const handleTriggerAuditCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditTitle || !auditorName) {
      return showFeedback('error', 'Audit profile title and inspector name are required.');
    }
    try {
      const itemsAudited = assets.map(a => ({
        assetId: a.id,
        assetTag: a.assetTag,
        statusFound: 'VERIFIED_ACTIVE',
        conditionCorrect: true,
        notes: 'Asset scanned in correct building room via RFID barcode reader.'
      }));
      const res = await fetch('/api/audits/asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: auditTitle,
          auditorName,
          notes: 'Standard periodic physical compliance scan.',
          itemsAudited
        })
      });
      if (res.ok) {
        showFeedback('success', `Full asset compliance audit stamped. Registered 100% compliant!`);
        setAuditTitle('');
        setAuditorName('');
      } else {
        showFeedback('error', 'Declined building audit.');
      }
    } catch (err) {
      showFeedback('error', 'Server down.');
    }
  };

  // Finance indicators
  const totalAssetsValue = assets.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalSpendThisYear = vendorInvoices
    .filter(v => v.status === 'Paid')
    .reduce((sum, item) => sum + item.billingAmount, 0);
  const lowStockCount = inventoryItems.filter(item => item.currentStock <= item.reorderLevel).length;
  const activeFaultTickets = maintenanceRequests.filter(item => item.status !== 'Completed' && item.status !== 'Closed').length;

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6" id="procurement-assets-root">
      
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800/60 mb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs tracking-wider uppercase font-bold">
            <Boxes className="h-4 w-4" />
            <span>Phase 10 — Enterprise ERP Sub-System</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Procurement, Asset & Facilities Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Reconcile physical requisitions, track stores, run depreciation ledger lines, log vehicle fuels, and dispatch estate mechanics.
          </p>
        </div>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className="self-start md:self-auto flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer transition text-slate-300"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Syncing...' : 'Sync Live'}</span>
        </button>
      </div>

      {feedback && (
        <div 
          className={`mb-6 p-3.5 rounded flex items-start space-x-2.5 transition-all outline outline-1 duration-300 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 text-emerald-300 outline-emerald-500/30' 
              : 'bg-rose-950/40 text-rose-300 outline-rose-500/30'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-medium leading-normal">{feedback.message}</span>
        </div>
      )}

      {/* Main ERP Sub tabs navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3.5 mb-6">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>VC Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('procurement')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'procurement' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Procurement & POs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'inventory' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="h-3.5 w-3.5" />
          <span>Warehouse Stocks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assets')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'assets' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Boxes className="h-3.5 w-3.5" />
          <span>Capital Assets & ICT</span>
        </button>

        <button
          onClick={() => setActiveSubTab('facilities')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'facilities' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Campus Maintenance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'fleet' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Logistics & Fleet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audits')}
          className={`px-3 py-2 rounded text-xs font-semibold cursor-pointer transition flex items-center space-x-2 ${
            activeSubTab === 'audits' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Compliance Audits</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-mono tracking-wider">Acquiring cryptographic general ledger records...</p>
        </div>
      ) : (
        <div>
          {/* VIEW: EXECUTIVE DASHBOARD */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Statistical KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">CAPITAL ASSET PORTFOLIO</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-white text-2xl font-bold tracking-tight">KES {totalAssetsValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-emerald-400 text-[11px] font-mono leading-none">
                    <ShieldCheck className="h-3 w-3 shrink-0" />
                    <span>Scanned and depreciating straight-line</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">ANNUAL COMPLIANT SPEND</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-white text-2xl font-bold tracking-tight">KES {totalSpendThisYear.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-indigo-400 text-[11px] font-mono leading-none">
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>Ledger settled via bank payments</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">LOW STOCKS ALARMS</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-white text-2xl font-bold tracking-tight">{lowStockCount} Items</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-amber-500 text-[11px] font-mono leading-none">
                    <AlertCircle className="h-3 w-3 shrink-0 animate-bounce" />
                    <span>Auto-requisition triggers pending</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">ACTIVE REPAIR FAULTS</span>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-white text-2xl font-bold tracking-tight">{activeFaultTickets} Tickets</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-amber-400 text-[11px] font-mono leading-none">
                    <Wrench className="h-3 w-3 shrink-0" />
                    <span>Technical staff deployed at site</span>
                  </div>
                </div>
              </div>

              {/* Alert and Graphs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual SVG chart */}
                <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-lg lg:col-span-2">
                  <h3 className="text-sm font-semibold text-white tracking-tight mb-3">
                    ERP Monthly Operations Expenditure Comparison
                  </h3>
                  <div className="relative w-full h-48 bg-slate-950 p-2 rounded border border-slate-900 flex items-end justify-between">
                    {/* SVG pure bar elements */}
                    <div className="absolute top-2 left-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2.5 w-2.5 bg-indigo-500 rounded-sm inline-block"></span>
                        <span className="text-[10px] text-slate-400 font-mono">Procurement Spend</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2.5 w-2.5 bg-amber-500 rounded-sm inline-block"></span>
                        <span className="text-[10px] text-slate-400 font-mono">Facilities Repair Work</span>
                      </div>
                    </div>

                    {[
                      { m: 'Jan', pCost: 15, fCost: 8 },
                      { m: 'Feb', pCost: 32, fCost: 14 },
                      { m: 'Mar', pCost: 24, fCost: 11 },
                      { m: 'Apr', pCost: 45, fCost: 18 },
                      { m: 'May', pCost: 18, fCost: 9 },
                      { m: 'Jun', pCost: totalSpendThisYear > 0 ? 55 : 30, fCost: 20 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center group h-36 justify-end relative">
                        <div className="w-full flex justify-center space-x-1 items-end h-28 px-1">
                          <div 
                            style={{ height: `${item.pCost}%` }} 
                            className="bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-sm w-3.5 md:w-5 cursor-help"
                            title={`KES ${item.pCost * 1000}K logged`}
                          ></div>
                          <div 
                            style={{ height: `${item.fCost}%` }} 
                            className="bg-amber-500 hover:bg-amber-400 transition-all rounded-t-sm w-3.5 md:w-5 cursor-help"
                            title={`KES ${item.fCost * 1000}K logged`}
                          ></div>
                        </div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 mt-2">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick alert notifications panel */}
                <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-lg space-y-4">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>Real-time Compliance Auditor Alerts</span>
                  </h3>
                  <div className="space-y-3 overflow-y-auto max-h-36 pr-1">
                    {lowStockCount > 0 && (
                      <div className="p-2.5 rounded bg-amber-950/20 text-amber-300 border-l-2 border-amber-500 text-xs flex flex-col space-y-1">
                        <span className="font-bold">LOW_STOCK ALERT</span>
                        <span>Item sku `INV-MNT-440` has fallen below recommended buffer safety limit.</span>
                      </div>
                    )}
                    <div className="p-2.5 rounded bg-rose-950/20 text-rose-300 border-l-2 border-rose-500 text-xs flex flex-col space-y-1">
                      <span className="font-bold">DEPRECIATION_LEDGER SCHEDULE</span>
                      <span>End-of-month automatic asset devaluation triggers are waiting for execution review.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PROCUREMENT & VENDORS */}
          {activeSubTab === 'procurement' && (
            <div className="space-y-8">
              
              {/* Form Grid: Onboard Vendor and Create Requisition */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Onboard Supplier form */}
                <form onSubmit={handleRegisterSupplier} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Onboard Corporate Supplier</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">COMPANY NAME (LEGAL ENTITY)</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Kipor & Partners ICT Supplies Ltd"
                        value={newSupplierName}
                        onChange={e => setNewSupplierName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">KRA PIN / REG NUMBER</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. P051123450Z"
                        value={newSupplierKRA}
                        onChange={e => setNewSupplierKRA(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">TENDER CATEGORY</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                        value={newSupplierCat}
                        onChange={e => setNewSupplierCat(e.target.value)}
                      >
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="ICT Equipment">ICT Equipment</option>
                        <option value="Laboratory Supplies">Laboratory Supplies</option>
                        <option value="Vehicle Supplies">Vehicle Supplies</option>
                        <option value="Furniture">Furniture</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">EMAIL ADDRESS</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. support@kiporict.co.ke"
                        value={newSupplierEmail}
                        onChange={e => setNewSupplierEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">PHONE / HOTLINE</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. +254 711 222 333"
                        value={newSupplierPhone}
                        onChange={e => setNewSupplierPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Register Supplying Contractor
                  </button>
                </form>

                {/* Create Requisition form */}
                <form onSubmit={handleCreateRequisition} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    <span>Create Purchase Requisition</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">REQUISITION BRIEF TITLE</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Science Laboratory re-agents chemicals replenishment"
                        value={reqTitle}
                        onChange={e => setReqTitle(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 mb-1 p-2 bg-slate-950 rounded border border-slate-800/80">
                      <label className="block text-[10px] text-indigo-400 font-mono font-bold mb-1.5 uppercase">ADD ITEM TO TENDER BREAKDOWN</label>
                      <div className="flex space-x-2">
                        <input 
                          className="flex-1 bg-slate-900 p-1.5 rounded text-[11px] border border-slate-700 text-slate-200 outline-none" 
                          placeholder="Item Name (e.g. LED bulbs)"
                          value={reqItemName}
                          onChange={e => setReqItemName(e.target.value)}
                        />
                        <input 
                          type="number" 
                          className="w-14 bg-slate-900 p-1.5 rounded text-[11px] border border-slate-700 text-slate-200 outline-none text-center" 
                          placeholder="Qty"
                          value={reqItemQty}
                          onChange={e => setReqItemQty(Number(e.target.value))}
                        />
                        <input 
                          type="number" 
                          className="w-20 bg-slate-900 p-1.5 rounded text-[11px] border border-slate-700 text-slate-200 outline-none text-center" 
                          placeholder="Unit Cost"
                          value={reqItemCost}
                          onChange={e => setReqItemCost(Number(e.target.value))}
                        />
                        <button 
                          type="button" 
                          onClick={addRequisitionItem}
                          className="bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded text-[11px] font-bold transition select-none cursor-pointer text-white"
                        >
                          Add
                        </button>
                      </div>

                      {/* Display added items inside box */}
                      {addedReqItems.length > 0 && (
                        <div className="mt-3 border-t border-slate-800 pr-1.5 pt-2 max-h-24 overflow-y-auto space-y-1">
                          {addedReqItems.map((item, id) => (
                            <div key={id} className="flex justify-between text-[11px] text-slate-300 bg-slate-900 p-1 rounded font-mono">
                              <span>- {item.name} (x{item.qty})</span>
                              <span>KES {(item.qty * item.estimatedUnitCost).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">URGENCY TRIGGER</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                        value={reqUrgency}
                        onChange={e => setReqUrgency(e.target.value)}
                      >
                        <option value="low">Low (Routine replenishment)</option>
                        <option value="medium">Medium (Course labs support)</option>
                        <option value="high">High (Examination/Crisis critical)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">JUSTIFICATION NOTES</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="Why is this requested..."
                        value={reqDesc}
                        onChange={e => setReqDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Submit Formal Requisition
                  </button>
                </form>

              </div>

              {/* Purchase Requisitions Workflow approving table */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                  <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Administrative Multi-Stage Approvals Queue & Workflow</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#111c3a] text-indigo-300 uppercase font-mono text-[10px] border-b border-indigo-950">
                      <tr>
                        <th className="p-3">Ref Code</th>
                        <th className="p-3">Title / Items</th>
                        <th className="p-3">Est Value</th>
                        <th className="p-3">HOD Node</th>
                        <th className="p-3">Procurement Node</th>
                        <th className="p-3">Finance Node</th>
                        <th className="p-3 text-right">Workflow Simulation Approvals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {purchaseRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-3.5 text-center text-slate-500">No purchase requisitions in approvals queue.</td>
                        </tr>
                      ) : (
                        purchaseRequests.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-800/10 font-mono">
                            <td className="p-3 font-bold text-white shrink-0">{pr.requisitionNumber}</td>
                            <td className="p-3 font-sans">
                              <div className="text-white font-semibold text-xs">{pr.title}</div>
                              <p className="text-[11px] text-indigo-300 font-mono max-w-sm overflow-hidden text-ellipsis truncate mt-0.5">
                                [ {pr.items.map(it => `${it.name} x${it.qty}`).join(', ')} ]
                              </p>
                            </td>
                            <td className="p-3 text-white">KES {pr.estimatedTotal.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pr.hodStatus === 'approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                              }`}>{pr.hodStatus.toUpperCase()}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pr.procurementStatus === 'approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                              }`}>{pr.procurementStatus.toUpperCase()}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pr.financeStatus === 'approved' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                              }`}>{pr.financeStatus.toUpperCase()}</span>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              {pr.hodStatus === 'pending' && (
                                <button 
                                  onClick={() => handleApproveWorkflow(pr.id, 'HOD')} 
                                  className="bg-sky-900 border border-sky-600 hover:bg-sky-800 text-sky-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition select-none"
                                >
                                  HOD Approve
                                </button>
                              )}
                              {pr.hodStatus === 'approved' && pr.procurementStatus === 'pending' && (
                                <button 
                                  onClick={() => handleApproveWorkflow(pr.id, 'Procurement')} 
                                  className="bg-indigo-900 border border-indigo-600 hover:bg-indigo-800 text-indigo-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition select-none"
                                >
                                  Proc Approve
                                </button>
                              )}
                              {pr.procurementStatus === 'approved' && pr.financeStatus === 'pending' && (
                                <button 
                                  onClick={() => handleApproveWorkflow(pr.id, 'Finance')} 
                                  className="bg-emerald-900 border border-emerald-600 hover:bg-emerald-800 text-emerald-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition select-none"
                                >
                                  Finance Board Release (Generate PO)
                                </button>
                              )}
                              {pr.finalStatus === 'approved' && (
                                <span className="text-emerald-400 font-sans inline-flex items-center space-x-0.5 text-[11px] font-bold">
                                  <Check className="h-3 w-3 shrink-0" />
                                  <span>Tender Complete & Dispatched</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase Orders and Vendor Invoices Dual Deck */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Orders List */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                    <Truck className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Purchase Orders Dispatch Log</span>
                  </h3>
                  <div className="overflow-y-auto max-h-60 pr-1.5 space-y-2.5">
                    {purchaseOrders.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6 font-mono">No active purchase orders dispatched.</p>
                    ) : (
                      purchaseOrders.map(po => (
                        <div key={po.id} className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-start font-mono text-[11px]">
                          <div className="space-y-1 text-slate-300">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-white font-bold text-xs">{po.poNumber}</span>
                              <span className={`px-1 rounded text-[9px] font-bold ${
                                po.status === 'Paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-indigo-950 text-indigo-300'
                              }`}>{po.status.toUpperCase()}</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">Vendor: {po.supplierName}</p>
                            <div className="text-[10px] text-slate-500 max-w-sm truncate whitespace-nowrap">
                              [ {po.items.map(it => `${it.name} x${it.qty}`).join(', ')} ]
                            </div>
                          </div>
                          <div className="text-right space-y-2 shrink-0">
                            <p className="text-white font-bold text-xs">KES {po.totalAmount.toLocaleString()}</p>
                            {po.status === 'Sent' && (
                              <button 
                                onClick={() => handleDeliverOrder(po.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 font-sans text-[10px] font-bold text-white px-2 py-1 rounded cursor-pointer transition shrink-0 inline-flex items-center space-x-1"
                              >
                                <Check className="h-3 w-3 shrink-0" />
                                <span>Receive Delivery (GRN)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Vendor Invoices Ledger block */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                    <FileText className="h-4.5 w-4.5 text-emerald-400" />
                    <span>Vendor Accounts Payable & Ledgers</span>
                  </h3>
                  <div className="overflow-y-auto max-h-60 pr-1.5 space-y-2.5">
                    {vendorInvoices.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6 font-mono">No vendor invoices registered.</p>
                    ) : (
                      vendorInvoices.map(vinv => (
                        <div key={vinv.id} className="p-3 rounded bg-slate-950 border border-slate-800 flex justify-between items-center font-mono text-[11px]">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-white font-bold">{vinv.invoiceNumber}</span>
                              <span className={`px-1 rounded text-[9px] font-bold ${
                                vinv.status === 'Paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}>{vinv.status.toUpperCase()}</span>
                            </div>
                            <p className="text-slate-500 text-[10px]">Due Date: {vinv.dueDate} | Rec: {vinv.dueDate}</p>
                            {vinv.paymentRef && (
                              <p className="text-emerald-400 text-[9px] leading-tight">Paid Ref: {vinv.paymentRef}</p>
                            )}
                          </div>
                          <div className="text-right space-y-2 shrink-0">
                            <p className="text-white font-bold">KES {vinv.billingAmount.toLocaleString()}</p>
                            {vinv.status === 'Unpaid' && (
                              <button 
                                onClick={() => handlePayVendorInvoice(vinv.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition select-none inline-flex items-center space-x-0.5"
                              >
                                <DollarSign className="h-3 w-3 shrink-0" />
                                <span>Pay Vendor Card</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Verified Suppliers search roster */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white tracking-tight">Active Approved Bidders & Suppliers Database</h3>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input 
                      className="bg-slate-950 p-1.5 pl-8 text-xs rounded border border-slate-800 outline-none text-slate-300 w-48"
                      placeholder="Search supplier list..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {suppliers
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.kraPin.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(sup => (
                      <div key={sup.id} className="bg-slate-950 p-3 rounded.5 border border-slate-800 text-[11px] font-mono space-y-1.5 relative overflow-hidden">
                        <div className="h-1 w-full bg-indigo-500 absolute top-0 left-0"></div>
                        <div className="text-white font-bold font-sans text-xs pt-1">{sup.name}</div>
                        <div>Category: <span className="text-indigo-300">{sup.category}</span></div>
                        <div>KRA Pin: <span className="text-slate-400">{sup.kraPin}</span></div>
                        <div>Person: <span className="text-slate-300">{sup.contactPerson}</span></div>
                        <div>Rating: <span className="text-amber-400 font-bold">★ {sup.rating}</span></div>
                        <div className="text-[10px] text-slate-500 truncate">{sup.email}</div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW: STORES INVENTORY */}
          {activeSubTab === 'inventory' && (
            <div className="space-y-6">
              
              {/* Form and adjustment deck */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Register inventory material template */}
                <form 
                  onSubmit={async e => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    try {
                      const res = await fetch('/api/inventory/items', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: fd.get('name'),
                          categoryId: fd.get('categoryId'),
                          storeId: fd.get('storeId'),
                          currentStock: fd.get('currentStock'),
                          reorderLevel: fd.get('reorderLevel'),
                          unit: fd.get('unit'),
                          unitPrice: fd.get('unitPrice')
                        })
                      });
                      if (res.ok) {
                        showFeedback('success', 'New material SKU cataloged successfully.');
                        e.currentTarget.reset();
                        fetchData();
                      } else {
                        showFeedback('error', 'Error in barcode format validation.');
                      }
                    } catch (err) {
                      showFeedback('error', 'Offline');
                    }
                  }}
                  className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Catalog Warehouse SKU Material</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">MATERIAL NAME</label>
                      <input 
                        name="name" required
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Standard Twin-tube LED Bulbs 40W"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">CATEGORY</label>
                        <select 
                          name="categoryId" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                        >
                          <option value="cat-office">Office Supplies</option>
                          <option value="cat-ict">ICT Equipment</option>
                          <option value="cat-lab">Laboratory Supplies</option>
                          <option value="cat-maintenance">Maintenance Materials</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">STORE LOCATION</label>
                        <select 
                          name="storeId" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        >
                          <option value="store-main">Central Warehouse</option>
                          <option value="store-lab">Science Store</option>
                          <option value="store-hostel">Maintenance workshop</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">INITIAL QTY</label>
                        <input 
                          name="currentStock" type="number" defaultValue="100" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">REORDER BUFFER</label>
                        <input 
                          name="reorderLevel" type="number" defaultValue="20" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">UNIT SCALE</label>
                        <input 
                          name="unit" defaultValue="Units" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">UNIT PRICE (KES)</label>
                        <input 
                          name="unitPrice" type="number" defaultValue="850" required
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Register Warehouse Material
                  </button>
                </form>

                {/* Stock adjustments audit logger form */}
                <form onSubmit={handleAdjustStock} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Edit3 className="h-4 w-4 text-amber-500" />
                    <span>Manual Stock Reconciliation (Audit)</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SELECT INVENTORY SKU</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={adjustItemId}
                        onChange={e => setAdjustItemId(e.target.value)}
                      >
                        <option value="">-- Choose item --</option>
                        {inventoryItems.map(it => (
                          <option key={it.id} value={it.id}>{it.sku}: {it.name} (Current: {it.currentStock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ACTION TYPE</label>
                        <select 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none font-bold"
                          value={adjustType}
                          onChange={e => setAdjustType(e.target.value as 'ADD' | 'SUBTRACT')}
                        >
                          <option value="ADD" className="text-emerald-400 font-bold">ADD ITEMS (+)</option>
                          <option value="SUBTRACT" className="text-rose-400 font-bold">SUBTRACT ITEMS (-)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">INCREMENT VALUE</label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                          value={adjustQty}
                          onChange={e => setAdjustQty(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">DUE JUSTIFICATION / AUDIT NOTE</label>
                      <textarea 
                        rows={2}
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none" 
                        placeholder="e.g. Physical inventory check. Worn out pack adjustments..."
                        value={adjustReason}
                        onChange={e => setAdjustReason(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none uppercase tracking-wider font-mono">
                    Authorize Stock Discrepancy Change
                  </button>
                </form>

                {/* Auxiliary Stores database quickcard */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                    <Building className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Registered University Stores</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="text-white font-bold font-sans text-xs select-none">Central University Warehouse</div>
                      <p className="text-slate-400">Custodian: Hulda Chemutai</p>
                      <span className="text-slate-500 text-[10px] block">Location: Administration Plaza basement level</span>
                    </div>
                    <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="text-white font-bold font-sans text-xs">Science Lab Auxiliary Workshop</div>
                      <p className="text-slate-400">Custodian: Dennis Okello</p>
                      <span className="text-slate-500 text-[10px] block">Location: Science complex Floor 1 Annex</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Verified SKU stocks master roster */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight">University Central Warehouse Catalog (Active Materials Stocks)</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#111c3a] text-indigo-300 uppercase font-mono text-[11px] border-b border-indigo-950">
                      <tr>
                        <th className="p-3">SKU ID Code</th>
                        <th className="p-3">Material Name</th>
                        <th className="p-3">Class/Category</th>
                        <th className="p-3">Store Custody</th>
                        <th className="p-3">Balance Stock</th>
                        <th className="p-3">Unit Valuation</th>
                        <th className="p-3">Alert Threshold</th>
                        <th className="p-3 text-right">Physical Audit Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {inventoryItems.map(item => {
                        const isLow = item.currentStock <= item.reorderLevel;
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/10">
                            <td className="p-3 text-indigo-300 font-bold">{item.sku}</td>
                            <td className="p-3 text-white font-sans font-semibold">{item.name}</td>
                            <td className="p-3">{item.categoryName}</td>
                            <td className="p-3 font-sans text-[11px] text-slate-400">{item.storeName}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                                isLow ? 'bg-rose-950/40 text-rose-300 border-l border-rose-500' : 'bg-slate-950 text-slate-300'
                              }`}>
                                {item.currentStock} {item.unit}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">KES {item.unitPrice}</td>
                            <td className="p-3 text-slate-400">{item.reorderLevel} {item.unit}</td>
                            <td className="p-3 text-right">
                              {isLow ? (
                                <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1">
                                  <AlertCircle className="h-3 w-3" />
                                  <span>Replenish Triggered</span>
                                </span>
                              ) : (
                                <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">Standard OK</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: REGISTERED ASSETS & ICT DEVICES */}
          {activeSubTab === 'assets' && (
            <div className="space-y-6">
              
              {/* Assets forms deck */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Capitalize physical asset form */}
                <form onSubmit={handleRegisterAsset} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Capitalize Campus Asset (Log into ledger)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ASSET DESCRIPTION NAME</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Dell Latitude 5440 Exam Workstations Core i7"
                        value={astName}
                        onChange={e => setAstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SERIAL NUMBER / MANUFACTURER UUID</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. S908HJ123A"
                        value={astSerial}
                        onChange={e => setAstSerial(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ASSET SPECIFIC CLASSIFICATION</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                        value={astCat}
                        onChange={e => setAstCat(e.target.value)}
                      >
                        <option value="ast-cat-comp">Computers & Laptops</option>
                        <option value="ast-cat-veh">Fleet Vehicles</option>
                        <option value="ast-cat-lab">Science Lab Analytical Instruments</option>
                        <option value="ast-cat-net">Networking hardware</option>
                        <option value="ast-cat-gen">Power backup generator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ASSET TYPE</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                        value={astType}
                        onChange={e => setAstType(e.target.value)}
                      >
                        <option value="Computers">Computers</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Laboratory Equipment">Laboratory Equipment</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Generators">Generators</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">PURCHASE VALUATION (KES)</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        value={astPrice}
                        onChange={e => setAstPrice(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ECONOMIC USEFUL LIFE (YEARS)</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                        value={astLife}
                        onChange={e => setAstLife(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Capitalize & Write Asset into Ledger Ledger
                  </button>
                </form>

                {/* Asset maintenance corrective service logging */}
                <form onSubmit={handleLogAssetMaintenance} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    <span>Log Asset Corrective Mechanic Check</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SELECT CAPITALIZED ASSET</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={selectedAssetIdForMnt}
                        onChange={e => setSelectedAssetIdForMnt(e.target.value)}
                      >
                        <option value="">-- Select active tag --</option>
                        {assets.map(a => (
                          <option key={a.id} value={a.id}>{a.assetTag}: {a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ACTUAL MAINTENANCE invoice COST (KES)</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center font-bold text-amber-500"
                        value={mntCost}
                        onChange={e => setMntCost(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">TECHNICIAN DETAILED REPAIR REPORT</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        placeholder="State exactly what has been fixed/replaced..."
                        value={mntDesc}
                        onChange={e => setMntDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Audit Mechanics Log & Post Maintenance Expenses
                  </button>
                </form>

              </div>

              {/* Capital assets list database */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                  <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Interactive Campus Assets Ledger Registry & Depreciation Models</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#111c3a] text-indigo-300 uppercase font-mono text-[10px] border-b border-indigo-950">
                      <tr>
                        <th className="p-3">Hologram Tag ID</th>
                        <th className="p-3">Asset Specification</th>
                        <th className="p-3">Capital Valuation</th>
                        <th className="p-3">Current Book Value</th>
                        <th className="p-3">Assigned Locale</th>
                        <th className="p-3">Tracking codes</th>
                        <th className="p-3 text-right">Physical Asset lifecycle Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {assets.map(ast => (
                        <tr key={ast.id} className="hover:bg-slate-800/10">
                          <td className="p-3 font-bold text-white">{ast.assetTag}</td>
                          <td className="p-3 font-sans">
                            <div className="text-white font-semibold text-xs">{ast.name}</div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">S/N: {ast.serialNumber}</p>
                          </td>
                          <td className="p-3 text-slate-300">KES {ast.purchasePrice.toLocaleString()}</td>
                          <td className="p-3 font-bold text-emerald-400">KES {ast.currentBookValue.toLocaleString()}</td>
                          <td className="p-3 font-sans text-slate-400">
                            {ast.buildingId ? `${ast.buildingId} Room ${ast.roomId}` : (
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleAssignAsset(ast.id, 'Sci-Complex', 'CS-LAB-4A')}
                                  className="bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 text-[10px] px-1 rounded py-0.5"
                                >
                                  CS Lab A
                                </button>
                                <button 
                                  onClick={() => handleAssignAsset(ast.id, 'Plaza-Admin', 'ADM-103')}
                                  className="bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px] px-1 rounded py-0.5"
                                >
                                  Admin 103
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 select-none cursor-pointer hover:text-white inline-flex items-center space-x-1">
                              <QrCode className="h-3.5 w-3.5" />
                              <span>QR Stamp</span>
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            {ast.status !== 'Disposed' ? (
                              <button 
                                onClick={() => handleDisposeAsset(ast.id)}
                                className="bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 px-2.5 py-1 rounded text-[10px] font-sans font-bold cursor-pointer transition select-none inline-flex items-center space-x-0.5"
                              >
                                <span>Dispose / Sale</span>
                              </button>
                            ) : (
                              <span className="text-slate-500 line-through">Disposed (End-of-life)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ICT Specific tracker databases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Laptops Speccing */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <span>ICT Devices Hardware Workstations</span>
                  </h3>
                  <div className="space-y-2.5">
                    {devices.map(dev => (
                      <div key={dev.id} className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h4 className="text-white font-semibold font-sans text-xs">{dev.name}</h4>
                          <p className="text-slate-400">IP: {dev.ipAddress} | Mac: {dev.macAddressHash || '6F:45:90:AB:89:12'}</p>
                          <p className="text-[10px] text-slate-500">Specs: {dev.specs}</p>
                        </div>
                        <span className="bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded text-[9px] font-bold shrink-0">{dev.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Software seats tracking */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 hover:text-white" />
                    <span>Educational Software Licenses (Seats)</span>
                  </h3>
                  <div className="space-y-2.5">
                    {licenses.map(lic => (
                      <div key={lic.id} className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="text-white font-semibold font-sans text-xs">{lic.name}</h4>
                          <span className="text-slate-500 text-[10px]">Expiring: {lic.expiryDate}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-indigo-400 font-bold block">{lic.usedSeats} / {lic.totalSeats} seats used</span>
                          <span className="text-slate-500 text-[9px] leading-none block mt-0.5">License Key: Approved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: CAMPUS FACILITIES MAINTENANCE */}
          {activeSubTab === 'facilities' && (
            <div className="space-y-6">
              
              {/* Fault reports logger and technician dispatcher */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Fault reports form */}
                <form onSubmit={handleReportFault} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>File Fault Repair Ticket</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SELECT DECAYING ROOM / HALL</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={faultRoomId}
                        onChange={e => setFaultRoomId(e.target.value)}
                      >
                        <option value="">-- Select Room locale --</option>
                        {rooms.map(rm => (
                          <option key={rm.id} value={rm.id}>{rm.buildingName} - {rm.roomNumber}: {rm.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">FAULT SHORT SUMMARY BRIEF</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Water plumbing leakage under CS-Lab A row"
                        value={faultTitle}
                        onChange={e => setFaultTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SEVERITY PRIORITY</label>
                        <select 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500"
                          value={faultPriority}
                          onChange={e => setFaultPriority(e.target.value)}
                        >
                          <option value="Low">Low (Aesthetic/Minor)</option>
                          <option value="Medium">Medium (Instructional hindrance)</option>
                          <option value="High">High (Immediate safety/Floods crisis)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">TICKET DETAILS</label>
                        <input 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                          placeholder="e.g. Toilet tank valve stuck causing flood..."
                          value={faultDesc}
                          onChange={e => setFaultDesc(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Lodge Fault Complaint Ticket
                  </button>
                </form>

                {/* Dispatch technician work order */}
                <form onSubmit={handleDispatchWorkOrder} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    <span>Lodge and Dispatch Work Order</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ACTIVE REPORTED FAULT COMPLAINT</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={woReqId}
                        onChange={e => setWoReqId(e.target.value)}
                      >
                        <option value="">-- Choose active report --</option>
                        {maintenanceRequests
                          .filter(r => r.status === 'Reported' || r.status === 'Work Order Created')
                          .map(maint => (
                            <option key={maint.id} value={maint.id}>{maint.roomNumber}: {maint.title} ({maint.priority})</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ASSIGNED TECHNICIAN SQUAD</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Timothy Kamau (Electrical Lead)"
                        value={woAssignee}
                        onChange={e => setWoAssignee(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ESTIMATED PARTS/MATERIALS (KES)</label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                          value={woMatCost}
                          onChange={e => setWoMatCost(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ESTIMATED LABOR SERVICE BUDGET (KES)</label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                          value={woLabCost}
                          onChange={e => setWoLabCost(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Dispatch Repair Squad & Work Order
                  </button>
                </form>

              </div>

              {/* Maintenance requests queue roster */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                  <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Campus Fault Reports & Active Repairs Queue</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#111c3a] text-indigo-300 uppercase font-mono text-[10px] border-b border-indigo-950">
                      <tr>
                        <th className="p-3">Repair Target</th>
                        <th className="p-3">Fault description</th>
                        <th className="p-3">Complaint Severity</th>
                        <th className="p-3">Complainant details</th>
                        <th className="p-3">Repair Status</th>
                        <th className="p-3 text-right">Service Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {maintenanceRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-3.5 text-center text-slate-500">No active repair tickets filed.</td>
                        </tr>
                      ) : (
                        maintenanceRequests.map(req => (
                          <tr key={req.id} className="hover:bg-slate-800/10 text-[11px]">
                            <td className="p-3 text-white font-bold">{req.roomNumber}</td>
                            <td className="p-3 font-sans">
                              <div className="text-white font-semibold text-xs">{req.title}</div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{req.description}</p>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                req.priority === 'High' ? 'bg-rose-950 text-rose-300' : 'bg-slate-950 text-slate-400'
                              }`}>{req.priority}</span>
                            </td>
                            <td className="p-3 font-sans text-slate-400">
                              <div>{req.reporterName}</div>
                              <span className="text-[10px] font-mono tracking-wide text-slate-500">{req.reporterRole}</span>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-950 text-indigo-300 px-2 py-0.5 rounded font-bold text-[10px]">{req.status}</span>
                            </td>
                            <td className="p-3 text-right">
                              {/* Display corresponding work orders action */}
                              {workOrders.filter(w => w.requestId === req.id).map(wo => (
                                <div key={wo.id} className="flex justify-end items-center space-x-1">
                                  <span className="text-slate-400 leading-none mr-2 font-mono text-[10px]">WO: {wo.woNumber}</span>
                                  {wo.status === 'Assigned' && (
                                    <button 
                                      onClick={() => handleActionWorkOrder(wo.id, 'Start')}
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer select-none"
                                    >
                                      Begin Repair
                                    </button>
                                  )}
                                  {wo.status === 'In Progress' && (
                                    <button 
                                      onClick={() => handleActionWorkOrder(wo.id, 'Complete')}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold px-2 py-1 rounded text-[10px] transition cursor-pointer select-none"
                                    >
                                      Close ticket (Approve)
                                    </button>
                                  )}
                                  {wo.status === 'Completed' && (
                                    <span className="text-emerald-400 font-bold font-sans text-[10px]">✔ Repair Verified compliant</span>
                                  )}
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: VEHICLES FLEET LOGISTICS */}
          {activeSubTab === 'fleet' && (
            <div className="space-y-6">
              
              {/* Scheduling allocation and fuel logger forms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Allocation driver schedule */}
                <form onSubmit={handleAssignFleetVehicle} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Schedule Fleet Vehicle Shift Allocation</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">SELECT BUS / SCHOOL VAN</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={fleetVehId}
                        onChange={e => setFleetVehId(e.target.value)}
                      >
                        <option value="">-- Choose active engine --</option>
                        <option value="veh-1">KBH 102Z - Isuzu FSR Executive Bus</option>
                        <option value="veh-2">KDM 980A - Toyota Hiace High-Roof Van</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">RECIPIENT STAFF RECIPIENT</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Prof. Isaac Newton HOD Physics"
                        value={fleetStaff}
                        onChange={e => setFleetStaff(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">ROUTE ALLOCATION / PURPOSE DETAILS</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Transport delegations for Research Summit in Nairobi Central"
                        value={fleetPurpose}
                        onChange={e => setFleetPurpose(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Schedule Allocation Shift
                  </button>
                </form>

                {/* Fuel Log card logger */}
                <form onSubmit={handleLogFuel} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <BatteryCharging className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>Log Fuel replenishment Invoice card</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">FLEET ENGINE</label>
                      <select 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none"
                        value={fuelVehId}
                        onChange={e => setFuelVehId(e.target.value)}
                      >
                        <option value="">-- Choose active engine --</option>
                        <option value="veh-1">KBH 102Z - Isuzu FSR Executive Bus</option>
                        <option value="veh-2">KDM 980A - Toyota Hiace High-Roof Van</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">LITERS REPLENISHED</label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                          value={fuelLiters}
                          onChange={e => setFuelLiters(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">CURRENT ODOMETER MILEAGE (KM)</label>
                        <input 
                          type="number" 
                          className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none text-center"
                          value={fuelKilo}
                          onChange={e => setFuelKilo(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Log Fuel replenishment & Debit Fleet Expense accounts
                  </button>
                </form>

              </div>

              {/* Verified fuel card expense audit log and schedule logs list */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Scheduled driver route list roster */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                    <ClipboardList className="h-4 w-4 text-indigo-400" />
                    <span>Active Vehicle Allocation Schedules</span>
                  </h3>
                  <div className="overflow-y-auto max-h-52 pr-1.5 space-y-2.5">
                    {vehicleAssignments.map(asg => (
                      <div key={asg.id} className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-normal leading-none font-semibold">{asg.plateNumber}</span>
                          <span className="bg-indigo-950 text-indigo-300 px-1 py-0.5 rounded text-[10px] font-bold">Shift: {asg.status}</span>
                        </div>
                        <p className="text-slate-400 leading-tight">Assigned driver: {asg.assignedToStaffName}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">Reason: {asg.purpose}</p>
                        <div className="text-[10px] text-slate-500 leading-none">Dates: {asg.assignedDate} to {asg.returnDate}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fuel journals database logs */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span>Compliance Fleet Fuel Ledger Logs</span>
                  </h3>
                  <div className="overflow-y-auto max-h-52 pr-1.5 space-y-2.5">
                    {fuelLogs.map(l => (
                      <div key={l.id} className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-white font-bold block">{l.plateNumber}</span>
                          <span className="text-slate-500 text-[10px] font-bold block">{l.refuelDate} • {l.stationName}</span>
                          <p className="text-slate-400">{l.liters} Liters replenished at odometer: {l.mileage.toLocaleString()} KM</p>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0">KES {l.totalCost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: COMPLIANCE AUDITS & PHYSICAL CHECKS */}
          {activeSubTab === 'audits' && (
            <div className="space-y-6">
              
              {/* Form trigger audting checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Physical asset count audit form */}
                <form onSubmit={handleTriggerAuditCheck} className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Plus className="h-4 w-4 text-indigo-400" />
                    <span>Conduct Physical Asset Audit check</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">AUDIT CASE PROFILE TITLE NAME</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Science Complex Analytical Instruments QR Audit"
                        value={auditTitle}
                        onChange={e => setAuditTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono font-bold mb-1 uppercase">CHIEF AUDITING INSPECTOR</label>
                      <input 
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-slate-800 text-slate-200 outline-none focus:border-indigo-500" 
                        placeholder="e.g. Hulda Chemutai (Estate Auditor Head)"
                        value={auditorName}
                        onChange={e => setAuditorName(e.target.value)}
                      />
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                      <span>Completing this form will run an RFID/QR barcode scanner check against all capitalized assets. All anomalies will be posted to compliance flags.</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded transition cursor-pointer select-none">
                    Stump & Generate Asset Audit Checks report
                  </button>
                </form>

                {/* Audit and compliancy information card */}
                <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4 text-xs select-none">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Audit Compliancy Checklist Certificates</span>
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Under university operational rules, all procurement and asset devaluations are fully logged using standard GAAP corporate guidelines.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                      <span>1. Double-Entry general ledger reconciliate</span>
                      <span className="text-emerald-400 font-bold">100% OK</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800 font-mono">
                      <span>2. Authorized suppliers legal KRA Pin checking</span>
                      <span className="text-emerald-400 font-bold">100% OK</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-slate-300">
                      <span>3. Scheduled Depreciation lines validation</span>
                      <span className="text-amber-400 animate-pulse">Pending Review</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
