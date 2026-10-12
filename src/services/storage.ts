import {
  Animal,
  MilkProductionRecord,
  DailyMilkReconciliation,
  Customer,
  CustomerLedgerEntry,
  Product,
  ProductBatch,
  Sale,
  Supplier,
  InventoryItem,
  InventoryMovement,
  FeedPlan,
  FeedConsumptionRecord,
  VeterinaryRecord,
  BreedingRecord,
  Employee,
  PayrollRecord,
  Account,
  JournalEntry,
  AppNotification,
  OfflineMutation,
  FarmBranch,
  CashierShiftClosing,
  PaymentMethod
} from '../types';

const STORAGE_KEY = 'ask_dairy_database_v1';
const OFFLINE_QUEUE_KEY = 'ask_dairy_offline_queue_v1';

// Import local generated assets as bundled modules for GitHub Pages asset resolution
import LOGO_URL from '../assets/images/ask_dairy_logo_1791785114471.jpg';
import COW_URL from '../assets/images/sahiwal_cow_portrait_1791785128021.jpg';
import FACILITY_URL from '../assets/images/dairy_milk_processing_1791785144617.jpg';

export { LOGO_URL, COW_URL, FACILITY_URL };

export interface AppDatabase {
  branches: FarmBranch[];
  animals: Animal[];
  milkRecords: MilkProductionRecord[];
  milkReconciliations: DailyMilkReconciliation[];
  customers: Customer[];
  customerLedgers: CustomerLedgerEntry[];
  products: Product[];
  productBatches: ProductBatch[];
  sales: Sale[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  feedPlans: FeedPlan[];
  feedConsumptions: FeedConsumptionRecord[];
  vetRecords: VeterinaryRecord[];
  breedingRecords: BreedingRecord[];
  employees: Employee[];
  payroll: PayrollRecord[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  notifications: AppNotification[];
  shiftClosings: CashierShiftClosing[];
}

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const defaultBranches: FarmBranch[] = [
  {
    id: 'branch-1',
    name: 'Al-Razi Model Dairy Farm (Main)',
    location: 'Okara Bypass, Punjab, Pakistan',
    code: 'OKR-01',
    isMain: true,
    phone: '+92 300 4567890',
    managerName: 'Chaudhry Salman'
  },
  {
    id: 'branch-2',
    name: 'Greenfield Dairy & Processing',
    location: 'G.T. Road, Gujranwala, Pakistan',
    code: 'GRW-02',
    isMain: false,
    phone: '+92 321 9876543',
    managerName: 'Hafiz Tariq'
  }
];

const defaultAnimals: Animal[] = [
  {
    id: 'ASK-CW-101',
    earTag: 'PK-7240',
    name: 'Heer (Sahiwal Red)',
    species: 'cow',
    breed: 'Sahiwal',
    gender: 'female',
    dob: '2021-03-15',
    purchaseDate: '2022-04-10',
    purchaseCost: 350000,
    status: 'milking',
    lactationNumber: 3,
    branchId: 'branch-1',
    weightKg: 460,
    currentAvgDailyYield: 18.5,
    photoUrl: COW_URL,
    lastCalvingDate: '2026-07-10',
    notes: 'High butterfat yield pedigree cow, exceptionally docile temperament'
  },
  {
    id: 'ASK-CW-102',
    earTag: 'PK-7241',
    name: 'Malti',
    species: 'cow',
    breed: 'Sahiwal',
    gender: 'female',
    dob: '2020-08-20',
    purchaseDate: '2022-04-10',
    purchaseCost: 320000,
    status: 'milking',
    lactationNumber: 4,
    branchId: 'branch-1',
    weightKg: 440,
    currentAvgDailyYield: 16.0,
    lastCalvingDate: '2026-08-01',
    notes: 'Consistent morning producer'
  },
  {
    id: 'ASK-CW-103',
    earTag: 'PK-7242',
    name: 'Daisy (Holstein Cross)',
    species: 'cow',
    breed: 'Friesian',
    gender: 'female',
    dob: '2021-11-05',
    purchaseDate: '2023-01-15',
    purchaseCost: 480000,
    status: 'milking',
    lactationNumber: 2,
    branchId: 'branch-1',
    weightKg: 520,
    currentAvgDailyYield: 24.5,
    lastCalvingDate: '2026-06-18',
    notes: 'Peak producer, requires specialized high energy TMR'
  },
  {
    id: 'ASK-CW-104',
    earTag: 'PK-7243',
    name: 'Reshma',
    species: 'cow',
    breed: 'Cholistani',
    gender: 'female',
    dob: '2022-01-12',
    purchaseDate: '2023-06-20',
    purchaseCost: 290000,
    status: 'pregnant',
    lactationNumber: 2,
    branchId: 'branch-1',
    weightKg: 410,
    currentAvgDailyYield: 0,
    expectedCalvingDate: '2026-10-24',
    notes: 'Due for calving in two weeks. Moved to maternity pen.'
  },
  {
    id: 'ASK-CW-105',
    earTag: 'PK-7244',
    name: 'Sitara',
    species: 'cow',
    breed: 'Jersey',
    gender: 'female',
    dob: '2022-04-14',
    purchaseDate: '2023-09-01',
    purchaseCost: 380000,
    status: 'milking',
    lactationNumber: 1,
    branchId: 'branch-1',
    weightKg: 390,
    currentAvgDailyYield: 15.2,
    lastCalvingDate: '2026-08-20',
    notes: 'High SNF & 5.1% Fat content'
  },
  {
    id: 'ASK-BF-201',
    earTag: 'PK-8101',
    name: 'Rani (Nili-Ravi Queen)',
    species: 'buffalo',
    breed: 'Nili-Ravi Buffalo',
    gender: 'female',
    dob: '2020-05-10',
    purchaseDate: '2021-11-20',
    purchaseCost: 420000,
    status: 'milking',
    lactationNumber: 3,
    branchId: 'branch-1',
    weightKg: 580,
    currentAvgDailyYield: 15.8,
    lastCalvingDate: '2026-05-30',
    notes: '6.8% rich buffalo milk fat, prime source for Desi Ghee processing'
  },
  {
    id: 'ASK-BF-202',
    earTag: 'PK-8102',
    name: 'Kajal',
    species: 'buffalo',
    breed: 'Nili-Ravi Buffalo',
    gender: 'female',
    dob: '2021-02-18',
    purchaseDate: '2022-08-14',
    purchaseCost: 390000,
    status: 'milking',
    lactationNumber: 2,
    branchId: 'branch-1',
    weightKg: 540,
    currentAvgDailyYield: 14.2,
    lastCalvingDate: '2026-07-02',
    notes: 'Healthy udder health, negative CMT'
  },
  {
    id: 'ASK-BF-203',
    earTag: 'PK-8103',
    name: 'Chameli',
    species: 'buffalo',
    breed: 'Nili-Ravi Buffalo',
    gender: 'female',
    dob: '2019-10-10',
    purchaseDate: '2021-03-05',
    purchaseCost: 360000,
    status: 'dry',
    lactationNumber: 4,
    branchId: 'branch-1',
    weightKg: 560,
    currentAvgDailyYield: 0,
    notes: 'Dry period nutrition management'
  },
  {
    id: 'ASK-BF-204',
    earTag: 'PK-8104',
    name: 'Neelam',
    species: 'buffalo',
    breed: 'Kundi Buffalo',
    gender: 'female',
    dob: '2022-06-15',
    purchaseDate: '2023-11-10',
    purchaseCost: 340000,
    status: 'milking',
    lactationNumber: 1,
    branchId: 'branch-1',
    weightKg: 490,
    currentAvgDailyYield: 12.0,
    lastCalvingDate: '2026-08-15',
    notes: 'First calf heifer, very gentle'
  },
  {
    id: 'ASK-CW-106',
    earTag: 'PK-7245',
    name: 'Chandni',
    species: 'cow',
    breed: 'Crossbred',
    gender: 'female',
    dob: '2023-01-20',
    purchaseDate: '2024-02-15',
    purchaseCost: 310000,
    status: 'sick',
    lactationNumber: 1,
    branchId: 'branch-1',
    weightKg: 420,
    currentAvgDailyYield: 8.5,
    notes: 'Mild mastitis in rear right quarter; under antibiotic treatment, milk withheld from sales'
  }
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'MLK-BUF',
    name: 'Fresh Buffalo Milk',
    nameUrdu: 'تازہ بھینس کا دودھ',
    category: 'raw_milk',
    unit: 'litre',
    costPrice: 165,
    sellingPrice: 220,
    stock: 240,
    minStockAlert: 50,
    description: 'Rich whole buffalo milk (6.5% - 7.2% Fat) chilled to 3.8°C'
  },
  {
    id: 'prod-2',
    code: 'MLK-COW',
    name: 'Fresh Cow Milk (A2 Sahiwal)',
    nameUrdu: 'تازہ ساہیوال گائے کا دودھ',
    category: 'raw_milk',
    unit: 'litre',
    costPrice: 140,
    sellingPrice: 195,
    stock: 180,
    minStockAlert: 40,
    description: 'Pure single-origin Cow Milk, naturally easy to digest'
  },
  {
    id: 'prod-3',
    code: 'GHE-DESI-1KG',
    name: 'Pure Desi Ghee (Glass Jar)',
    nameUrdu: 'خالص دیسی گھی (شیشے کا جار)',
    category: 'value_added',
    unit: 'kg',
    costPrice: 2200,
    sellingPrice: 3200,
    stock: 35,
    minStockAlert: 10,
    description: 'Traditional slow-simmered bilona Desi Ghee with golden aroma'
  },
  {
    id: 'prod-4',
    code: 'YGT-DAHI',
    name: 'Fresh Sweet Buffalo Dahi / Yogurt',
    nameUrdu: 'میٹھی گاڑھی بھینس کی دہی',
    category: 'value_added',
    unit: 'kg',
    costPrice: 180,
    sellingPrice: 260,
    stock: 65,
    minStockAlert: 15,
    description: 'Thick, creamy set yogurt made from whole buffalo milk'
  },
  {
    id: 'prod-5',
    code: 'KHY-KHOYA',
    name: 'Pure Traditional Khoya / Mawa',
    nameUrdu: 'خالص روایتی کھویا',
    category: 'value_added',
    unit: 'kg',
    costPrice: 950,
    sellingPrice: 1400,
    stock: 22,
    minStockAlert: 8,
    description: 'Unsweetened condensed milk solid, perfect for sweets'
  },
  {
    id: 'prod-6',
    code: 'BTR-MAKHAN',
    name: 'Organic Farm White Butter (Makhan)',
    nameUrdu: 'فارم وائٹ مکھن',
    category: 'value_added',
    unit: 'kg',
    costPrice: 1400,
    sellingPrice: 2000,
    stock: 18,
    minStockAlert: 5,
    description: 'Fresh unsalted white butter churned from cultured cream'
  },
  {
    id: 'prod-7',
    code: 'PNR-PANEER',
    name: 'Artisanal Fresh Paneer / Cheese',
    nameUrdu: 'تازہ پنیر',
    category: 'value_added',
    unit: 'kg',
    costPrice: 850,
    sellingPrice: 1250,
    stock: 14,
    minStockAlert: 5,
    description: 'Soft high-protein paneer blocks made with lemon curdling'
  },
  {
    id: 'prod-8',
    code: 'LSS-BTL',
    name: 'Traditional Chilled Lassi (500ml)',
    nameUrdu: 'ٹھنڈی روایتی لسی',
    category: 'packaged',
    unit: 'bottle',
    costPrice: 75,
    sellingPrice: 130,
    stock: 45,
    minStockAlert: 15,
    description: 'Refreshing sweet & salty yogurt cooler'
  }
];

const defaultCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Royal Crown Hotel & Restaurant',
    phone: '+92 300 1122334',
    address: 'Main Boulevard, Okara',
    category: 'hotel_dairy',
    creditLimit: 250000,
    openingBalance: 45000,
    balance: 82500,
    dailyMilkQuotaLitres: 40,
    deliveryShift: 'both',
    preferredPricePerLitre: 215,
    notes: 'Bulk morning 25L, evening 15L delivery'
  },
  {
    id: 'CUST-002',
    name: 'Gourmet Sweets & Bakers',
    phone: '+92 321 4455667',
    address: 'Katchery Chowk, Okara',
    category: 'wholesale',
    creditLimit: 300000,
    openingBalance: 60000,
    balance: 114000,
    dailyMilkQuotaLitres: 60,
    deliveryShift: 'morning',
    preferredPricePerLitre: 210,
    notes: 'Takes high fat buffalo milk & bulk khoya'
  },
  {
    id: 'CUST-003',
    name: 'Madina Milk Shop (Bhatti Dairy)',
    phone: '+92 333 7788990',
    address: 'Church Road, Gujranwala',
    category: 'wholesale',
    creditLimit: 150000,
    openingBalance: 20000,
    balance: 38200,
    dailyMilkQuotaLitres: 30,
    deliveryShift: 'both',
    preferredPricePerLitre: 212
  },
  {
    id: 'CUST-004',
    name: 'Dr. Tariq Mehmood (Household Sub)',
    phone: '+92 301 5566778',
    address: 'House 42, Officers Colony, Okara',
    category: 'subscription',
    creditLimit: 25000,
    openingBalance: 0,
    balance: 6600,
    dailyMilkQuotaLitres: 4,
    deliveryShift: 'morning',
    preferredPricePerLitre: 220,
    notes: 'Monthly billing cycle on 1st of each month'
  },
  {
    id: 'CUST-005',
    name: 'Al-Hafiz General Store & Mart',
    phone: '+92 345 8899001',
    address: 'Faisalabad Road, Okara',
    category: 'retail',
    creditLimit: 50000,
    openingBalance: 5000,
    balance: 14200,
    notes: 'Desi Ghee and Yogurt stockist'
  }
];

