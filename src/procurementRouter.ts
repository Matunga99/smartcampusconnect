import express from 'express';
import fs from 'fs';
import path from 'path';

// Define DB helper to avoid circular modules
const DB_PATH = path.join(process.cwd(), 'db.json');

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function logAudit(db: any, action: string, userId: string, entityId: string, schoolId: string, details: string) {
  if (!db.audit_logs) db.audit_logs = [];
  db.audit_logs.push({
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    action,
    userId: userId || 'SYSTEM',
    entityId,
    timestamp: new Date().toISOString(),
    schoolId,
    details
  });
}

export const procurementRouter = express.Router();

// Seed initial Phase 10 demo values if empty
function seedPhase10Data(db: any, schoolId: string) {
  let dirty = false;

  if (!db.campuses || db.campuses.length === 0) {
    db.campuses = [
      { id: 'camp-main', schoolId, name: 'Main Campus', code: 'MAIN', address: 'Nairobi HQ' },
      { id: 'camp-west', schoolId, name: 'Mombasa Road Satellite Campus', code: 'WEST', address: 'Mombasa Road Space Unit' }
    ];
    dirty = true;
  }

  if (!db.suppliers || db.suppliers.length === 0) {
    db.suppliers = [
      { id: 'sup-1', schoolId, name: 'Kipor & Partners ICT Supplies Ltd', category: 'ICT Equipment', kraPin: 'P051123450Z', rating: 4.8, address: 'Kimathi Street, Nairobi', email: 'sales@kiporict.co.ke', phone: '+254 711 222 333', contactPerson: 'Julius Kipor', status: 'Active' },
      { id: 'sup-2', schoolId, name: 'Mombasa Road Fuel Station & Oils', category: 'Vehicle Supplies', kraPin: 'P061987654Z', rating: 4.5, address: 'Mombasa Road, Nairobi', email: 'fleet@mombasaoils.com', phone: '+254 722 555 666', contactPerson: 'Fatma Ali', status: 'Active' },
      { id: 'sup-3', schoolId, name: 'Alpha Lab Scientific Equipment Corp', category: 'Laboratory Supplies', kraPin: 'P072345678W', rating: 4.9, address: 'Industrial Area, Nairobi', email: 'info@alphascientific.com', phone: '+254 733 999 111', contactPerson: 'Edwin Koech', status: 'Active' },
      { id: 'sup-4', schoolId, name: 'Crown Furniture & General Stationers', category: 'Furniture', kraPin: 'P081112223X', rating: 4.2, address: 'Ngong Road, Nairobi', email: 'contracts@crownfurniture.co.ke', phone: '+254 744 888 222', contactPerson: 'Mary Wanjiku', status: 'Active' }
    ];
    dirty = true;
  }

  if (!db.inventory_categories || db.inventory_categories.length === 0) {
    db.inventory_categories = [
      { id: 'cat-office', schoolId, name: 'Office Supplies', description: 'Papers, pens, printer ink, registers' },
      { id: 'cat-ict', schoolId, name: 'ICT Equipment & Spares', description: 'Cat6 Cables, patch panels, RAM chips, keyboards' },
      { id: 'cat-lab', schoolId, name: 'Laboratory Supplies', description: 'Beakers, test tubes, reagents, chemical acids' },
      { id: 'cat-library', schoolId, name: 'Library Supplies', description: 'Barcoding stickers, dust sleeves, index cards' },
      { id: 'cat-maintenance', schoolId, name: 'Maintenance Materials', description: 'Bulbs, cement bags, copper tubes, lubricants' },
      { id: 'cat-hostel', schoolId, name: 'Hostel Supplies', description: 'Mattresses, door locks, washroom fittings' },
      { id: 'cat-medical', schoolId, name: 'Medical Supplies', description: 'Bandages, painkillers, clinical spirit' }
    ];
    dirty = true;
  }

  if (!db.inventory_stores || db.inventory_stores.length === 0) {
    db.inventory_stores = [
      { id: 'store-main', schoolId, name: 'Central University Warehouse', location: 'Administrative wing basement', custodianName: 'Hulda Chemutai' },
      { id: 'store-lab', schoolId, name: 'Science Lab Auxiliary Store', location: 'Physical Sciences Annex room 4', custodianName: 'Dennis Okello' },
      { id: 'store-hostel', schoolId, name: 'Estate & Hostel Maintenance Workshop', location: 'Hostel block A rear yard', custodianName: 'Timothy Kamau' }
    ];
    dirty = true;
  }

  if (!db.inventory_items || db.inventory_items.length === 0) {
    db.inventory_items = [
      { id: 'item-1', schoolId, name: 'A4 Photocopy Paper Reams', sku: 'INV-OFF-001', categoryId: 'cat-office', categoryName: 'Office Supplies', storeId: 'store-main', storeName: 'Central University Warehouse', currentStock: 250, reorderLevel: 50, unit: 'Reams', unitPrice: 750 },
      { id: 'item-2', schoolId, name: 'RJ45 Connectors Set (100pcs)', sku: 'INV-ICT-104', categoryId: 'cat-ict', categoryName: 'ICT Equipment & Spares', storeId: 'store-main', storeName: 'Central University Warehouse', currentStock: 18, reorderLevel: 5, unit: 'Packs', unitPrice: 1200 },
      { id: 'item-3', schoolId, name: 'Surgical Hand Gloves', sku: 'INV-MED-092', categoryId: 'cat-medical', categoryName: 'Medical Supplies', storeId: 'store-main', storeName: 'Central University Warehouse', currentStock: 400, reorderLevel: 100, unit: 'Pairs', unitPrice: 45 },
      { id: 'item-4', schoolId, name: 'Standard Twin-tube LED Bulbs 40W', sku: 'INV-MNT-440', categoryId: 'cat-maintenance', categoryName: 'Maintenance Materials', storeId: 'store-hostel', storeName: 'Estate & Hostel Maintenance Workshop', currentStock: 85, reorderLevel: 20, unit: 'Units', unitPrice: 850 }
    ];
    dirty = true;
  }

  if (!db.asset_categories || db.asset_categories.length === 0) {
    db.asset_categories = [
      { id: 'ast-cat-comp', schoolId, name: 'Computers & Laptops', code: 'ICT-COMP', description: 'Academic workstations and official laptops' },
      { id: 'ast-cat-veh', schoolId, name: 'University Vehicles & Bus Fleet', code: 'FLEET', description: 'Vans, staff transport and students buses' },
      { id: 'ast-cat-lab', schoolId, name: 'Laboratory Analytical Instruments', code: 'LAB-EQUIP', description: 'High scale microscopes and spectrometers' },
      { id: 'ast-cat-net', schoolId, name: 'Networking & Telecom Hardware', code: 'TELECOM', description: 'Routers, patch switches and fiber nodes' },
      { id: 'ast-cat-gen', schoolId, name: 'Power Generators & Sub-stations', code: 'POWER', description: 'Backups and stepdown electrical modules' }
    ];
    dirty = true;
  }

  if (!db.assets || db.assets.length === 0) {
    db.assets = [
      {
        id: 'ast-1',
        schoolId,
        assetTag: 'ASSET-ICT-00001',
        name: 'HP ZBook Studio Academical Server Laptop',
        serialNumber: 'CND440192A',
        categoryId: 'ast-cat-comp',
        categoryName: 'Computers & Laptops',
        type: 'Computers',
        purchasePrice: 185000,
        purchaseDate: '2025-01-10',
        usefulLifeYears: 5,
        salvageValue: 30000,
        depreciationMethod: 'Straight Line',
        currentBookValue: 154000,
        status: 'Assigned',
        buildingId: 'bld-science',
        roomId: 'room-cs-lab',
        qrCode: 'qr-ast-1',
        barcode: 'BAR-ICT-00001'
      },
      {
        id: 'ast-2',
        schoolId,
        assetTag: 'ASSET-PWR-00100',
        name: 'Perkins 150KVA Automatic Diesel Backup Generator',
        serialNumber: 'PK-GEN-889012Z',
        categoryId: 'ast-cat-gen',
        categoryName: 'Power Generators & Sub-stations',
        type: 'Generators',
        purchasePrice: 1650000,
        purchaseDate: '2024-06-15',
        usefulLifeYears: 10,
        salvageValue: 200000,
        depreciationMethod: 'Straight Line',
        currentBookValue: 1362500,
        status: 'Maintained',
        buildingId: 'bld-admin',
        roomId: 'room-powerhouse',
        qrCode: 'qr-ast-2',
        barcode: 'BAR-PWR-00100'
      }
    ];
    dirty = true;
  }

  if (!db.devices || db.devices.length === 0) {
    db.devices = [
      { id: 'dev-1', schoolId, name: 'HOD Computer Science Workstation', type: 'Desktop', specs: 'Intel i9, 32GB RAM, 1TB SSD', ipAddress: '192.168.10.45', MACAddress: '6F:45:90:AB:89:12', currentUser: 'Prof. Richard Feynman', status: 'ACTIVE' },
      { id: 'dev-2', schoolId, name: 'Registrar Academic Affairs Laptop', type: 'Laptop', specs: 'Lenovo ThinkPad X1 Carbon 16GB RAM', ipAddress: '192.168.10.101', MACAddress: '9C:EF:01:2C:4E:99', currentUser: 'Dr. Catherine Wood', status: 'ACTIVE' }
    ];
    dirty = true;
  }

  if (!db.software_licenses || db.software_licenses.length === 0) {
    db.software_licenses = [
      { id: 'lic-1', schoolId, name: 'MATLAB Campus Wide License', licenseKey: 'MAT-CAM-88910-12093', totalSeats: 500, usedSeats: 247, expiryDate: '2027-06-30', status: 'ACTIVE' },
      { id: 'lic-2', schoolId, name: 'Office 365 Enterprise for Education', licenseKey: 'MS-365ED-AAAAA-BBBBB', totalSeats: 2500, usedSeats: 1890, expiryDate: '2027-12-31', status: 'ACTIVE' }
    ];
    dirty = true;
  }

  if (!db.network_assets || db.network_assets.length === 0) {
    db.network_assets = [
      { id: 'net-1', schoolId, name: 'Main Campus Backhaul Router', type: 'Router', ipAddress: '41.80.99.1', location: 'Administrative Server Rack 1', uplinkPort: '10G SFP+ Core', portCount: 24, status: 'ONLINE' },
      { id: 'net-2', schoolId, name: 'Science Complex PoE Access Switch', type: 'Switch', ipAddress: '192.168.50.2', location: 'Science Building Floor 2 IDF', uplinkPort: '1G Fiber Link 1', portCount: 48, status: 'ONLINE' }
    ];
    dirty = true;
  }

  if (!db.server_assets || db.server_assets.length === 0) {
    db.server_assets = [
      { id: 'srv-1', schoolId, name: 'Primary Student ERP Database Server', purpose: 'Hosting the transactional PostgreSQL records', ramGb: 128, storageGb: 4096, os: 'Ubuntu Server 24.04 LTS', ipAddress: '192.168.12.50', status: 'ONLINE' },
      { id: 'srv-2', schoolId, name: 'Central Authentication & Active Directory Domain', purpose: 'User logins and authorization nodes', ramGb: 32, storageGb: 500, os: 'Windows Server 2022', ipAddress: '192.168.12.10', status: 'ONLINE' }
    ];
    dirty = true;
  }

  if (!db.buildings || db.buildings.length === 0) {
    db.buildings = [
      { id: 'bld-science', schoolId, campusId: 'camp-main', name: 'Main Science Complex Block', code: 'MSC', floorsCount: 4, description: 'Hosting departments of Physics, Chemistry & Computer Science, with experimental bio-labs' },
      { id: 'bld-admin', schoolId, campusId: 'camp-main', name: 'Administration Plaza', code: 'ADMIN', floorsCount: 2, description: 'Registrar offices, board rooms and central finance counters' },
      { id: 'bld-theatre', schoolId, campusId: 'camp-main', name: 'Albert Einstein Lecture Theatre complex', code: 'TH-EINS', floorsCount: 1, description: 'Grand lecture theatres A, B and auxiliary seminar halls' }
    ];
    dirty = true;
  }

  if (!db.facility_rooms || db.facility_rooms.length === 0) {
    db.facility_rooms = [
      { id: 'room-cs-lab', room_id: 'room-cs-lab', schoolId, campusId: 'camp-main', buildingId: 'bld-science', buildingName: 'Main Science Complex Block', roomNumber: 'CS-LAB-4A', name: 'CS Department Lab A', room_name: 'CS Department Lab A', type: 'LABORATORY', room_type: 'LABORATORY', capacity: 60, status: 'ACTIVE' },
      { id: 'room-th2', room_id: 'room-th2', schoolId, campusId: 'camp-main', buildingId: 'bld-theatre', buildingName: 'Albert Einstein Lecture Theatre complex', roomNumber: 'LT-2', name: 'Grand Lecture Theatre 2', room_name: 'Grand Lecture Theatre 2', type: 'LECTURE_HALL', room_type: 'LECTURE_HALL', capacity: 250, status: 'ACTIVE' },
      { id: 'room-fin-ctr', room_id: 'room-fin-ctr', schoolId, campusId: 'camp-main', buildingId: 'bld-admin', buildingName: 'Administration Plaza', roomNumber: 'ADM-103', name: 'Central Student Fee Counter', room_name: 'Central Student Fee Counter', type: 'OFFICE', room_type: 'OFFICE', capacity: 15, status: 'ACTIVE' }
    ];
    dirty = true;
  }

  if (!db.purchase_requests || db.purchase_requests.length === 0) {
    db.purchase_requests = [
      {
        id: 'pr-1',
        schoolId,
        departmentId: 'dept-cs',
        title: 'Computer Science Practical Exam LAN Cabling & Bulbs Spares',
        requisitionNumber: 'REQ-2026-0005',
        items: [
          { name: 'Cat6 Ethernet Cable Boxes (305m)', qty: 3, estimatedUnitCost: 15000, estimatedTotalCost: 45000 },
          { name: 'Standard Twin-tube LED Bulbs 40W', qty: 10, estimatedUnitCost: 850, estimatedTotalCost: 8500 }
        ],
        estimatedTotal: 53500,
        urgency: 'high',
        description: 'Critical materials needed to rewire computer labs ahead of semester end practical programming examinations.',
        hodStatus: 'approved',
        procurementStatus: 'pending',
        financeStatus: 'pending',
        finalStatus: 'processing',
        createdBy: 'Prof. Richard Feynman',
        createdAt: '2026-05-25T08:30:12Z'
      }
    ];
    dirty = true;
  }

  if (!db.vehicle_assignments || db.vehicle_assignments.length === 0) {
    db.vehicle_assignments = [
      { id: 'va-1', schoolId, vehicleId: 'veh-1', plateNumber: 'KBH 102Z', assignedToStaffId: 'staff-402', assignedToStaffName: 'Prof. Newton HOD Physical Sciences', assignedDate: '2026-06-02', returnDate: '2026-06-03', purpose: 'Transporting special delegates for Physics Summit in Nakuru', status: 'Active' }
    ];
    dirty = true;
  }

  if (!db.fuel_logs || db.fuel_logs.length === 0) {
    db.fuel_logs = [
      { id: 'fuel-1', schoolId, vehicleId: 'veh-1', plateNumber: 'KBH 102Z', refuelDate: '2026-05-28', liters: 45, costPerLiter: 189.5, totalCost: 8527.5, mileage: 124500, receiptNumber: 'REC-KOBIL-88902', stationName: 'Kobil Main Highway Station' }
    ];
    dirty = true;
  }

  if (!db.service_logs || db.service_logs.length === 0) {
    db.service_logs = [
      { id: 'serv-1', schoolId, vehicleId: 'veh-2', plateNumber: 'KDM 980A', serviceDate: '2026-05-18', cost: 14500, description: 'Engine oil flush, replacement of worn out front brake pads & alignment', providerName: 'Toyota Kenya Highway Garage', nextServiceMileage: 88500, mileageAtService: 83500 }
    ];
    dirty = true;
  }

  if (!db.maintenance_requests || db.maintenance_requests.length === 0) {
    db.maintenance_requests = [
      { id: 'maint-req-1', schoolId, buildingId: 'bld-science', roomId: 'room-cs-lab', roomNumber: 'CS-LAB-4A', title: 'Flickering LED tube lights on Desk C Row', description: 'Three tube lights are constantly flashing, causing eye straining during academic hours.', reporterName: 'Dr. Jane Goodall', reporterRole: 'Lecturer', priority: 'Medium', status: 'Work Order Created', reporterId: 'staff-temp', createdAt: '2026-05-29T10:11:00Z' }
    ];
    dirty = true;
  }

  if (!db.maintenance_work_orders || db.maintenance_work_orders.length === 0) {
    db.maintenance_work_orders = [
      { id: 'maint-wo-1', schoolId, requestId: 'maint-req-1', woNumber: 'WO-2026-015', assignedTo: 'Timothy Kamau', estimatedCost: 3400, materialCost: 2500, laborCost: 900, status: 'In Progress', createdAt: '2026-05-30T09:00:00Z' }
    ];
    dirty = true;
  }

  if (dirty) {
    writeDb(db);
  }
}

