export interface Dependant {
  name: string;
  dateOfBirth: string;
}

export interface PersonalDetails {
  title: string;
  firstName: string;
  middleName: string;
  surname: string;
  previousSurname: string;
  dateOfBirth: string;
  maritalStatus: string;
  nationality: string;
  countryOfBirth: string;
  nationalInsuranceNumber: string;
  email: string;
  mobilePhone: string;
  homePhone: string;
  workPhone: string;
  smoker: boolean | null;
  dependants: Dependant[];
}

export interface AddressEntry {
  address: string;
  city: string;
  country: string;
  postcode: string;
  residentialStatus: string;
  startDate: string;
  endDate: string;
}

export interface AddressHistory {
  currentAddress: { address: string; city: string; country: string; postcode: string; residentialStatus: string; moveInDate: string };
  previousAddresses: AddressEntry[];
}

export interface ExpenditureItem {
  current: number | null;
  proposed: number | null;
}

export interface BankAccount {
  accountHolderName: string;
  bankName: string;
  accountType: string;
  sortCode: string;
  accountNumber: string;
  incomePaidIn: boolean | null;
  usedForMortgage: boolean | null;
}

export interface SecuredLoan {
  lender: string;
  amount: number | null;
  monthlyPayment: number | null;
  purpose: string;
}

export interface AssetsLiabilities {
  propertyOwner: boolean | null;
  currentPropertyValue: number | null;
  monthlyMortgagePayment: number | null;
  mortgageLender: string;
  outstandingMortgageBalance: number | null;
  interestRate: number | null;
  repaymentMethod: string;
  mortgageTermRemaining: string;
  earlyRepaymentCharges: number | null;
  securedLoans: SecuredLoan[];
}

export interface DebtEntry {
  debtType: string;
  provider: string;
  amountOutstanding: number | null;
  monthlyPayment: number | null;
  repaidBeforeCompletion: boolean | null;
}

export interface CreditHistoryItem {
  answer: boolean | null;
  details: string;
}

export interface EmploymentIncome {
  occupation: string;
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  startDate: string;
  salaryBeforeTax: number | null;
  overtimeIncome: number | null;
  bonusIncome: number | null;
  allowances: number | null;
}

export interface BusinessEntry {
  businessName: string;
  businessType: string;
  startDate: string;
  ownershipPercentage: number | null;
  businessAddress: string;
  companyStatus: string;
  yearlyNetProfit: Array<{ year: string; profit: number | null }>;
  payeIncome: number | null;
  dividendIncome: number | null;
}

export interface PropertyEntry {
  address: string;
  ownershipType: string;
  currentValue: number | null;
  mortgageLender: string;
  purchaseDate: string;
  outstandingMortgage: number | null;
  interestRate: number | null;
  monthlyPayment: number | null;
  repaymentMethod: string;
  remainingTerm: string;
  rentalIncome: number | null;
}

export interface LoanDetails {
  applicationType: string;
  loanType: string;
  loanPercentage: number | null;
  loanTerm: string;
  repaymentMethod: string;
  purchasePrice: number | null;
  propertyValue: number | null;
  propertyAddress: string;
  propertyDescription: string;
  rentalIncomeExpected: number | null;
  plannedUse: string;
  repaymentPlan: string;
}

export interface DocumentUpload {
  type: string;
  fileId: string;
  fileName: string;
  documentDate?: string; // Date of the document (not upload date)
}

export interface ESignature {
  signatureData: string; // base64 SVG or canvas data
  signedAt: string;
  signerName: string;
}

export interface ApplicationFormData {
  personalDetails: PersonalDetails;
  addressHistory: AddressHistory;
  expenditure: Record<string, ExpenditureItem>;
  bankAccounts: BankAccount[];
  assetsLiabilities: AssetsLiabilities;
  debts: DebtEntry[];
  creditHistory: Record<string, CreditHistoryItem>;
  income: {
    employmentIncome: EmploymentIncome;
    otherIncome: Array<{ source: string; amount: number | null }>;
    rentalIncome: number | null;
  };
  businesses: BusinessEntry[];
  properties: PropertyEntry[];
  loanDetails: LoanDetails;
  documents: DocumentUpload[];
  eSignature?: ESignature;
  currentStep: number;
  adminNotes: Array<{ note: string; author: string; createdAt: string }>;
}