const defaultCustomerLedgers: CustomerLedgerEntry[] = [
  {
    id: 'LEDG-001',
    customerId: 'CUST-001',
    date: '2026-10-01',
    type: 'opening',
    description: 'Opening Balance brought forward',
    debit: 45000,
    credit: 0,
    runningBalance: 45000
  },
  {
    id: 'LEDG-002',
    customerId: 'CUST-001',
    date: '2026-10-05',
    type: 'sale',
    referenceId: 'INV-1002',
    description: 'Daily Bulk Milk supply 200L @ Rs. 215',
    debit: 43000,
    credit: 0,
    runningBalance: 88000
  },
  {
    id: 'LEDG-003',
    customerId: 'CUST-001',
    date: '2026-10-07',
    type: 'payment',
    referenceId: 'PAY-881',
    description: 'Bank Transfer via Raast Ref# 928310',
    debit: 0,
    credit: 50000,
    runningBalance: 38000
  },
  {
    id: 'LEDG-004',
    customerId: 'CUST-001',
    date: '2026-10-10',
    type: 'sale',
    referenceId: 'INV-1045',
    description: 'Milk & Makhan delivery Invoice #INV-1045',
    debit: 44500,
    credit: 0,
    runningBalance: 82500
  }
];

const defaultSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Al-Faisal Cattle Feed & Wanda Mills',
    contactPerson: 'Haji Faisal Rasheed',
    phone: '+92 300 7654321',
    category: 'feed',
    balance: 85000,
    address: 'Multan Industrial Estate, Punjab'
  },
  {
    id: 'SUP-002',
    name: 'Greenfield Silage & Fodder Co.',
    contactPerson: 'Malik Jahangir',
    phone: '+92 321 8765432',
    category: 'feed',
    balance: 42000,
    address: 'Dipalpur Agri Zone, Okara'
  },
  {
    id: 'SUP-003',
    name: 'VetCare Pharma & Biologicals',
    contactPerson: 'Dr. Naveed Shah',
    phone: '+92 333 9876543',
    category: 'medicines',
    balance: 18500,
    address: 'Empress Road, Lahore'
  }
];

