import { jsPDF } from 'jspdf';
import {
  EXPENDITURE_CATEGORIES,
  CREDIT_HISTORY_QUESTIONS,
  DOCUMENT_TYPES,
  type ApplicationFormData,
} from '@/types/application-form';

const PAGE_WIDTH = 210;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;

export async function exportApplicationToPDF(data: ApplicationFormData, title?: string) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;

  const checkPage = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const addHeading = (text: string) => {
    checkPage(14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135); // purple
    doc.text(text, MARGIN, y);
    y += 2;
    doc.setDrawColor(88, 28, 135);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 6;
  };

  const addField = (label: string, value: any) => {
    checkPage(LINE_HEIGHT + 2);
    const display =
      value === null || value === undefined || value === ''
        ? '—'
        : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : String(value);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, MARGIN, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const valX = MARGIN + 75;
    const lines = doc.splitTextToSize(display, CONTENT_WIDTH - 75);
    doc.text(lines, valX, y);
    y += Math.max(lines.length, 1) * (LINE_HEIGHT - 1) + 2;
  };

  const addSubheading = (text: string) => {
    checkPage(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(text, MARGIN, y);
    y += 6;
  };

  // Title page header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(88, 28, 135);
  doc.text('Development Funding Application', MARGIN, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(title || 'Application Export', MARGIN, y);
  y += 4;
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`, MARGIN, y);
  y += 10;

  // 1. Personal Details
  const pd = data.personalDetails;
  addHeading('1. Personal Details');
  addField('Title', pd.title);
  addField('Name', `${pd.firstName} ${pd.middleName} ${pd.surname}`.trim());
  if (pd.previousSurname) addField('Previous Surname', pd.previousSurname);
  addField('Date of Birth', pd.dateOfBirth);
  addField('Marital Status', pd.maritalStatus);
  addField('Nationality', pd.nationality);
  addField('Country of Birth', pd.countryOfBirth);
  addField('NI Number', pd.nationalInsuranceNumber);
  addField('Email', pd.email);
  addField('Mobile', pd.mobilePhone);
  if (pd.homePhone) addField('Home Phone', pd.homePhone);
  if (pd.workPhone) addField('Work Phone', pd.workPhone);
  addField('Smoker', pd.smoker);
  if (pd.dependants.length > 0) {
    addField('Dependants', pd.dependants.map(d => `${d.name} (DOB: ${d.dateOfBirth})`).join('; '));
  } else {
    addField('Dependants', 'None');
  }
  y += 4;

  // 2. Address History
  const ah = data.addressHistory;
  addHeading('2. Address History');
  addField('Current Address', `${ah.currentAddress.address}, ${ah.currentAddress.city}, ${ah.currentAddress.postcode}`);
  addField('Residential Status', ah.currentAddress.residentialStatus);
  addField('Move-in Date', ah.currentAddress.moveInDate);
  ah.previousAddresses.forEach((addr, i) => {
    addSubheading(`Previous Address ${i + 1}`);
    addField('Address', `${addr.address}, ${addr.city}, ${addr.country}, ${addr.postcode}`);
    addField('Status', addr.residentialStatus);
    addField('Period', `${addr.startDate} to ${addr.endDate}`);
  });
  y += 4;

  // 3. Expenditure
  addHeading('3. Personal Expenditure');
  let totalCurrent = 0;
  let totalProposed = 0;
  EXPENDITURE_CATEGORIES.forEach(cat => {
    const item = data.expenditure[cat.key];
    if (item && (item.current || item.proposed)) {
      addField(cat.label, `Current: £${(item.current || 0).toLocaleString()} / Proposed: £${(item.proposed || 0).toLocaleString()}`);
      totalCurrent += item.current || 0;
      totalProposed += item.proposed || 0;
    }
  });
  addField('Total Monthly', `Current: £${totalCurrent.toLocaleString()} / Proposed: £${totalProposed.toLocaleString()}`);
  y += 4;

  // 4. Bank Accounts
  addHeading('4. Bank Accounts');
  if (data.bankAccounts.length === 0) {
    addField('Accounts', 'None added');
  } else {
    data.bankAccounts.forEach((acc, i) => {
      addSubheading(`Account ${i + 1}`);
      addField('Holder', acc.accountHolderName);
      addField('Bank', acc.bankName);
      addField('Type', acc.accountType);
      addField('Sort Code', acc.sortCode);
      addField('Account Number', acc.accountNumber);
      addField('Income Paid In', acc.incomePaidIn);
      addField('Used for Mortgage', acc.usedForMortgage);
    });
  }
  y += 4;

  // 5. Assets & Liabilities
  const al = data.assetsLiabilities;
  addHeading('5. Assets & Liabilities');
  addField('Property Owner', al.propertyOwner);
  if (al.propertyOwner) {
    addField('Property Value', al.currentPropertyValue ? `£${al.currentPropertyValue.toLocaleString()}` : '—');
    addField('Monthly Mortgage', al.monthlyMortgagePayment ? `£${al.monthlyMortgagePayment.toLocaleString()}` : '—');
    addField('Mortgage Lender', al.mortgageLender);
    addField('Outstanding Balance', al.outstandingMortgageBalance ? `£${al.outstandingMortgageBalance.toLocaleString()}` : '—');
    addField('Interest Rate', al.interestRate ? `${al.interestRate}%` : '—');
    addField('Repayment Method', al.repaymentMethod);
    addField('Term Remaining', al.mortgageTermRemaining);
    addField('Early Repayment Charges', al.earlyRepaymentCharges ? `£${al.earlyRepaymentCharges.toLocaleString()}` : '—');
  }
  al.securedLoans.forEach((loan, i) => {
    addSubheading(`Secured Loan ${i + 1}`);
    addField('Lender', loan.lender);
    addField('Amount', loan.amount ? `£${loan.amount.toLocaleString()}` : '—');
    addField('Monthly Payment', loan.monthlyPayment ? `£${loan.monthlyPayment.toLocaleString()}` : '—');
    addField('Purpose', loan.purpose);
  });
  y += 4;

  // 6. Debts & Credit History
  addHeading('6. Debts & Credit History');
  if (data.debts.length === 0) {
    addField('Debts', 'None recorded');
  } else {
    data.debts.forEach((d, i) => {
      addSubheading(`Debt ${i + 1}`);
      addField('Type', d.debtType);
      addField('Provider', d.provider);
      addField('Outstanding', d.amountOutstanding ? `£${d.amountOutstanding.toLocaleString()}` : '—');
      addField('Monthly Payment', d.monthlyPayment ? `£${d.monthlyPayment.toLocaleString()}` : '—');
      addField('Repaid Before Completion', d.repaidBeforeCompletion);
    });
  }
  addSubheading('Credit History');
  CREDIT_HISTORY_QUESTIONS.forEach(q => {
    const item = data.creditHistory[q.key];
    if (item?.answer) {
      addField(q.label, `Yes — ${item.details || 'No details'}`);
    } else {
      addField(q.label, 'No');
    }
  });
  y += 4;

  // 7. Income
  const inc = data.income;
  addHeading('7. Income Information');
  addSubheading('Employment Income');
  addField('Occupation', inc.employmentIncome.occupation);
  addField('Employer', inc.employmentIncome.employerName);
  addField('Employer Address', inc.employmentIncome.employerAddress);
  addField('Employer Phone', inc.employmentIncome.employerPhone);
  addField('Start Date', inc.employmentIncome.startDate);
  addField('Salary (Before Tax)', inc.employmentIncome.salaryBeforeTax ? `£${inc.employmentIncome.salaryBeforeTax.toLocaleString()}` : '—');
  addField('Overtime', inc.employmentIncome.overtimeIncome ? `£${inc.employmentIncome.overtimeIncome.toLocaleString()}` : '—');
  addField('Bonus', inc.employmentIncome.bonusIncome ? `£${inc.employmentIncome.bonusIncome.toLocaleString()}` : '—');
  addField('Allowances', inc.employmentIncome.allowances ? `£${inc.employmentIncome.allowances.toLocaleString()}` : '—');
  if (inc.otherIncome.length > 0) {
    addSubheading('Other Income');
    inc.otherIncome.forEach(o => addField(o.source, o.amount ? `£${o.amount.toLocaleString()}` : '—'));
  }
  addField('Rental Income', inc.rentalIncome ? `£${inc.rentalIncome.toLocaleString()}/mo` : '—');
  y += 4;

  // 8. Business Ownership
  addHeading('8. Business Ownership');
  if (data.businesses.length === 0) {
    addField('Businesses', 'None');
  } else {
    data.businesses.forEach((b, i) => {
      addSubheading(`Business ${i + 1}`);
      addField('Name', b.businessName);
      addField('Type', b.businessType);
      addField('Start Date', b.startDate);
      addField('Ownership', b.ownershipPercentage ? `${b.ownershipPercentage}%` : '—');
      addField('Address', b.businessAddress);
      addField('Status', b.companyStatus);
      addField('PAYE Income', b.payeIncome ? `£${b.payeIncome.toLocaleString()}` : '—');
      addField('Dividend Income', b.dividendIncome ? `£${b.dividendIncome.toLocaleString()}` : '—');
      if (b.yearlyNetProfit.length > 0) {
        addField('Net Profit', b.yearlyNetProfit.map(p => `${p.year}: £${(p.profit || 0).toLocaleString()}`).join('; '));
      }
    });
  }
  y += 4;

  // 9. Property Portfolio
  addHeading('9. Property Portfolio');
  if (data.properties.length === 0) {
    addField('Properties', 'None');
  } else {
    data.properties.forEach((p, i) => {
      addSubheading(`Property ${i + 1}`);
      addField('Address', p.address);
      addField('Ownership', p.ownershipType);
      addField('Value', p.currentValue ? `£${p.currentValue.toLocaleString()}` : '—');
      addField('Lender', p.mortgageLender);
      addField('Purchase Date', p.purchaseDate);
      addField('Outstanding Mortgage', p.outstandingMortgage ? `£${p.outstandingMortgage.toLocaleString()}` : '—');
      addField('Interest Rate', p.interestRate ? `${p.interestRate}%` : '—');
      addField('Monthly Payment', p.monthlyPayment ? `£${p.monthlyPayment.toLocaleString()}` : '—');
      addField('Repayment Method', p.repaymentMethod);
      addField('Remaining Term', p.remainingTerm);
      addField('Rental Income', p.rentalIncome ? `£${p.rentalIncome.toLocaleString()}/mo` : '—');
    });
  }
  y += 4;

  // 10. Loan Details
  const ld = data.loanDetails;
  addHeading('10. Proposed Loan Details');
  addField('Application Type', ld.applicationType);
  addField('Loan Type', ld.loanType);
  addField('Loan %', ld.loanPercentage ? `${ld.loanPercentage}%` : '—');
  addField('Loan Term', ld.loanTerm);
  addField('Repayment Method', ld.repaymentMethod);
  addField('Purchase Price', ld.purchasePrice ? `£${ld.purchasePrice.toLocaleString()}` : '—');
  addField('Property Value', ld.propertyValue ? `£${ld.propertyValue.toLocaleString()}` : '—');
  addField('Property Address', ld.propertyAddress);
  addField('Description', ld.propertyDescription);
  addField('Expected Rental Income', ld.rentalIncomeExpected ? `£${ld.rentalIncomeExpected.toLocaleString()}/mo` : '—');
  addField('Planned Use', ld.plannedUse);
  addField('Repayment Plan', ld.repaymentPlan);
  y += 4;

  // 11. Documents
  addHeading('11. Documents');
  DOCUMENT_TYPES.forEach(dt => {
    const count = data.documents.filter(d => d.type === dt.key).length;
    addField(dt.label, count > 0 ? `${count} uploaded` : 'Not uploaded');
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH / 2, 292, { align: 'center' });
    doc.text('RFPN — Confidential', MARGIN, 292);
  }

  const fileName = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` : 'Application_Export.pdf';
  doc.save(fileName);
}