// --------------------------------------------------------------------------
// 1. PROCUREMENT APIs
// --------------------------------------------------------------------------

procurementRouter.get('/procurement/suppliers', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  const list = (db.suppliers || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.post('/procurement/suppliers', (req: any, res) => {
  const db = readDb();
  const { name, category, kraPin, email, phone, contactPerson, rating, address } = req.body;
  if (!name || !kraPin) return res.status(400).json({ error: 'Name and KRA pin required' });
  
  const supplier = {
    id: 'sup-' + Date.now().toString(),
    schoolId: req.user.schoolId,
    name,
    category: category || 'General Store',
    kraPin,
    rating: Number(rating) || 5.0,
    address: address || '',
    email: email || '',
    phone: phone || '',
    contactPerson: contactPerson || 'General Agent',
    status: 'Active'
  };
  
  if (!db.suppliers) db.suppliers = [];
  db.suppliers.push(supplier);
  writeDb(db);
  res.json({ success: true, supplier });
});

procurementRouter.get('/procurement/requests', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  const list = (db.purchase_requests || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.post('/procurement/requests', (req: any, res) => {
  const db = readDb();
  const { title, items, description, urgency } = req.body;
  if (!title || !items || items.length === 0) return res.status(400).json({ error: 'Requisition requires title and items' });

  const total = items.reduce((acc: number, curr: any) => acc + (Number(curr.qty) * Number(curr.estimatedUnitCost)), 0);
  const reqNo = 'REQ-' + Math.floor(1000 + Math.random() * 9000).toString();
  
  const purchaseRequest = {
    id: 'pr-' + Date.now().toString(),
    schoolId: req.user.schoolId,
    departmentId: req.user.departmentId || 'dept-cs',
    title,
    requisitionNumber: reqNo,
    items: items.map((i: any) => ({
      name: i.name,
      qty: Number(i.qty),
      estimatedUnitCost: Number(i.estimatedUnitCost),
      estimatedTotalCost: Number(i.qty) * Number(i.estimatedUnitCost)
    })),
    estimatedTotal: total,
    urgency: urgency || 'medium',
    description: description || '',
    hodStatus: 'pending',
    procurementStatus: 'pending',
    financeStatus: 'pending',
    finalStatus: 'pending',
    createdBy: req.user.name || 'Staff User',
    createdAt: new Date().toISOString()
  };

  if (!db.purchase_requests) db.purchase_requests = [];
  db.purchase_requests.push(purchaseRequest);
  writeDb(db);
  res.json({ success: true, purchaseRequest });
});

procurementRouter.post('/procurement/requests/:id/approve', (req: any, res) => {
  const db = readDb();
  const { role } = req.body; // 'HOD' or 'Procurement' or 'Finance'
  const targetRequest = (db.purchase_requests || []).find((p: any) => p.id === req.params.id);
  if (!targetRequest) return res.status(404).json({ error: 'Purchase request not found' });

  if (role === 'HOD') {
    targetRequest.hodStatus = 'approved';
    targetRequest.finalStatus = 'processing';
  } else if (role === 'Procurement') {
    targetRequest.procurementStatus = 'approved';
  } else if (role === 'Finance') {
    targetRequest.financeStatus = 'approved';
    targetRequest.finalStatus = 'approved';

    // DIRECT INTERLOCK: Automagically generate PO from approved purchase request
    const poNo = 'PO-2026-' + Math.floor(10000 + Math.random() * 89999).toString();
    const po = {
      id: 'po-' + Date.now().toString(),
      schoolId: req.user.schoolId,
      purchaseRequestId: targetRequest.id,
      poNumber: poNo,
      supplierId: 'sup-1', // default supplier from seed
      supplierName: 'Kipor & Partners ICT Supplies Ltd',
      items: targetRequest.items.map((it: any) => ({
        name: it.name,
        qty: it.qty,
        unitCost: it.estimatedUnitCost,
        totalCost: it.estimatedTotalCost
      })),
      totalAmount: targetRequest.estimatedTotal,
      terms: 'Net 30 cash on delivery',
      deliveryAddress: 'Main Science Complex lobby',
      status: 'Sent',
      createdBy: 'Procurement Automations Engine',
      createdAt: new Date().toISOString()
    };
    if (!db.purchase_orders) db.purchase_orders = [];
    db.purchase_orders.push(po);
  }

  writeDb(db);
  res.json({ success: true, purchaseRequest: targetRequest });
});

procurementRouter.get('/procurement/orders', (req: any, res) => {
  const db = readDb();
  const list = (db.purchase_orders || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.post('/procurement/orders', (req: any, res) => {
  const db = readDb();
  const { supplierId, items, deliveryAddress } = req.body;
  if (!supplierId || !items || items.length === 0) return res.status(400).json({ error: 'PO requires supplier and items list' });

  const supp = db.suppliers.find((s: any) => s.id === supplierId);
  const total = items.reduce((acc: number, curr: any) => acc + (Number(curr.qty) * Number(curr.unitCost)), 0);
  const poNo = 'PO-2026-' + Math.floor(10000 + Math.random() * 89999);

  const po = {
    id: 'po-' + Date.now().toString(),
    schoolId: req.user.schoolId,
    purchaseRequestId: null,
    poNumber: poNo,
    supplierId,
    supplierName: supp ? supp.name : 'Unknown Vendor',
    items: items.map((i: any) => ({
      name: i.name,
      qty: Number(i.qty),
      unitCost: Number(i.unitCost),
      totalCost: Number(i.qty) * Number(i.unitCost)
    })),
    totalAmount: total,
    terms: 'Net 30 days invoice policy',
    deliveryAddress: deliveryAddress || 'Main Stores Office',
    status: 'Sent',
    createdBy: req.user.name || 'Procurement Officer',
    createdAt: new Date().toISOString()
  };

  if (!db.purchase_orders) db.purchase_orders = [];
  db.purchase_orders.push(po);
  writeDb(db);
  res.json({ success: true, po });
});

procurementRouter.post('/procurement/orders/:id/deliver', (req: any, res) => {
  const db = readDb();
  const po = (db.purchase_orders || []).find((p: any) => p.id === req.params.id);
  if (!po) return res.status(404).json({ error: 'Purchase order not found' });

  po.status = 'Delivered';
  po.deliveredAt = new Date().toISOString();

  // 1. Generate GRN (Goods Received Note)
  const grnNo = 'GRN-2026-' + Math.floor(20000 + Math.random() * 79999);
  const grn = {
    id: 'grn-' + Date.now().toString(),
    schoolId: req.user.schoolId,
    purchaseOrderId: po.id,
    grnNumber: grnNo,
    receivedItems: po.items.map((it: any) => ({
      name: it.name,
      qtyOrdered: it.qty,
      qtyReceived: it.qty,
      condition: 'Excellent / sealed pack'
    })),
    receivedDate: new Date().toISOString(),
    receivedBy: req.user.name || 'Store Custodian',
    remarks: 'Delivered in full, packaging intact.',
    status: 'Completed'
  };
  if (!db.goods_received_notes) db.goods_received_notes = [];
  db.goods_received_notes.push(grn);

  // 2. Generate Vendor Invoice
  const invNo = 'INV-' + Math.floor(100000 + Math.random() * 899999).toString();
  const invoice = {
    id: 'vinv-' + Date.now().toString(),
    schoolId: req.user.schoolId,
    purchaseOrderId: po.id,
    invoiceNumber: invNo,
    billingAmount: po.totalAmount,
    status: 'Unpaid',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0]
  };
  if (!db.vendor_invoices) db.vendor_invoices = [];
  db.vendor_invoices.push(invoice);

  // 3. Increment stock if matching items exist in inventory!
  po.items.forEach((poItem: any) => {
    const invItem = (db.inventory_items || []).find((i: any) => i.name.toLowerCase().includes(poItem.name.toLowerCase()));
    if (invItem) {
      invItem.currentStock += poItem.qty;
      // Record stock movement
      db.stock_movements.push({
        id: 'mov-' + Date.now().toString() + '-' + Math.floor(Math.random() * 1000),
        schoolId: req.user.schoolId,
        itemId: invItem.id,
        itemName: invItem.name,
        type: 'IN',
        qty: poItem.qty,
        fromStoreId: 'SUPPLIER_DELIVERY_GATEWAY',
        toStoreId: invItem.storeId,
        reference: grnNo,
        remarks: `Autogenerated stock replenishment from GRN: ${grnNo}`,
        createdBy: req.user.name || 'System Auto Replenish',
        createdAt: new Date().toISOString()
      });
    }
  });

  writeDb(db);
  res.json({ success: true, po, grn, invoice });
});

procurementRouter.get('/procurement/invoices', (req: any, res) => {
  const db = readDb();
  const list = (db.vendor_invoices || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.post('/procurement/invoices/:id/pay', (req: any, res) => {
  const db = readDb();
  const vinv = (db.vendor_invoices || []).find((v: any) => v.id === req.params.id);
  if (!vinv) return res.status(404).json({ error: 'Vendor invoice not resolved' });
  if (vinv.status === 'Paid') return res.status(400).json({ error: 'Invoice is already settled' });

  const pRef = 'CBK-DISB-' + Math.floor(100000 + Math.random() * 899999) + '-STTY';
  vinv.status = 'Paid';
  vinv.paymentRef = pRef;
  vinv.paidAt = new Date().toISOString();

  // Set matching PO status to paid
  const po = (db.purchase_orders || []).find((p: any) => p.id === vinv.purchaseOrderId);
  if (po) po.status = 'Paid';

  // DIRECT ACCRUAL FINANCE INTEGRATION
  if (!db.double_entry_transactions) db.double_entry_transactions = [];
  db.double_entry_transactions.push({
    id: 'tx_cap_' + Date.now() + '_proc',
    schoolId: req.user.schoolId,
    studentId: 'SYSTEM_PROCUREMENT_' + (po ? po.supplierId : 'VENDOR'),
    amount: vinv.billingAmount,
    method: 'SUPPLIER_ELECTRONIC_SETTLEMENT',
    reference: pRef,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, invoice: vinv });
});

// --------------------------------------------------------------------------
// 2. INVENTORY APIs
// --------------------------------------------------------------------------

procurementRouter.get('/inventory/categories', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  const list = (db.inventory_categories || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.get('/inventory/stores', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  const list = (db.inventory_stores || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.get('/inventory/items', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  const list = (db.inventory_items || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

procurementRouter.post('/inventory/items', (req: any, res) => {
  const db = readDb();
  const { name, categoryId, storeId, currentStock, reorderLevel, unit, unitPrice } = req.body;
  if (!name || !categoryId || !storeId) return res.status(400).json({ error: 'Name, Category, and Store are required' });

  const cat = db.inventory_categories.find((c: any) => c.id === categoryId);
  const store = db.inventory_stores.find((st: any) => st.id === storeId);
  const sku = 'INV-' + (cat ? cat.name.substring(0,3).toUpperCase() : 'GEN') + '-' + Math.floor(100 + Math.random() * 899);

  const item = {
    id: 'item-' + Date.now(),
    schoolId: req.user.schoolId,
    name,
    sku,
    categoryId,
    categoryName: cat ? cat.name : 'Unassigned',
    storeId,
    storeName: store ? store.name : 'Unassigned',
    currentStock: Number(currentStock) || 0,
    reorderLevel: Number(reorderLevel) || 10,
    unit: unit || 'Pcs',
    unitPrice: Number(unitPrice) || 0
  };

  if (!db.inventory_items) db.inventory_items = [];
  db.inventory_items.push(item);
  writeDb(db);
  res.json({ success: true, item });
});

procurementRouter.post('/inventory/items/adjust', (req: any, res) => {
  const db = readDb();
  const { itemId, qtyAdjusted, type, reason } = req.body; // type: 'ADD' or 'SUBTRACT'
  const item = (db.inventory_items || []).find((i: any) => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const value = Number(qtyAdjusted);
  if (type === 'ADD') {
    item.currentStock += value;
  } else {
    item.currentStock = Math.max(0, item.currentStock - value);
  }

  // Log stock adjustments
  if (!db.stock_adjustments) db.stock_adjustments = [];
  db.stock_adjustments.push({
    id: 'adj-' + Date.now(),
    schoolId: req.user.schoolId,
    itemId,
    qtyAdjusted: value,
    type,
    reason: reason || 'Routine annual audit adjustment',
    approvedBy: req.user.name || 'Inventory Supervisor',
    createdAt: new Date().toISOString()
  });

  // Log movement as well
  if (!db.stock_movements) db.stock_movements = [];
  db.stock_movements.push({
    id: 'mov-' + Date.now(),
    schoolId: req.user.schoolId,
    itemId: item.id,
    itemName: item.name,
    type: type === 'ADD' ? 'IN' : 'OUT',
    qty: value,
    fromStoreId: type === 'ADD' ? 'DEVIATION_SETTLEMENT' : item.storeId,
    toStoreId: type === 'ADD' ? item.storeId : 'DEVIATION_DISPOSAL',
    reference: 'STOCK-ADJUSTMENT-AUDIT',
    remarks: `Adjustment approval note: ${reason}`,
    createdBy: req.user.name || 'System Auditor',
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, item });
});

procurementRouter.get('/inventory/movements', (req: any, res) => {
  const db = readDb();
  const list = (db.stock_movements || []).filter((s: any) => s.schoolId === req.user.schoolId);
  res.json(list);
});

// --------------------------------------------------------------------------
// 3. ASSETS & ICT DEVICE TRACKING APIs
// --------------------------------------------------------------------------

procurementRouter.get('/assets/categories', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.asset_categories || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.get('/assets', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.assets || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/assets', (req: any, res) => {
  const db = readDb();
  const { name, serialNumber, categoryId, type, purchasePrice, purchaseDate, usefulLifeYears } = req.body;
  if (!name || !categoryId || !type) return res.status(400).json({ error: 'Missing core asset attributes' });

  const cat = db.asset_categories.find((c: any) => c.id === categoryId);
  const tag = 'ASSET-' + (cat ? cat.code : 'GEN') + '-' + Math.floor(10000 + Math.random() * 89999).toString();

  const asset = {
    id: 'ast-' + Date.now(),
    schoolId: req.user.schoolId,
    assetTag: tag,
    name,
    serialNumber: serialNumber || 'N/A',
    categoryId,
    categoryName: cat ? cat.name : 'General Asset Category',
    type,
    purchasePrice: Number(purchasePrice) || 0,
    purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
    usefulLifeYears: Number(usefulLifeYears) || 5,
    salvageValue: Math.round((Number(purchasePrice) || 0) * 0.1),
    depreciationMethod: 'Straight Line',
    currentBookValue: Number(purchasePrice) || 0,
    status: 'Purchased',
    buildingId: '',
    roomId: '',
    qrCode: `qr-${tag}`,
    barcode: `BAR-${tag}`
  };

  if (!db.assets) db.assets = [];
  db.assets.push(asset);

  // Record asset capitalization expense transaction in ledger
  if (asset.purchasePrice > 0) {
    if (!db.double_entry_transactions) db.double_entry_transactions = [];
    db.double_entry_transactions.push({
      id: `tx_asset_cap_${Date.now()}`,
      schoolId: req.user.schoolId,
      studentId: 'SYSTEM_ASSETS_LEDGER',
      amount: asset.purchasePrice,
      method: "JOURNAL_VOUCHER_CAPITALIZATION",
      reference: `CAP_${tag}`,
      status: "SUCCESS",
      timestamp: new Date().toISOString()
    });
  }

  writeDb(db);
  res.json({ success: true, asset });
});

procurementRouter.delete('/assets/:id', (req: any, res) => {
  const db = readDb();
  const index = (db.assets || []).findIndex((a: any) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Asset not found' });

  db.assets.splice(index, 1);
  writeDb(db);
  res.json({ success: true });
});

procurementRouter.post('/assets/:id/assign', (req: any, res) => {
  const db = readDb();
  const { assignedToType, assignedToId, assignedToName, buildingId, roomId } = req.body;
  const asset = (db.assets || []).find((a: any) => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  asset.status = 'Assigned';
  if (buildingId) asset.buildingId = buildingId;
  if (roomId) asset.roomId = roomId;

  if (!db.asset_assignments) db.asset_assignments = [];
  db.asset_assignments.push({
    id: 'asg-' + Date.now(),
    schoolId: req.user.schoolId,
    assetId: asset.id,
    assetName: asset.name,
    assignedToType,
    assignedToId: assignedToId || 'SYSTEM_ROOM',
    assignedToName,
    assignedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    remarks: `Asset localized to environment: ${assignedToName}`
  });

  writeDb(db);
  res.json({ success: true, asset });
});

procurementRouter.post('/assets/:id/maintain', (req: any, res) => {
  const db = readDb();
  const { type, cost, description, performedBy } = req.body;
  const asset = (db.assets || []).find((a: any) => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  asset.status = 'Maintained';
  const cAmt = Number(cost) || 0;

  if (!db.asset_maintenance) db.asset_maintenance = [];
  db.asset_maintenance.push({
    id: 'mnt-' + Date.now(),
    schoolId: req.user.schoolId,
    assetId: asset.id,
    assetName: asset.name,
    type: type || 'Preventive',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: new Date().toISOString().split('T')[0],
    cost: cAmt,
    description: description || 'Routine preventative check and lubrication.',
    performedBy: performedBy || 'Estate Maintenance Team',
    status: 'Completed'
  });

  // LEDGER INTEG: Debit Maintenance Expense accounts
  if (cAmt > 0) {
    if (!db.double_entry_transactions) db.double_entry_transactions = [];
    db.double_entry_transactions.push({
      id: `tx_mnt_exp_${Date.now()}`,
      schoolId: req.user.schoolId,
      studentId: 'SYSTEM_FACILITIES_MAINTENANCE',
      amount: cAmt,
      method: 'CASH_IMPREST_PAYMENT',
      reference: `MNT_EX_TAG_${asset.assetTag}`,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    });
  }

  writeDb(db);
  res.json({ success: true, asset });
});

procurementRouter.post('/assets/:id/dispose', (req: any, res) => {
  const db = readDb();
  const { disposalMethod, saleAmount, remarks } = req.body;
  const asset = (db.assets || []).find((a: any) => a.id === req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  asset.status = 'Disposed';
  const val = Number(saleAmount) || 0;

  if (!db.asset_disposals) db.asset_disposals = [];
  db.asset_disposals.push({
    id: 'dsp-' + Date.now(),
    schoolId: req.user.schoolId,
    assetId: asset.id,
    assetName: asset.name,
    disposalDate: new Date().toISOString().split('T')[0],
    disposalMethod,
    saleAmount: val,
    approvedBy: req.user.name || 'Executive Audit Board',
    remarks: remarks || 'End of economic technical useful life.'
  });

  // LEDGER INTEG: Credit asset disposal revenue
  if (val > 0) {
    if (!db.double_entry_transactions) db.double_entry_transactions = [];
    db.double_entry_transactions.push({
      id: `tx_dispose_rec_${Date.now()}`,
      schoolId: req.user.schoolId,
      studentId: 'SYSTEM_ASSETS_LEDGER',
      amount: val,
      method: 'ELECTRONIC_CASH_RECEIPT',
      reference: `DISP_SALE_${asset.assetTag}`,
      status: 'SUCCESS',
      timestamp: new Date().toISOString()
    });
  }

  writeDb(db);
  res.json({ success: true, asset });
});

// ICT specific sub categories
procurementRouter.get('/ict/devices', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.devices || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/ict/devices', (req: any, res) => {
  const db = readDb();
  const { name, type, specs, ipAddress, macAddress, currentUser } = req.body;
  if (!name) return res.status(400).json({ error: 'Device name is required' });

  const dev = {
    id: 'dev-' + Date.now(),
    schoolId: req.user.schoolId,
    name,
    type,
    specs: specs || 'Intel core, standard RAM',
    ipAddress: ipAddress || '192.168.1.100',
    macAddressHash: macAddress || '00:11:22:33:44:55',
    currentUser: currentUser || 'CS Student Pool',
    status: 'ACTIVE'
  };

  if (!db.devices) db.devices = [];
  db.devices.push(dev);
  writeDb(db);
  res.json({ success: true, device: dev });
});

procurementRouter.get('/ict/licenses', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.software_licenses || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/ict/licenses', (req: any, res) => {
  const db = readDb();
  const { name, licenseKey, totalSeats, expiryDate } = req.body;
  if (!name || !licenseKey) return res.status(400).json({ error: 'License Name & Key required' });

  const lic = {
    id: 'lic-' + Date.now(),
    schoolId: req.user.schoolId,
    name,
    licenseKey,
    totalSeats: Number(totalSeats) || 10,
    usedSeats: 0,
    expiryDate: expiryDate || '2030-12-31',
    status: 'ACTIVE'
  };

  if (!db.software_licenses) db.software_licenses = [];
  db.software_licenses.push(lic);
  writeDb(db);
  res.json({ success: true, license: lic });
});

procurementRouter.get('/ict/network', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.network_assets || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/ict/network', (req: any, res) => {
  const db = readDb();
  const { name, type, ipAddress, location, portCount } = req.body;
  
  const na = {
    id: 'net-' + Date.now(),
    schoolId: req.user.schoolId,
    name,
    type,
    ipAddress,
    location,
    uplinkPort: '1G Fiber Link',
    portCount: Number(portCount) || 24,
    status: 'ONLINE'
  };

  if (!db.network_assets) db.network_assets = [];
  db.network_assets.push(na);
  writeDb(db);
  res.json({ success: true, networkAsset: na });
});

procurementRouter.get('/ict/servers', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.server_assets || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/ict/servers', (req: any, res) => {
  const db = readDb();
  const { name, purpose, ramGb, storageGb, os, ipAddress } = req.body;

  const srv = {
    id: 'srv-' + Date.now(),
    schoolId: req.user.schoolId,
    name,
    purpose,
    ramGb: Number(ramGb) || 16,
    storageGb: Number(storageGb) || 500,
    os,
    ipAddress,
    status: 'ONLINE'
  };

  if (!db.server_assets) db.server_assets = [];
  db.server_assets.push(srv);
  writeDb(db);
  res.json({ success: true, server: srv });
});

// --------------------------------------------------------------------------
// 4. FACILITIES & MAINTENANCE APIs
// --------------------------------------------------------------------------

// Campuses GET, POST, DELETE
procurementRouter.get('/facilities/campuses', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.campuses || []).filter((c: any) => c.schoolId === req.user.schoolId));
});

procurementRouter.post('/facilities/campuses', (req: any, res) => {
  const db = readDb();
  const { name, code, address } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Campus Name and Code are required' });

  // Uniqueness check
  const nameCollision = (db.campuses || []).some((c: any) => c.schoolId === req.user.schoolId && c.name.toLowerCase().trim() === name.toLowerCase().trim());
  const codeCollision = (db.campuses || []).some((c: any) => c.schoolId === req.user.schoolId && c.code.toLowerCase().trim() === code.toLowerCase().trim());
  
  if (nameCollision) return res.status(400).json({ error: `Campus name "${name}" already exists` });
  if (codeCollision) return res.status(400).json({ error: `Campus code "${code}" already exists` });

  const camp = {
    id: 'camp-' + Date.now(),
    schoolId: req.user.schoolId,
    name: name.trim(),
    code: code.toUpperCase().trim(),
    address: address || ''
  };

  if (!db.campuses) db.campuses = [];
  db.campuses.push(camp);
  logAudit(db, 'CREATE_CAMPUS', req.user.id, camp.id, req.user.schoolId, `Created campus "${camp.name}"`);
  writeDb(db);
  res.json({ success: true, campus: camp });
});

procurementRouter.delete('/facilities/campuses/:id', (req: any, res) => {
  const db = readDb();
  const campId = req.params.id;

  // Prevent deletion if buildings exist in this campus
  const hasBuildings = (db.buildings || []).some((b: any) => b.campusId === campId);
  if (hasBuildings) {
    return res.status(400).json({ error: 'Cannot delete Campus: Active buildings exist in this campus. Please delete or migrate them first.' });
  }

  const index = (db.campuses || []).findIndex((c: any) => c.id === campId && c.schoolId === req.user.schoolId);
  if (index === -1) return res.status(404).json({ error: 'Campus not found' });

  db.campuses.splice(index, 1);
  logAudit(db, 'DELETE_CAMPUS', req.user.id, campId, req.user.schoolId, 'Deleted campus');
  writeDb(db);
  res.json({ success: true, message: 'Campus deleted successfully' });
});

procurementRouter.get('/facilities/buildings', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.buildings || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/facilities/buildings', (req: any, res) => {
  const db = readDb();
  const { name, code, floorsCount, description, campusId } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and Code are required' });
  if (!campusId) return res.status(400).json({ error: 'Campus ID is required: A Building cannot exist without a Campus.' });

  // Validate campus exists
  const parentCamp = (db.campuses || []).find((c: any) => c.id === campusId);
  if (!parentCamp) return res.status(400).json({ error: `Selected Campus ID "${campusId}" does not exist.` });

  // Unique name within same campus
  const bldCollision = (db.buildings || []).some((b: any) => 
    b.schoolId === req.user.schoolId && 
    b.campusId === campusId && 
    b.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
  if (bldCollision) return res.status(400).json({ error: `Building "${name}" already exists in the selected campus.` });

  const bld = {
    id: 'bld-' + Date.now(),
    schoolId: req.user.schoolId,
    campusId,
    name: name.trim(),
    code: code.toUpperCase().trim(),
    floorsCount: Number(floorsCount) || 1,
    description: description || ''
  };

  if (!db.buildings) db.buildings = [];
  db.buildings.push(bld);
  logAudit(db, 'CREATE_BUILDING', req.user.id, bld.id, req.user.schoolId, `Created building "${bld.name}"`);
  writeDb(db);
  res.json({ success: true, building: bld });
});

procurementRouter.delete('/facilities/buildings/:id', (req: any, res) => {
  const db = readDb();
  const bldId = req.params.id;

  // Prevent deletion if rooms exist in this building
  const hasRooms = (db.facility_rooms || []).some((r: any) => r.buildingId === bldId);
  if (hasRooms) {
    return res.status(400).json({ error: 'Cannot delete Building: Rooms exist in this building. Please delete them first.' });
  }

  const index = (db.buildings || []).findIndex((b: any) => b.id === bldId && b.schoolId === req.user.schoolId);
  if (index === -1) return res.status(404).json({ error: 'Building not found' });

  db.buildings.splice(index, 1);
  logAudit(db, 'DELETE_BUILDING', req.user.id, bldId, req.user.schoolId, 'Deleted building');
  writeDb(db);
  res.json({ success: true, message: 'Building deleted successfully' });
});

procurementRouter.get('/facilities/rooms', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.facility_rooms || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/facilities/rooms', (req: any, res) => {
  const db = readDb();
  const { buildingId, roomNumber, name, type, room_type, capacity, status } = req.body;
  if (!buildingId || !roomNumber) return res.status(400).json({ error: 'Building and Room Number required' });

  // A Room cannot exist without a Building
  const bld = db.buildings.find((b: any) => b.id === buildingId);
  if (!bld) return res.status(400).json({ error: `Selected Building ID "${buildingId}" does not exist.` });

  // Room names/no must be unique within the same building
  const finalRoomNo = roomNumber.trim();
  const finalName = (name || `Room ${roomNumber}`).trim();
  const roomCollision = (db.facility_rooms || []).some((r: any) => 
    r.buildingId === buildingId && 
    (r.roomNumber.toLowerCase().trim() === finalRoomNo.toLowerCase() || 
     r.name.toLowerCase().trim() === finalName.toLowerCase())
  );
  if (roomCollision) return res.status(400).json({ error: `A room matching "${finalRoomNo}" or "${finalName}" already exists in this building.` });

  // Capacity cannot be less than 1
  const numericCapacity = Number(capacity);
  if (isNaN(numericCapacity) || numericCapacity < 1) {
    return res.status(400).json({ error: 'Room capacity must be a valid number and cannot be less than 1.' });
  }

  // Validate Room Types
  const rType = (room_type || type || 'CLASSROOM').toUpperCase().replace(/\s+/g, '_');
  const allowedTypes = ['LECTURE_HALL', 'CLASSROOM', 'LABORATORY', 'EXAM_ROOM', 'BOARDROOM', 'OFFICE'];
  if (!allowedTypes.includes(rType)) {
    return res.status(400).json({ error: `Invalid Room Type: "${rType}". Allowed types: LECTURE_HALL, CLASSROOM, LABORATORY, EXAM_ROOM, BOARDROOM, OFFICE.` });
  }

  // Validate Room Status
  const rStatus = (status || 'ACTIVE').toUpperCase();
  const allowedStatuses = ['ACTIVE', 'MAINTENANCE', 'CLOSED'];
  if (!allowedStatuses.includes(rStatus)) {
    return res.status(400).json({ error: `Invalid Room Status: "${rStatus}". Expected: ACTIVE, MAINTENANCE, or CLOSED.` });
  }

  const room = {
    id: 'room-' + Date.now(),
    room_id: 'room-' + Date.now(),
    schoolId: req.user.schoolId,
    campusId: bld.campusId || 'camp-main',
    buildingId,
    buildingName: bld.name,
    roomNumber: finalRoomNo,
    name: finalName,
    room_name: finalName,
    type: rType,
    room_type: rType,
    capacity: numericCapacity,
    status: rStatus
  };

  if (!db.facility_rooms) db.facility_rooms = [];
  db.facility_rooms.push(room);
  logAudit(db, 'CREATE_ROOM', req.user.id, room.id, req.user.schoolId, `Created room "${room.name}" in building "${bld.name}"`);
  writeDb(db);
  res.json({ success: true, room });
});

procurementRouter.delete('/facilities/rooms/:id', (req: any, res) => {
  const db = readDb();
  const roomId = req.params.id;

  const index = (db.facility_rooms || []).findIndex((r: any) => r.id === roomId && r.schoolId === req.user.schoolId);
  if (index === -1) return res.status(404).json({ error: 'Room not found' });

  db.facility_rooms.splice(index, 1);
  logAudit(db, 'DELETE_ROOM', req.user.id, roomId, req.user.schoolId, 'Deleted room');
  writeDb(db);
  res.json({ success: true, message: 'Room deleted successfully' });
});

procurementRouter.get('/facilities/maintenance-requests', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.maintenance_requests || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/facilities/maintenance-requests', (req: any, res) => {
  const db = readDb();
  const { roomId, title, description, priority } = req.body;
  if (!roomId || !title) return res.status(400).json({ error: 'Room and title are required' });

  const rm = db.facility_rooms.find((r: any) => r.id === roomId);

  const request = {
    id: 'maint-req-' + Date.now(),
    schoolId: req.user.schoolId,
    buildingId: rm ? rm.buildingId : 'General',
    roomId,
    roomNumber: rm ? rm.roomNumber : 'Gen Block',
    title,
    description: description || '',
    reporterName: req.user.name || 'Campus Student',
    reporterRole: req.user.role || 'student',
    priority: priority || 'Medium',
    status: 'Reported',
    reporterId: req.user.id,
    createdAt: new Date().toISOString()
  };

  if (!db.maintenance_requests) db.maintenance_requests = [];
  db.maintenance_requests.push(request);
  writeDb(db);
  res.json({ success: true, request });
});

procurementRouter.get('/facilities/work-orders', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.maintenance_work_orders || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/facilities/work-orders', (req: any, res) => {
  const db = readDb();
  const { requestId, assignedTo, materialCost, laborCost } = req.body;
  if (!requestId) return res.status(400).json({ error: 'Support request ID required' });

  const reqObj = db.maintenance_requests.find((r: any) => r.id === requestId);
  if (reqObj) {
    reqObj.status = 'Work Order Created';
  }

  const mat = Number(materialCost) || 0;
  const lab = Number(laborCost) || 0;
  const woNo = 'WO-2026-' + Math.floor(1000 + Math.random() * 8999).toString();

  const wo = {
    id: 'maint-wo-' + Date.now(),
    schoolId: req.user.schoolId,
    requestId,
    woNumber: woNo,
    assignedTo: assignedTo || 'General Maintenance Staff',
    estimatedCost: mat + lab,
    materialCost: mat,
    laborCost: lab,
    status: 'Assigned',
    createdAt: new Date().toISOString()
  };

  if (!db.maintenance_work_orders) db.maintenance_work_orders = [];
  db.maintenance_work_orders.push(wo);
  writeDb(db);
  res.json({ success: true, workOrder: wo });
});

procurementRouter.post('/facilities/work-orders/:id/action', (req: any, res) => {
  const db = readDb();
  const { action } = req.body; // 'Start' or 'Complete'
  const wo = (db.maintenance_work_orders || []).find((w: any) => w.id === req.params.id);
  if (!wo) return res.status(404).json({ error: 'Work order not found' });

  const reqObj = db.maintenance_requests.find((r: any) => r.id === wo.requestId);

  if (action === 'Start') {
    wo.status = 'In Progress';
    if (reqObj) reqObj.status = 'In Progress';
  } else if (action === 'Complete') {
    wo.status = 'Completed';
    if (reqObj) reqObj.status = 'Completed';

    // FINANCE INTERLOCK: Post actual maintenance ledger cost
    const totalCost = wo.estimatedCost || 2400;
    if (totalCost > 0) {
      if (!db.double_entry_transactions) db.double_entry_transactions = [];
      db.double_entry_transactions.push({
        id: `tx_wo_exp_${Date.now()}`,
        schoolId: req.user.schoolId,
        studentId: 'SYSTEM_FACILITIES_MAINTENANCE',
        amount: totalCost,
        method: 'MAINTENANCE_IMPREST_RECON',
        reference: wo.woNumber,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      });
    }
  }

  writeDb(db);
  res.json({ success: true, workOrder: wo });
});

// --------------------------------------------------------------------------
// 5. VEHICLE & FLEET APIs
// --------------------------------------------------------------------------

procurementRouter.get('/vehicles/assignments', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.vehicle_assignments || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/vehicles/assignments', (req: any, res) => {
  const db = readDb();
  const { vehicleId, assignedToStaffId, assignedToStaffName, assignedDate, returnDate, purpose } = req.body;
  if (!vehicleId || !assignedToStaffName) return res.status(400).json({ error: 'Vehicle & Recipient staff are required' });

  const veh = db.vehicles.find((v: any) => v.id === vehicleId);
  if (veh) veh.status = 'ASSIGNED';

  const va = {
    id: 'va-' + Date.now(),
    schoolId: req.user.schoolId,
    vehicleId,
    plateNumber: veh ? veh.plateNumber : 'KBH 102Z',
    assignedToStaffId: assignedToStaffId || 'staff-unassigned',
    assignedToStaffName,
    assignedDate,
    returnDate,
    purpose: purpose || 'Official logistics run',
    status: 'Active'
  };

  if (!db.vehicle_assignments) db.vehicle_assignments = [];
  db.vehicle_assignments.push(va);
  writeDb(db);
  res.json({ success: true, assignment: va });
});

procurementRouter.get('/vehicles/fuel-logs', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.fuel_logs || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/vehicles/fuel-logs', (req: any, res) => {
  const db = readDb();
  const { vehicleId, liters, costPerLiter, mileage, stationName } = req.body;
  if (!vehicleId || !liters || !costPerLiter) return res.status(400).json({ error: 'Vehicle, liters, and cost are required' });

  const veh = db.vehicles.find((v: any) => v.id === vehicleId);
  const total = Number(liters) * Number(costPerLiter);
  const recNo = 'REC-FUEL-' + Math.floor(10000 + Math.random() * 89999).toString();

  const fl = {
    id: 'fuel-' + Date.now(),
    schoolId: req.user.schoolId,
    vehicleId,
    plateNumber: veh ? veh.plateNumber : 'KBH 102Z',
    refuelDate: new Date().toISOString().split('T')[0],
    liters: Number(liters),
    costPerLiter: Number(costPerLiter),
    totalCost: total,
    mileage: Number(mileage) || 120000,
    receiptNumber: recNo,
    stationName: stationName || 'Kobil Petrol Station'
  };

  if (!db.fuel_logs) db.fuel_logs = [];
  db.fuel_logs.push(fl);

  // DIRECT INTEGRATION: Debit vehicle transportation fuel expenses
  if (!db.double_entry_transactions) db.double_entry_transactions = [];
  db.double_entry_transactions.push({
    id: `tx_fuel_log_${Date.now()}`,
    schoolId: req.user.schoolId,
    studentId: 'SYSTEM_FLEET_TRANSPORT',
    amount: total,
    method: 'FLEET_FUEL_CARD_IMPREST',
    reference: recNo,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, fuelLog: fl });
});

procurementRouter.get('/vehicles/service-logs', (req: any, res) => {
  const db = readDb();
  seedPhase10Data(db, req.user.schoolId);
  res.json((db.service_logs || []).filter((s: any) => s.schoolId === req.user.schoolId));
});

procurementRouter.post('/vehicles/service-logs', (req: any, res) => {
  const db = readDb();
  const { vehicleId, cost, description, providerName, nextServiceMileage } = req.body;
  if (!vehicleId || !cost) return res.status(400).json({ error: 'Vehicle and service cost are required' });

  const veh = db.vehicles.find((v: any) => v.id === vehicleId);
  const costAmt = Number(cost);

  const sl = {
    id: 'serv-' + Date.now(),
    schoolId: req.user.schoolId,
    vehicleId,
    plateNumber: veh ? veh.plateNumber : 'KBH 102Z',
    serviceDate: new Date().toISOString().split('T')[0],
    cost: costAmt,
    description: description || 'Routine oil change & multi-point inspections',
    providerName: providerName || 'Local Garage Service Center',
    nextServiceMileage: Number(nextServiceMileage) || 90000,
    mileageAtService: 85000
  };

  if (!db.service_logs) db.service_logs = [];
  db.service_logs.push(sl);

  // DIRECT LINE INTERLOCK: Debit transport service mechanics budget
  if (!db.double_entry_transactions) db.double_entry_transactions = [];
  db.double_entry_transactions.push({
    id: `tx_service_log_${Date.now()}`,
    schoolId: req.user.schoolId,
    studentId: 'SYSTEM_FLEET_TRANSPORT',
    amount: costAmt,
    method: 'SERVICE_VOUCHER_SETTLEMENT',
    reference: `SRV_${sl.id.toUpperCase()}`,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, serviceLog: sl });
});

// --------------------------------------------------------------------------
// 6. AUDIT & COMPLIANCE APIs
// --------------------------------------------------------------------------

procurementRouter.get('/audits/asset', (req: any, res) => {
  const db = readDb();
  res.json(db.asset_audits || []);
});

procurementRouter.post('/audits/asset', (req: any, res) => {
  const db = readDb();
  const { title, auditorName, notes, itemsAudited } = req.body;

  const audit = {
    id: 'aud-ast-' + Date.now(),
    schoolId: req.user.schoolId,
    title: title || 'Routine Campus Asset Inventory Scan',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: new Date().toISOString().split('T')[0],
    status: 'Completed',
    auditorName: auditorName || 'Internal Auditor H.O.D',
    notes: notes || 'Physical check complete - discrepancy level low.',
    itemsAudited: itemsAudited || []
  };

  if (!db.asset_audits) db.asset_audits = [];
  db.asset_audits.push(audit);
  writeDb(db);
  res.json({ success: true, audit });
});

procurementRouter.get('/audits/stock', (req: any, res) => {
  const db = readDb();
  res.json(db.stock_audits || []);
});

procurementRouter.post('/audits/stock', (req: any, res) => {
  const db = readDb();
  const { title, auditorName, notes, itemsAudited } = req.body;

  const audit = {
    id: 'aud-stk-' + Date.now(),
    schoolId: req.user.schoolId,
    title: title || 'Quarterly Store Discrepancy Reconciliation Audit',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: new Date().toISOString().split('T')[0],
    status: 'Completed',
    auditorName: auditorName || 'Internal Stores Inspector',
    notes: notes || 'Minor discrepancies matched and cleared.',
    itemsAudited: itemsAudited || []
  };

  if (!db.stock_audits) db.stock_audits = [];
  db.stock_audits.push(audit);
  writeDb(db);
  res.json({ success: true, audit });
});

procurementRouter.get('/audits/procurement', (req: any, res) => {
  const db = readDb();
  res.json(db.procurement_audits || []);
});

procurementRouter.post('/audits/procurement', (req: any, res) => {
  const db = readDb();
  const { title, auditorName, poCountReviewed, anomaliesFound, compliantPct, notes } = req.body;

  const audit = {
    id: 'aud-prc-' + Date.now(),
    schoolId: req.user.schoolId,
    title: title || 'Treasury Tender Audits & Compliance Review',
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: auditorName || 'Govt External Tender Auditor',
    poCountReviewed: Number(poCountReviewed) || 12,
    anomaliesFound: Number(anomaliesFound) || 0,
    compliantPct: Number(compliantPct) || 100,
    notes: notes || 'No compliance breaches identified. Procurement guidelines followed perfectly.'
  };

  if (!db.procurement_audits) db.procurement_audits = [];
  db.procurement_audits.push(audit);
  writeDb(db);
  res.json({ success: true, audit });
});