const defaultInventory: InventoryItem[] = [
  {
    id: 'INV-ITM-1',
    name: 'High-Yield Dairy Wanda (50kg Bag)',
    category: 'feed_fodder',
    unit: 'bag',
    currentStock: 48,
    minStockAlert: 15,
    unitCost: 3800,
    location: 'Feed Shed A',
    supplierId: 'SUP-001'
  },
  {
    id: 'INV-ITM-2',
    name: 'Corn Silage (Packed Bales)',
    category: 'feed_fodder',
    unit: 'kg',
    currentStock: 12500,
    minStockAlert: 3000,
    unitCost: 14.5,
    location: 'Silage Pit 1',
    supplierId: 'SUP-002'
  },
  {
    id: 'INV-ITM-3',
    name: 'Fine Wheat Straw (Bhoosa)',
    category: 'feed_fodder',
    unit: 'kg',
    currentStock: 6200,
    minStockAlert: 1500,
    unitCost: 22,
    location: 'Dry Fodder Shed',
    supplierId: 'SUP-002'
  },
  {
    id: 'INV-ITM-4',
    name: 'Mineral Mixture & Calcium Chelated',
    category: 'feed_fodder',
    unit: 'kg',
    currentStock: 120,
    minStockAlert: 30,
    unitCost: 350,
    location: 'Feed Additives Room',
    supplierId: 'SUP-001'
  },
  {
    id: 'INV-ITM-5',
    name: 'FMD Vaccine (Foot & Mouth) 50 Doses',
    category: 'medicine_vaccine',
    unit: 'vial',
    currentStock: 3,
    minStockAlert: 2,
    unitCost: 6500,
    location: 'Pharma Cold Storage (4°C)',
    expiryDate: '2027-03-31',
    supplierId: 'SUP-003'
  },
  {
    id: 'INV-ITM-6',
    name: 'Oxytetracycline LA 100ml',
    category: 'medicine_vaccine',
    unit: 'bottle',
    currentStock: 8,
    minStockAlert: 3,
    unitCost: 1200,
    location: 'Vet Kit Cabinet',
    expiryDate: '2027-06-30',
    supplierId: 'SUP-003'
  },
  {
    id: 'INV-ITM-7',
    name: '1kg Premium Glass Jars with Lid',
    category: 'packaging',
    unit: 'piece',
    currentStock: 320,
    minStockAlert: 80,
    unitCost: 85,
    location: 'Packaging Room'
  }
];

const defaultFeedPlans: FeedPlan[] = [
  {
    id: 'FP-1',
    name: 'High-Producing Milking Herd Ration (TMR)',
    targetGroup: 'high_yield',
    dailyRationItems: [
      { itemId: 'INV-ITM-1', itemName: 'High-Yield Dairy Wanda', quantityKg: 6, unitCost: 76 },
      { itemId: 'INV-ITM-2', itemName: 'Corn Silage', quantityKg: 25, unitCost: 14.5 },
      { itemId: 'INV-ITM-3', itemName: 'Fine Wheat Straw', quantityKg: 3, unitCost: 22 },
      { itemId: 'INV-ITM-4', itemName: 'Mineral Mixture', quantityKg: 0.25, unitCost: 350 }
    ],
    costPerDayPerAnimal: 972.5,
    notes: 'Formulated for 18L+ daily output cows'
  },
  {
    id: 'FP-2',
    name: 'Dry & Late Gestation Buffalo Ration',
    targetGroup: 'dry',
    dailyRationItems: [
      { itemId: 'INV-ITM-1', itemName: 'High-Yield Dairy Wanda', quantityKg: 2.5, unitCost: 76 },
      { itemId: 'INV-ITM-2', itemName: 'Corn Silage', quantityKg: 20, unitCost: 14.5 },
      { itemId: 'INV-ITM-3', itemName: 'Fine Wheat Straw', quantityKg: 5, unitCost: 22 },
      { itemId: 'INV-ITM-4', itemName: 'Mineral Mixture', quantityKg: 0.15, unitCost: 350 }
    ],
    costPerDayPerAnimal: 642.5,
    notes: 'Controlled energy to avoid over-conditioning before calving'
  }
];

const defaultFeedConsumptions: FeedConsumptionRecord[] = [
  {
    id: 'FC-01',
    date: getTodayDateStr(),
    branchId: 'branch-1',
    feedPlanId: 'FP-1',
    feedPlanName: 'High-Producing Milking Herd Ration (TMR)',
    animalCount: 7,
    totalKg: 240,
    totalCost: 6807.5,
    operatorName: 'Bashir Ahmed'
  }
];

const defaultVetRecords: VeterinaryRecord[] = [
  {
    id: 'VET-01',
    animalId: 'ASK-CW-106',
    animalEarTag: 'PK-7245',
    date: getTodayDateStr(),
    type: 'treatment',
    conditionDiagnosis: 'Clinical Mastitis in right rear quarter',
    medicineAdministered: 'Intramammary Ceftiofur + Meloxicam Anti-inflammatory',
    dose: '1 tube + 15ml IM',
    cost: 3200,
    withdrawalDays: 4,
    veterinarianName: 'Dr. Imran Qureshi (DVM)',
    followUpDate: '2026-10-14',
    notes: 'Milk from this cow is strictly segregated and discarded during withdrawal'
  },
  {
    id: 'VET-02',
    animalId: 'ASK-CW-101',
    animalEarTag: 'PK-7240',
    date: '2026-09-15',
    type: 'routine_check',
    conditionDiagnosis: 'Post-calving uterine involution normal',
    medicineAdministered: 'Uterine tonic & multivitamin',
    dose: '100ml oral',
    cost: 1500,
    withdrawalDays: 0,
    veterinarianName: 'Dr. Imran Qureshi (DVM)',
    notes: 'Healthy recovery'
  }
];

