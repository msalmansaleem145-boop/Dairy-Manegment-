export type UserRole = 
  | 'super_admin'
  | 'farm_owner'
  | 'farm_manager'
  | 'accountant'
  | 'milk_operator'
  | 'pos_operator'
  | 'veterinarian'
  | 'inventory_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
}

export interface FarmBranch {
  id: string;
  name: string;
  location: string;
  code: string;
  isMain: boolean;
  phone: string;
  managerName: string;
}

export type AnimalSpecies = 'cow' | 'buffalo';
export type AnimalGender = 'female' | 'male';
export type AnimalStatus = 'milking' | 'dry' | 'pregnant' | 'sick' | 'calved' | 'sold' | 'deceased';
export type AnimalBreed = 
  | 'Sahiwal' 
  | 'Cholistani' 
  | 'Friesian' 
  | 'Jersey' 
  | 'Crossbred' 
  | 'Nili-Ravi Buffalo' 
  | 'Kundi Buffalo';

export interface Animal {
  id: string; // e.g. ASK-CW-101
  earTag: string; // e.g. PK-7240
  name: string;
  species: AnimalSpecies;
  breed: AnimalBreed;
  gender: AnimalGender;
  dob: string;
  purchaseDate: string;
  purchaseCost: number;
  status: AnimalStatus;
  lactationNumber: number;
  branchId: string;
  weightKg?: number;
  currentAvgDailyYield: number; // Litres
  feedRationId?: string;
  photoUrl?: string;
  sire?: string;
  dam?: string;
  lastCalvingDate?: string;
  expectedCalvingDate?: string;
  notes?: string;
}

export type MilkShift = 'morning' | 'evening';
export type MilkQualityStatus = 'grade_a' | 'standard' | 'substandard' | 'rejected';

export interface MilkProductionRecord {
  id: string;
  date: string;
  shift: MilkShift;
  animalId: string;
  quantityLitres: number;
  fatPercentage: number;
  snfPercentage: number;
  qualityStatus: MilkQualityStatus;
  chillerTankId: string;
  operatorId: string;
  branchId: string;
  notes?: string;
  createdAt: string;
}

export interface DailyMilkReconciliation {
  id: string;
  date: string;
  branchId: string;
  morningCollection: number;
  eveningCollection: number;
  totalCollected: number;
  soldLitres: number;
  calfFeedingLitres: number;
  householdStaffLitres: number;
  processingLitres: number;
  wastedRejectedLitres: number;
  remainingInChiller: number;
  reconciledVariance: number; // Total Collected - (Sold + Fed + Household + Processed + Wasted + Remaining)
  status: 'balanced' | 'variance_flagged';
  operatorNotes?: string;
}

export type CustomerCategory = 'retail' | 'wholesale' | 'hotel_dairy' | 'subscription';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: CustomerCategory;
  creditLimit: number;
  openingBalance: number;
  balance: number; // positive = customer owes farm, negative = advance paid
  dailyMilkQuotaLitres?: number;
  deliveryShift?: 'morning' | 'evening' | 'both';
  preferredPricePerLitre?: number;
  notes?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'sale' | 'payment' | 'return' | 'opening';
  referenceId?: string;
  description: string;
  debit: number; // invoice amount (increases balance)
  credit: number; // payment received (decreases balance)
  runningBalance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  category: 'feed' | 'medicines' | 'packaging' | 'equipment';
  balance: number; // positive = farm owes supplier
  address: string;
  bankDetails?: string;
}

export type ProductCategory = 'raw_milk' | 'value_added' | 'packaged';
export type ProductUnit = 'litre' | 'half_litre' | 'kg' | 'packet' | 'bottle';