export const STEP_LABELS = [
  'Personal Details',
  'Address History',
  'Personal Expenditure',
  'Bank Accounts',
  'Assets & Liabilities',
  'Debts & Credit History',
  'Income Information',
  'Business Ownership',
  'Property Portfolio',
  'Loan Details',
  'Document Uploads',
  'Review & Submit',
];

export const EXPENDITURE_CATEGORIES = [
  { key: 'rentMortgage', label: 'Rent / Mortgage' },
  { key: 'food', label: 'Food' },
  { key: 'councilTax', label: 'Council Tax' },
  { key: 'gasElectricity', label: 'Gas and Electricity' },
  { key: 'water', label: 'Water' },
  { key: 'internetTv', label: 'Internet / TV' },
  { key: 'mobilePhone', label: 'Mobile Phone' },
  { key: 'carInsurance', label: 'Car Insurance' },
  { key: 'carTax', label: 'Car Tax' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'travelCosts', label: 'Travel Costs' },
  { key: 'propertyMaintenance', label: 'Property Maintenance' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'pets', label: 'Pets' },
  { key: 'childcare', label: 'Childcare' },
  { key: 'schoolFees', label: 'School Fees' },
  { key: 'healthCosts', label: 'Health Costs' },
  { key: 'savings', label: 'Savings' },
  { key: 'holidays', label: 'Holidays' },
  { key: 'leisure', label: 'Leisure' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'otherExpenses', label: 'Other Expenses' },
];

export const CREDIT_HISTORY_QUESTIONS = [
  { key: 'lateMortgage', label: 'Late mortgage payments' },
  { key: 'lateLoan', label: 'Late loan payments' },
  { key: 'defaults', label: 'Defaults' },
  { key: 'ccj', label: 'County Court Judgements' },
  { key: 'bankruptcy', label: 'Bankruptcy' },
  { key: 'refusedCredit', label: 'Refused credit' },
  { key: 'exceededLimits', label: 'Exceeded credit limits' },
  { key: 'ivaDebtPlan', label: 'IVA or Debt management plan' },
];

export const DOCUMENT_TYPES = [
  { key: 'passport', label: 'Passport / ID' },
  { key: 'proofOfAddress', label: 'Proof of Address' },
  { key: 'bankStatements', label: 'Bank Statements' },
  { key: 'incomeEvidence', label: 'Income Evidence' },
  { key: 'creditReport', label: 'Credit Report' },
  { key: 'businessDocuments', label: 'Business Documents' },
];

export function getDefaultFormData(): ApplicationFormData {
  const expenditure: Record<string, ExpenditureItem> = {};
  EXPENDITURE_CATEGORIES.forEach(c => { expenditure[c.key] = { current: null, proposed: null }; });

  const creditHistory: Record<string, CreditHistoryItem> = {};
  CREDIT_HISTORY_QUESTIONS.forEach(q => { creditHistory[q.key] = { answer: null, details: '' }; });

  return {
    personalDetails: {
      title: '', firstName: '', middleName: '', surname: '', previousSurname: '',
      dateOfBirth: '', maritalStatus: '', nationality: '', countryOfBirth: '',
      nationalInsuranceNumber: '', email: '', mobilePhone: '', homePhone: '', workPhone: '',
      smoker: null, dependants: [],
    },
    addressHistory: {
      currentAddress: { address: '', city: '', country: '', postcode: '', residentialStatus: '', moveInDate: '' },
      previousAddresses: [],
    },
    expenditure,
    bankAccounts: [],
    assetsLiabilities: {
      propertyOwner: null, currentPropertyValue: null, monthlyMortgagePayment: null,
      mortgageLender: '', outstandingMortgageBalance: null, interestRate: null,
      repaymentMethod: '', mortgageTermRemaining: '', earlyRepaymentCharges: null,
      securedLoans: [],
    },
    debts: [],
    creditHistory,
    income: {
      employmentIncome: {
        occupation: '', employerName: '', employerAddress: '', employerPhone: '',
        startDate: '', salaryBeforeTax: null, overtimeIncome: null, bonusIncome: null, allowances: null,
      },
      otherIncome: [],
      rentalIncome: null,
    },
    businesses: [],
    properties: [],
    loanDetails: {
      applicationType: '', loanType: '', loanPercentage: null, loanTerm: '',
      repaymentMethod: '', purchasePrice: null, propertyValue: null, propertyAddress: '',
      propertyDescription: '', rentalIncomeExpected: null, plannedUse: '', repaymentPlan: '',
    },
    documents: [],
    currentStep: 1,
    adminNotes: [],
  };
}