const defaultBreedingRecords: BreedingRecord[] = [
  {
    id: 'BRD-01',
    animalId: 'ASK-CW-104',
    animalEarTag: 'PK-7243',
    date: '2026-01-18',
    eventType: 'artificial_insemination',
    semenStrawId: 'SIRE-SHW-9901 (Pure Sahiwal Semen)',
    technicianName: 'Zahid Hussain (Inseminator)',
    expectedCalvingDate: '2026-10-24',
    notes: 'Conceived on 1st service'
  },
  {
    id: 'BRD-02',
    animalId: 'ASK-CW-104',
    animalEarTag: 'PK-7243',
    date: '2026-03-22',
    eventType: 'pd_check',
    technicianName: 'Dr. Imran Qureshi (DVM)',
    pdResult: 'pregnant',
    expectedCalvingDate: '2026-10-24',
    notes: 'Pregnancy confirmed at 63 days by rectal palpation'
  },
  {
    id: 'BRD-03',
    animalId: 'ASK-BF-202',
    animalEarTag: 'PK-8102',
    date: '2026-09-28',
    eventType: 'artificial_insemination',
    semenStrawId: 'SIRE-NR-4402 (Nili-Ravi Champion)',
    technicianName: 'Zahid Hussain (Inseminator)',
    expectedCalvingDate: '2027-08-05',
    notes: 'Heat detected in early morning. PD check scheduled for Nov 28'
  }
];

const defaultEmployees: Employee[] = [
  {
    id: 'EMP-01',
    name: 'Chaudhry Salman',
    phone: '+92 300 4567890',
    cnic: '35302-1234567-1',
    role: 'Farm Manager',
    branchId: 'branch-1',
    joinDate: '2022-01-01',
    salaryType: 'monthly',
    baseSalary: 95000,
    status: 'active'
  },
  {
    id: 'EMP-02',
    name: 'Dr. Imran Qureshi',
    phone: '+92 302 9876543',
    cnic: '35302-7654321-3',
    role: 'Consultant Veterinarian',
    branchId: 'branch-1',
    joinDate: '2022-03-15',
    salaryType: 'monthly',
    baseSalary: 65000,
    status: 'active'
  },
  {
    id: 'EMP-03',
    name: 'Muhammad Aslam',
    phone: '+92 345 1122334',
    cnic: '35302-5566778-5',
    role: 'Lead Milkman / Herd Specialist',
    branchId: 'branch-1',
    joinDate: '2022-06-01',
    salaryType: 'monthly',
    baseSalary: 42000,
    status: 'active'
  },
  {
    id: 'EMP-04',
    name: 'Kamran Ali',
    phone: '+92 312 9988776',
    cnic: '35302-3344556-7',
    role: 'POS Cashier & Dairy Shop Salesman',
    branchId: 'branch-1',
    joinDate: '2023-04-10',
    salaryType: 'monthly',
    baseSalary: 38000,
    status: 'active'
  }
];

const defaultPayroll: PayrollRecord[] = [
  {
    id: 'PAY-2026-09-01',
    monthYear: '2026-09',
    employeeId: 'EMP-01',
    employeeName: 'Chaudhry Salman',
    baseSalary: 95000,
    allowances: 5000,
    advancesDeducted: 0,
    netPayable: 100000,
    paidDate: '2026-10-01',
    paymentMethod: 'bank_transfer',
    status: 'paid'
  },
  {
    id: 'PAY-2026-09-02',
    monthYear: '2026-09',
    employeeId: 'EMP-03',
    employeeName: 'Muhammad Aslam',
    baseSalary: 42000,
    allowances: 3000,
    advancesDeducted: 5000,
    netPayable: 40000,
    paidDate: '2026-10-01',
    paymentMethod: 'cash',
    status: 'paid'
  }
];

const defaultAccounts: Account[] = [
  // Assets
  { id: 'ACC-1010', code: '1010', name: 'Cash in Register (Shop Drawer)', type: 'asset', subType: 'current_asset', balance: 64500, description: 'Cash collected at farm POS counter' },
  { id: 'ACC-1020', code: '1020', name: 'Meezan Bank - Main Operations', type: 'asset', subType: 'current_asset', balance: 482000, description: 'Bank current account for vendor payouts & Raast' },
  { id: 'ACC-1030', code: '1030', name: 'Accounts Receivable (Customer Credit)', type: 'asset', subType: 'current_asset', balance: 255300, description: 'Outstanding balance from wholesale and subscriber customers' },
  { id: 'ACC-1040', code: '1040', name: 'Raw Milk Chiller Inventory', type: 'asset', subType: 'current_asset', balance: 75900, description: 'Raw milk stock stored in bulk coolers' },
  { id: 'ACC-1050', code: '1050', name: 'Dairy Finished Goods Inventory', type: 'asset', subType: 'current_asset', balance: 184500, description: 'Desi Ghee, Khoya, Dahi, Butter ready for sale' },
  { id: 'ACC-1060', code: '1060', name: 'Feed, Fodder & Medicine Inventory', type: 'asset', subType: 'current_asset', balance: 395000, description: 'Feed bags, silage pit, vet drugs on hand' },
  { id: 'ACC-1510', code: '1510', name: 'Biological Assets (Dairy Cattle & Buffaloes)', type: 'asset', subType: 'fixed_asset', balance: 3740000, description: 'Total capital valuation of herd' },
  { id: 'ACC-1520', code: '1520', name: 'Machinery & Chiller Tanks', type: 'asset', subType: 'fixed_asset', balance: 1450000, description: 'Bulk milk chiller, milking machine, pasteurizer' },

  // Liabilities
  { id: 'ACC-2010', code: '2010', name: 'Accounts Payable (Suppliers)', type: 'liability', subType: 'current_liability', balance: 145500, description: 'Owed to feed mills and pharmaceutical vendors' },
  { id: 'ACC-2020', code: '2020', name: 'Customer Advances & Deposits', type: 'liability', subType: 'current_liability', balance: 18000, description: 'Prepayments from subscription milk clients' },

  // Equity
  { id: 'ACC-3010', code: '3010', name: 'Owner Capital - ASK Dairy', type: 'equity', subType: 'equity', balance: 5800000, description: 'Initial owner investment in land, sheds, and herd' },
  { id: 'ACC-3020', code: '3020', name: 'Retained Earnings', type: 'equity', subType: 'equity', balance: 682700, description: 'Accumulated profits retained in the business' },

  // Revenue
  { id: 'ACC-4010', code: '4010', name: 'Raw Milk Sales Revenue', type: 'revenue', subType: 'operating_revenue', balance: 840500, description: 'Revenue earned from bulk and retail raw milk' },
  { id: 'ACC-4020', code: '4020', name: 'Value-Added Dairy Products Sales', type: 'revenue', subType: 'operating_revenue', balance: 392000, description: 'Revenue earned from Desi Ghee, Khoya, Dahi' },
  { id: 'ACC-4030', code: '4030', name: 'Cattle & Calf Sales Revenue', type: 'revenue', subType: 'other_revenue', balance: 120000, description: 'Proceeds from culled cows or bull calves' },

  // Expenses
  { id: 'ACC-5010', code: '5010', name: 'Feed & Fodder Consumption Expense', type: 'expense', subType: 'cogs', balance: 312000, description: 'Direct feed consumed by milking herd' },
  { id: 'ACC-5020', code: '5020', name: 'Veterinary, Medicines & AI Expense', type: 'expense', subType: 'operating_expense', balance: 48500, description: 'Vaccines, treatments, semen straws, vet fees' },
  { id: 'ACC-5030', code: '5030', name: 'Farm Labor & Staff Salaries', type: 'expense', subType: 'operating_expense', balance: 240000, description: 'Payroll disbursed to farm hands, cashiers' },
  { id: 'ACC-5040', code: '5040', name: 'Farm Electricity & Diesel (Generator)', type: 'expense', subType: 'operating_expense', balance: 85000, description: 'Power for chillers, fans, tubewell' },
  { id: 'ACC-5050', code: '5050', name: 'Packaging & Consumables Expense', type: 'expense', subType: 'operating_expense', balance: 22000, description: 'Jars, pouches, seals, sanitizers' }
];