export interface Product {
  id: string;
  code: string;
  name: string;
  nameUrdu: string;
  category: ProductCategory;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  description: string;
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  productionDate: string;
  inputMilkLitres: number;
  milkCostPerLitre: number;
  additionalCost: number; // cultures, packaging, cooking gas
  expectedOutputQty: number;
  actualOutputQty: number;
  unit: ProductUnit;
  yieldEfficiencyPct: number;
  lossWastageQty: number;
  unitCostCalculated: number;
  expiryDate: string;
  operatorName: string;
  branchId: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_raast' | 'easypaisa_jazzcash' | 'credit' | 'split';

export interface Sale {
  id: string;
  invoiceNumber: string;
  branchId: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  splitPayments?: { method: PaymentMethod; amount: number }[];
  creditAmount: number;
  cashierName: string;
  notes?: string;
  status: 'completed' | 'refunded';
}

export type InventoryCategory = 'feed_fodder' | 'medicine_vaccine' | 'packaging' | 'raw_material' | 'finished_goods';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  location: string;
  expiryDate?: string;
  supplierId?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'feed_consumption' | 'processing_in' | 'processing_out' | 'pos_sale' | 'spoilage' | 'adjustment';
  quantityChange: number;
  unitCost: number;
  referenceId?: string;
  notes: string;
}

export interface FeedPlan {
  id: string;
  name: string;
  targetGroup: 'milking' | 'dry' | 'high_yield' | 'calves';
  dailyRationItems: {
    itemId: string;
    itemName: string;
    quantityKg: number;
    unitCost: number;
  }[];
  costPerDayPerAnimal: number;
  notes?: string;
}

export interface FeedConsumptionRecord {
  id: string;
  date: string;
  branchId: string;
  feedPlanId: string;
  feedPlanName: string;
  animalCount: number;
  totalKg: number;
  totalCost: number;
  operatorName: string;
}

export type VetRecordType = 'vaccination' | 'treatment' | 'deworming' | 'routine_check';

export interface VeterinaryRecord {
  id: string;
  animalId: string;
  animalEarTag: string;
  date: string;
  type: VetRecordType;
  conditionDiagnosis: string;
  medicineAdministered: string;
  dose: string;
  cost: number;
  withdrawalDays: number; // Days milk cannot be sold for human consumption
  veterinarianName: string;
  followUpDate?: string;
  notes?: string;
}

export type BreedingEventType = 'heat_detected' | 'artificial_insemination' | 'pd_check' | 'calving';

export interface BreedingRecord {
  id: string;
  animalId: string;
  animalEarTag: string;
  date: string;
  eventType: BreedingEventType;
  semenStrawId?: string;
  sireBreed?: string;
  technicianName: string;
  pdResult?: 'pregnant' | 'non_pregnant' | 'recheck';
  expectedCalvingDate?: string;
  calvingEase?: 'normal' | 'assisted' | 'difficult' | 'c_section';
  calfGender?: 'male' | 'female';
  calfEarTag?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  role: string;
  branchId: string;
  joinDate: string;
  salaryType: 'monthly' | 'daily' | 'per_litre_incentive';
  baseSalary: number;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface PayrollRecord {
  id: string;
  monthYear: string; // YYYY-MM
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  allowances: number;
  advancesDeducted: number;
  netPayable: number;
  paidDate: string;
  paymentMethod: 'cash' | 'bank_transfer';
  status: 'paid' | 'pending';
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType: string;
  balance: number;
  description: string;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  branchId: string;
  description: string;
  referenceType?: 'pos_sale' | 'purchase' | 'payroll' | 'expense' | 'processing' | 'manual';
  referenceId?: string;
  lines: JournalLine[];
  createdBy: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'vaccination_due' | 'calving_expected' | 'overdue_credit' | 'milk_variance' | 'withdrawal_alert';
  date: string;
  read: boolean;
  actionTab?: string;
}

export interface OfflineMutation {
  id: string;
  timestamp: number;
  action: 'record_milk' | 'create_sale' | 'add_animal' | 'add_expense';
  payload: any;
  status: 'pending' | 'synced' | 'failed';
  errorMessage?: string;
}

export interface CashierShiftClosing {
  id: string;
  branchId: string;
  date: string;
  shift: MilkShift;
  cashierName: string;
  openingCash: number;
  totalCashSales: number;
  totalCardWalletSales: number;
  totalCreditSales: number;
  cashPaidOutExpenses: number;
  expectedDrawerCash: number;
  actualDrawerCashCount: number;
  variance: number;
  notes?: string;
  closedAt: string;
}