const defaultJournalEntries: JournalEntry[] = [
  {
    id: 'JRN-001',
    entryNumber: 'JV-2026-10-001',
    date: '2026-10-01',
    branchId: 'branch-1',
    description: 'Monthly Farm Labor Payroll disbursement',
    referenceType: 'payroll',
    createdBy: 'Chaudhry Salman',
    lines: [
      { accountId: 'ACC-5030', accountName: 'Farm Labor & Staff Salaries', accountCode: '5030', debit: 140000, credit: 0 },
      { accountId: 'ACC-1020', accountName: 'Meezan Bank - Main Operations', accountCode: '1020', debit: 0, credit: 100000 },
      { accountId: 'ACC-1010', accountName: 'Cash in Register', accountCode: '1010', debit: 0, credit: 40000 }
    ]
  },
  {
    id: 'JRN-002',
    entryNumber: 'JV-2026-10-002',
    date: '2026-10-05',
    branchId: 'branch-1',
    description: 'Bulk Raw Milk delivery to Royal Crown Hotel Invoice #1002',
    referenceType: 'pos_sale',
    referenceId: 'INV-1002',
    createdBy: 'Kamran Ali',
    lines: [
      { accountId: 'ACC-1030', accountName: 'Accounts Receivable (Customer Credit)', accountCode: '1030', debit: 43000, credit: 0 },
      { accountId: 'ACC-4010', accountName: 'Raw Milk Sales Revenue', accountCode: '4010', debit: 0, credit: 43000 }
    ]
  },
  {
    id: 'JRN-003',
    entryNumber: 'JV-2026-10-003',
    date: '2026-10-07',
    branchId: 'branch-1',
    description: 'Raast payment received from Royal Crown Hotel Ref# 928310',
    referenceType: 'manual',
    createdBy: 'Chaudhry Salman',
    lines: [
      { accountId: 'ACC-1020', accountName: 'Meezan Bank - Main Operations', accountCode: '1020', debit: 50000, credit: 0 },
      { accountId: 'ACC-1030', accountName: 'Accounts Receivable (Customer Credit)', accountCode: '1030', debit: 0, credit: 50000 }
    ]
  }
];

const defaultSales: Sale[] = [
  {
    id: 'SALE-101',
    invoiceNumber: 'ASK-INV-2026-001',
    branchId: 'branch-1',
    customerId: 'CUST-001',
    customerName: 'Royal Crown Hotel & Restaurant',
    date: getTodayDateStr(),
    items: [
      { productId: 'prod-1', productName: 'Fresh Buffalo Milk', quantity: 30, unit: 'litre', unitPrice: 215, total: 6450 },
      { productId: 'prod-3', productName: 'Pure Desi Ghee (Glass Jar)', quantity: 2, unit: 'kg', unitPrice: 3200, total: 6400 }
    ],
    subtotal: 12850,
    discount: 0,
    tax: 0,
    total: 12850,
    paidAmount: 5000,
    paymentMethod: 'split',
    splitPayments: [
      { method: 'cash', amount: 5000 },
      { method: 'credit', amount: 7850 }
    ],
    creditAmount: 7850,
    cashierName: 'Kamran Ali',
    notes: 'Morning commercial supply',
    status: 'completed'
  },
  {
    id: 'SALE-102',
    invoiceNumber: 'ASK-INV-2026-002',
    branchId: 'branch-1',
    customerId: 'WALK-IN',
    customerName: 'Walk-in Retail Buyer',
    date: getTodayDateStr(),
    items: [
      { productId: 'prod-2', productName: 'Fresh Cow Milk (A2 Sahiwal)', quantity: 4, unit: 'litre', unitPrice: 195, total: 780 },
      { productId: 'prod-4', productName: 'Fresh Sweet Buffalo Dahi', quantity: 2, unit: 'kg', unitPrice: 260, total: 520 },
      { productId: 'prod-8', productName: 'Traditional Chilled Lassi', quantity: 2, unit: 'bottle', unitPrice: 130, total: 260 }
    ],
    subtotal: 1560,
    discount: 60,
    tax: 0,
    total: 1500,
    paidAmount: 1500,
    paymentMethod: 'cash',
    creditAmount: 0,
    cashierName: 'Kamran Ali',
    status: 'completed'
  }
];

const defaultBatches: ProductBatch[] = [
  {
    id: 'BTCH-2026-101',
    batchNumber: 'BTCH-GHE-042',
    productId: 'prod-3',
    productName: 'Pure Desi Ghee (Glass Jar)',
    productionDate: '2026-10-08',
    inputMilkLitres: 160,
    milkCostPerLitre: 165,
    additionalCost: 1800, // fuel & glass packaging
    expectedOutputQty: 10,
    actualOutputQty: 9.8,
    unit: 'kg',
    yieldEfficiencyPct: 98.0,
    lossWastageQty: 0.2,
    unitCostCalculated: 2877.5,
    expiryDate: '2027-04-08',
    operatorName: 'Bashir Ahmed',
    branchId: 'branch-1',
    notes: 'Churned from cultured Nili-Ravi buffalo cream, pleasant nutty aroma'
  }
];

const defaultShiftClosings: CashierShiftClosing[] = [
  {
    id: 'CLS-2026-10-01',
    branchId: 'branch-1',
    date: '2026-10-10',
    shift: 'morning',
    cashierName: 'Kamran Ali',
    openingCash: 10000,
    totalCashSales: 34500,
    totalCardWalletSales: 12000,
    totalCreditSales: 21500,
    cashPaidOutExpenses: 2500,
    expectedDrawerCash: 42000,
    actualDrawerCashCount: 42000,
    variance: 0,
    notes: 'Morning shift drawer reconciled perfectly with zero variance',
    closedAt: '2026-10-10 13:00'
  }
];

const defaultNotifications: AppNotification[] = [
  {
    id: 'NOTIF-1',
    title: 'Expected Calving Reminder',
    message: 'Sahiwal Cow Reshma (Ear Tag: PK-7243) is due for calving in 12 days (~Oct 24). Monitor closely in the maternity pen.',
    type: 'calving_expected',
    date: getTodayDateStr(),
    read: false,
    actionTab: 'animals'
  },
  {
    id: 'NOTIF-2',
    title: 'Milk Withdrawal Safety Alert',
    message: 'Crossbred Cow Chandni (PK-7245) is under antibiotic treatment. Milk MUST NOT be mixed into sale chiller until Oct 15.',
    type: 'withdrawal_alert',
    date: getTodayDateStr(),
    read: false,
    actionTab: 'vetBreeding'
  },
  {
    id: 'NOTIF-3',
    title: 'Low Stock Alert - FMD Vaccine',
    message: 'Foot & Mouth Disease vaccine stock is down to 3 vials. Reorder before the bi-annual booster campaign.',
    type: 'low_stock',
    date: getTodayDateStr(),
    read: false,
    actionTab: 'inventoryFeed'
  },
  {
    id: 'NOTIF-4',
    title: 'High Customer Credit Alert',
    message: 'Gourmet Sweets outstanding balance is Rs. 114,000 (Approaching Rs. 150k credit soft-cap).',
    type: 'overdue_credit',
    date: getTodayDateStr(),
    read: false,
    actionTab: 'customers'
  }
];

// Helper to seed milk production records for today
function generateInitialMilkRecords(): MilkProductionRecord[] {
  const today = getTodayDateStr();
  return [
    {
      id: 'MLK-REC-1',
      date: today,
      shift: 'morning',
      animalId: 'ASK-CW-101',
      quantityLitres: 10.2,
      fatPercentage: 4.8,
      snfPercentage: 8.9,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:15:00`
    },
    {
      id: 'MLK-REC-2',
      date: today,
      shift: 'morning',
      animalId: 'ASK-CW-102',
      quantityLitres: 8.8,
      fatPercentage: 4.5,
      snfPercentage: 8.7,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:22:00`
    },
    {
      id: 'MLK-REC-3',
      date: today,
      shift: 'morning',
      animalId: 'ASK-CW-103',
      quantityLitres: 13.5,
      fatPercentage: 3.9,
      snfPercentage: 8.5,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:30:00`
    },
    {
      id: 'MLK-REC-4',
      date: today,
      shift: 'morning',
      animalId: 'ASK-CW-105',
      quantityLitres: 8.1,
      fatPercentage: 5.2,
      snfPercentage: 9.1,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:40:00`
    },
    {
      id: 'MLK-REC-5',
      date: today,
      shift: 'morning',
      animalId: 'ASK-BF-201',
      quantityLitres: 8.6,
      fatPercentage: 6.9,
      snfPercentage: 9.4,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:50:00`
    },
    {
      id: 'MLK-REC-6',
      date: today,
      shift: 'morning',
      animalId: 'ASK-BF-202',
      quantityLitres: 7.9,
      fatPercentage: 6.6,
      snfPercentage: 9.3,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T06:58:00`
    },
    {
      id: 'MLK-REC-7',
      date: today,
      shift: 'morning',
      animalId: 'ASK-BF-204',
      quantityLitres: 6.4,
      fatPercentage: 6.7,
      snfPercentage: 9.2,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T07:10:00`
    },
    // Evening Shift entries
    {
      id: 'MLK-REC-8',
      date: today,
      shift: 'evening',
      animalId: 'ASK-CW-101',
      quantityLitres: 8.3,
      fatPercentage: 4.9,
      snfPercentage: 8.8,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:15:00`
    },
    {
      id: 'MLK-REC-9',
      date: today,
      shift: 'evening',
      animalId: 'ASK-CW-102',
      quantityLitres: 7.2,
      fatPercentage: 4.6,
      snfPercentage: 8.6,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:22:00`
    },
    {
      id: 'MLK-REC-10',
      date: today,
      shift: 'evening',
      animalId: 'ASK-CW-103',
      quantityLitres: 11.0,
      fatPercentage: 4.0,
      snfPercentage: 8.6,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:30:00`
    },
    {
      id: 'MLK-REC-11',
      date: today,
      shift: 'evening',
      animalId: 'ASK-CW-105',
      quantityLitres: 7.1,
      fatPercentage: 5.1,
      snfPercentage: 9.0,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-A (Okara)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:40:00`
    },
    {
      id: 'MLK-REC-12',
      date: today,
      shift: 'evening',
      animalId: 'ASK-BF-201',
      quantityLitres: 7.2,
      fatPercentage: 7.0,
      snfPercentage: 9.5,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:50:00`
    },
    {
      id: 'MLK-REC-13',
      date: today,
      shift: 'evening',
      animalId: 'ASK-BF-202',
      quantityLitres: 6.3,
      fatPercentage: 6.8,
      snfPercentage: 9.3,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T17:58:00`
    },
    {
      id: 'MLK-REC-14',
      date: today,
      shift: 'evening',
      animalId: 'ASK-BF-204',
      quantityLitres: 5.6,
      fatPercentage: 6.8,
      snfPercentage: 9.2,
      qualityStatus: 'grade_a',
      chillerTankId: 'CHILLER-TANK-B (Buffalo)',
      operatorId: 'Muhammad Aslam',
      branchId: 'branch-1',
      createdAt: `${today}T18:10:00`
    }
  ];
}

const defaultReconciliation: DailyMilkReconciliation = {
  id: 'REC-TODAY',
  date: getTodayDateStr(),
  branchId: 'branch-1',
  morningCollection: 63.5,
  eveningCollection: 52.7,
  totalCollected: 116.2,
  soldLitres: 74.0,
  calfFeedingLitres: 12.0,
  householdStaffLitres: 6.0,
  processingLitres: 20.0,
  wastedRejectedLitres: 0.0,
  remainingInChiller: 4.2,
  reconciledVariance: 0.0, // Reconciled to 0
  status: 'balanced',
  operatorNotes: 'Full reconciliation confirmed. Chiller stock matches physical sight glass.'
};

export class DairyDatabaseService {
  private static cachedDb: AppDatabase | null = null;

  public static getDatabase(): AppDatabase {
    if (this.cachedDb) return this.cachedDb;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.cachedDb = JSON.parse(stored);
        return this.cachedDb!;
      }
    } catch (e) {
      console.error('Failed to load database from localStorage, initializing defaults', e);
    }

    const initialDb: AppDatabase = {
      branches: defaultBranches,
      animals: defaultAnimals,
      milkRecords: generateInitialMilkRecords(),
      milkReconciliations: [defaultReconciliation],
      customers: defaultCustomers,
      customerLedgers: defaultCustomerLedgers,
      products: defaultProducts,
      productBatches: defaultBatches,
      sales: defaultSales,
      suppliers: defaultSuppliers,
      inventory: defaultInventory,
      inventoryMovements: [],
      feedPlans: defaultFeedPlans,
      feedConsumptions: defaultFeedConsumptions,
      vetRecords: defaultVetRecords,
      breedingRecords: defaultBreedingRecords,
      employees: defaultEmployees,
      payroll: defaultPayroll,
      accounts: defaultAccounts,
      journalEntries: defaultJournalEntries,
      notifications: defaultNotifications,
      shiftClosings: defaultShiftClosings
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  public static saveDatabase(db: AppDatabase): void {
    this.cachedDb = db;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to persist database to localStorage', e);
    }
  }

  public static resetToFactoryDefaults(): AppDatabase {
    localStorage.removeItem(STORAGE_KEY);
    this.cachedDb = null;
    return this.getDatabase();
  }

  // --- Transactions & Business Operations ---

  public static addAnimal(animal: Animal): void {
    const db = this.getDatabase();
    db.animals.unshift(animal);
    
    // Create accounting entry for capital asset purchase if cost > 0
    if (animal.purchaseCost > 0) {
      this.postJournalEntry({
        id: `JRN-PUR-${Date.now()}`,
        entryNumber: `JV-${Date.now().toString().slice(-6)}`,
        date: animal.purchaseDate || getTodayDateStr(),
        branchId: animal.branchId,
        description: `Biological Asset Purchase - ${animal.name} (${animal.earTag})`,
        referenceType: 'purchase',
        createdBy: 'Farm Manager',
        lines: [
          { accountId: 'ACC-1510', accountName: 'Biological Assets (Dairy Cattle)', accountCode: '1510', debit: animal.purchaseCost, credit: 0 },
          { accountId: 'ACC-1020', accountName: 'Meezan Bank - Main Operations', accountCode: '1020', debit: 0, credit: animal.purchaseCost }
        ]
      });
    }

    this.saveDatabase(db);
  }

  public static updateAnimal(animal: Animal): void {
    const db = this.getDatabase();
    const idx = db.animals.findIndex(a => a.id === animal.id);
    if (idx !== -1) {
      db.animals[idx] = animal;
      this.saveDatabase(db);
    }
  }

  public static deleteAnimal(animalId: string): void {
    const db = this.getDatabase();
    db.animals = db.animals.filter(a => a.id !== animalId);
    this.saveDatabase(db);
  }

  public static recordMilkProduction(records: MilkProductionRecord[]): void {
    const db = this.getDatabase();
    records.forEach(r => db.milkRecords.unshift(r));

    // Update raw milk stock in products table
    const totalNewLitres = records.reduce((sum, r) => sum + r.quantityLitres, 0);
    const buffaloMilk = db.products.find(p => p.id === 'prod-1');
    if (buffaloMilk) {
      buffaloMilk.stock = Number((buffaloMilk.stock + totalNewLitres * 0.55).toFixed(1));
    }
    const cowMilk = db.products.find(p => p.id === 'prod-2');
    if (cowMilk) {
      cowMilk.stock = Number((cowMilk.stock + totalNewLitres * 0.45).toFixed(1));
    }

    this.saveDatabase(db);
  }

  public static saveMilkReconciliation(recon: DailyMilkReconciliation): void {
    const db = this.getDatabase();
    const existingIdx = db.milkReconciliations.findIndex(r => r.date === recon.date && r.branchId === recon.branchId);
    if (existingIdx !== -1) {
      db.milkReconciliations[existingIdx] = recon;
    } else {
      db.milkReconciliations.unshift(recon);
    }
    this.saveDatabase(db);
  }

  public static completeSale(sale: Sale): void {
    const db = this.getDatabase();
    db.sales.unshift(sale);

    // 1. Decrement product stock & record inventory movement
    sale.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, Number((prod.stock - item.quantity).toFixed(2)));
      }
      db.inventoryMovements.unshift({
        id: `MOV-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        date: sale.date,
        itemId: item.productId,
        itemName: item.productName,
        type: 'pos_sale',
        quantityChange: -item.quantity,
        unitCost: prod ? prod.costPrice : 0,
        referenceId: sale.invoiceNumber,
        notes: `POS Sale to ${sale.customerName}`
      });
    });

    // 2. If credit or partial credit, update customer ledger
    if (sale.customerId !== 'WALK-IN' && sale.creditAmount > 0) {
      const cust = db.customers.find(c => c.id === sale.customerId);
      if (cust) {
        cust.balance += sale.creditAmount;
        db.customerLedgers.unshift({
          id: `LEDG-${Date.now()}`,
          customerId: cust.id,
          date: sale.date,
          type: 'sale',
          referenceId: sale.invoiceNumber,
          description: `Sale Invoice #${sale.invoiceNumber} (Credit Portion)`,
          debit: sale.creditAmount,
          credit: 0,
          runningBalance: cust.balance
        });
      }
    }

    // 3. Post double-entry accounting entry
    // Debit: Cash (ACC-1010) + Bank/Card (ACC-1020) + Receivables (ACC-1030)
    // Credit: Sales Revenue (ACC-4010 or ACC-4020)
    const cashPortion = sale.paidAmount;
    const creditPortion = sale.creditAmount;
    const lines = [];

    if (cashPortion > 0) {
      lines.push({
        accountId: 'ACC-1010',
        accountName: 'Cash in Register (Shop Drawer)',
        accountCode: '1010',
        debit: cashPortion,
        credit: 0
      });
    }

    if (creditPortion > 0) {
      lines.push({
        accountId: 'ACC-1030',
        accountName: 'Accounts Receivable (Customer Credit)',
        accountCode: '1030',
        debit: creditPortion,
        credit: 0
      });
    }

    lines.push({
      accountId: 'ACC-4010',
      accountName: 'Raw Milk & Dairy Sales Revenue',
      accountCode: '4010',
      debit: 0,
      credit: sale.total
    });

    this.postJournalEntry({
      id: `JRN-SL-${Date.now()}`,
      entryNumber: `JV-${sale.invoiceNumber}`,
      date: sale.date,
      branchId: sale.branchId,
      description: `POS Sale Invoice ${sale.invoiceNumber} - ${sale.customerName}`,
      referenceType: 'pos_sale',
      referenceId: sale.invoiceNumber,
      createdBy: sale.cashierName,
      lines
    });

    this.saveDatabase(db);
  }

  public static recordCustomerPayment(customerId: string, amount: number, method: PaymentMethod, reference: string): void {
    const db = this.getDatabase();
    const cust = db.customers.find(c => c.id === customerId);
    if (!cust) return;

    cust.balance -= amount;
    db.customerLedgers.unshift({
      id: `LEDG-${Date.now()}`,
      customerId: cust.id,
      date: getTodayDateStr(),
      type: 'payment',
      referenceId: reference,
      description: `Payment Received via ${method.toUpperCase()} ${reference ? `(Ref: ${reference})` : ''}`,
      debit: 0,
      credit: amount,
      runningBalance: cust.balance
    });

    // Debit Cash or Bank, Credit Receivables
    const targetAccountId = method === 'cash' ? 'ACC-1010' : 'ACC-1020';
    const targetAccountName = method === 'cash' ? 'Cash in Register' : 'Meezan Bank - Main Operations';

    this.postJournalEntry({
      id: `JRN-PAY-${Date.now()}`,
      entryNumber: `CRV-${Date.now().toString().slice(-6)}`,
      date: getTodayDateStr(),
      branchId: 'branch-1',
      description: `Customer Payment Received from ${cust.name}`,
      referenceType: 'manual',
      referenceId: reference,
      createdBy: 'Accountant',
      lines: [
        { accountId: targetAccountId, accountName: targetAccountName, accountCode: targetAccountId.replace('ACC-', ''), debit: amount, credit: 0 },
        { accountId: 'ACC-1030', accountName: 'Accounts Receivable (Customer Credit)', accountCode: '1030', debit: 0, credit: amount }
      ]
    });

    this.saveDatabase(db);
  }

  public static recordProductProcessingBatch(batch: ProductBatch): void {
    const db = this.getDatabase();
    db.productBatches.unshift(batch);

    // 1. Decrement raw milk product stock
    const rawMilk = db.products.find(p => p.id === 'prod-1') || db.products.find(p => p.category === 'raw_milk');
    if (rawMilk) {
      rawMilk.stock = Math.max(0, Number((rawMilk.stock - batch.inputMilkLitres).toFixed(1)));
    }

    // 2. Increment finished goods product stock
    const targetProduct = db.products.find(p => p.id === batch.productId);
    if (targetProduct) {
      targetProduct.stock = Number((targetProduct.stock + batch.actualOutputQty).toFixed(2));
      targetProduct.costPrice = Math.round(batch.unitCostCalculated);
    }

    // 3. Post accounting entry: Transfer from Raw Milk to Finished Goods Inventory
    const totalBatchCost = (batch.inputMilkLitres * batch.milkCostPerLitre) + batch.additionalCost;
    this.postJournalEntry({
      id: `JRN-PRC-${Date.now()}`,
      entryNumber: `JV-${batch.batchNumber}`,
      date: batch.productionDate,
      branchId: batch.branchId,
      description: `Dairy Processing Batch ${batch.batchNumber}: ${batch.inputMilkLitres}L milk -> ${batch.actualOutputQty} ${batch.unit} ${batch.productName}`,
      referenceType: 'processing',
      referenceId: batch.batchNumber,
      createdBy: batch.operatorName,
      lines: [
        { accountId: 'ACC-1050', accountName: 'Dairy Finished Goods Inventory', accountCode: '1050', debit: totalBatchCost, credit: 0 },
        { accountId: 'ACC-1040', accountName: 'Raw Milk Chiller Inventory', accountCode: '1040', debit: 0, credit: batch.inputMilkLitres * batch.milkCostPerLitre },
        { accountId: 'ACC-1010', accountName: 'Cash in Register (Shop Drawer)', accountCode: '1010', debit: 0, credit: batch.additionalCost }
      ]
    });

    this.saveDatabase(db);
  }

  public static recordFeedConsumption(record: FeedConsumptionRecord): void {
    const db = this.getDatabase();
    db.feedConsumptions.unshift(record);

    // Update account: Debit Feed Expense, Credit Feed Inventory
    this.postJournalEntry({
      id: `JRN-FEED-${Date.now()}`,
      entryNumber: `JV-FEED-${Date.now().toString().slice(-6)}`,
      date: record.date,
      branchId: record.branchId,
      description: `Daily Feed Consumption - ${record.feedPlanName} (${record.animalCount} animals)`,
      referenceType: 'expense',
      createdBy: record.operatorName,
      lines: [
        { accountId: 'ACC-5010', accountName: 'Feed & Fodder Consumption Expense', accountCode: '5010', debit: record.totalCost, credit: 0 },
        { accountId: 'ACC-1060', accountName: 'Feed, Fodder & Medicine Inventory', accountCode: '1060', debit: 0, credit: record.totalCost }
      ]
    });

    this.saveDatabase(db);
  }

  public static recordVeterinaryEvent(record: VeterinaryRecord): void {
    const db = this.getDatabase();
    db.vetRecords.unshift(record);

    if (record.withdrawalDays > 0) {
      db.notifications.unshift({
        id: `NOTIF-WD-${Date.now()}`,
        title: `Milk Withdrawal Alert: Tag ${record.animalEarTag}`,
        message: `${record.conditionDiagnosis}. Medicine ${record.medicineAdministered} requires ${record.withdrawalDays} days milk withholding. Segregate milk!`,
        type: 'withdrawal_alert',
        date: record.date,
        read: false,
        actionTab: 'vetBreeding'
      });
    }

    if (record.cost > 0) {
      this.postJournalEntry({
        id: `JRN-VET-${Date.now()}`,
        entryNumber: `JV-VET-${Date.now().toString().slice(-6)}`,
        date: record.date,
        branchId: 'branch-1',
        description: `Vet Treatment - ${record.animalEarTag}: ${record.conditionDiagnosis}`,
        referenceType: 'expense',
        createdBy: record.veterinarianName,
        lines: [
          { accountId: 'ACC-5020', accountName: 'Veterinary, Medicines & AI Expense', accountCode: '5020', debit: record.cost, credit: 0 },
          { accountId: 'ACC-1010', accountName: 'Cash in Register', accountCode: '1010', debit: 0, credit: record.cost }
        ]
      });
    }

    this.saveDatabase(db);
  }

  public static recordBreedingEvent(record: BreedingRecord): void {
    const db = this.getDatabase();
    db.breedingRecords.unshift(record);

    // If AI event, calculate expected calving date (~283 days for cow, ~310 days for buffalo)
    const animal = db.animals.find(a => a.id === record.animalId);
    if (record.eventType === 'artificial_insemination' && animal) {
      const gestationDays = animal.species === 'buffalo' ? 310 : 283;
      const aiDate = new Date(record.date);
      aiDate.setDate(aiDate.getDate() + gestationDays);
      const expectedCalving = aiDate.toISOString().split('T')[0];
      record.expectedCalvingDate = expectedCalving;
      animal.expectedCalvingDate = expectedCalving;
      animal.status = 'pregnant';
    }

    if (record.eventType === 'calving' && animal) {
      animal.status = 'milking';
      animal.lastCalvingDate = record.date;
      animal.lactationNumber += 1;
      animal.expectedCalvingDate = undefined;
    }

    this.saveDatabase(db);
  }

  public static postJournalEntry(entry: JournalEntry): void {
    const db = this.getDatabase();
    // Validate debits = credits
    const totalDebit = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);
    const totalCredit = entry.lines.reduce((s, l) => s + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 1) {
      console.warn(`Journal entry ${entry.entryNumber} is unbalanced: Debit ${totalDebit} != Credit ${totalCredit}`);
    }

    db.journalEntries.unshift(entry);

    // Update account balances
    entry.lines.forEach(line => {
      const acc = db.accounts.find(a => a.id === line.accountId);
      if (acc) {
        if (acc.type === 'asset' || acc.type === 'expense') {
          acc.balance += (line.debit - line.credit);
        } else {
          acc.balance += (line.credit - line.debit);
        }
      }
    });

    this.saveDatabase(db);
  }

  public static closeCashierShift(shiftData: CashierShiftClosing): void {
    const db = this.getDatabase();
    db.shiftClosings.unshift(shiftData);
    this.saveDatabase(db);
  }

  // --- Offline Mutations Queue ---
  public static getOfflineQueue(): OfflineMutation[] {
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  public static queueOfflineMutation(mutation: Omit<OfflineMutation, 'id' | 'timestamp' | 'status'>): void {
    const currentQueue = this.getOfflineQueue();
    const item: OfflineMutation = {
      ...mutation,
      id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      status: 'pending'
    };
    currentQueue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
  }

  public static syncOfflineQueue(): { successCount: number; failedCount: number } {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { successCount: 0, failedCount: 0 };

    let successCount = 0;
    let failedCount = 0;
    const remaining: OfflineMutation[] = [];

    queue.forEach(item => {
      try {
        if (item.action === 'record_milk') {
          this.recordMilkProduction(item.payload);
        } else if (item.action === 'create_sale') {
          this.completeSale(item.payload);
        } else if (item.action === 'add_animal') {
          this.addAnimal(item.payload);
        }
        successCount++;
      } catch (err: any) {
        failedCount++;
        item.status = 'failed';
        item.errorMessage = err?.message || 'Sync error';
        remaining.push(item);
      }
    });

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { successCount, failedCount };
  }

  // --- Export and Import Database ---
  public static exportDatabaseJSON(): string {
    const db = this.getDatabase();
    return JSON.stringify(db, null, 2);
  }

  public static importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.animals && parsed.products && parsed.accounts) {
        this.saveDatabase(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
