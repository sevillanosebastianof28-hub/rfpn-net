import { Badge } from '@/components/ui/badge';
import { EXPENDITURE_CATEGORIES, CREDIT_HISTORY_QUESTIONS, DOCUMENT_TYPES, STEP_LABELS, type ApplicationFormData } from '@/types/application-form';

interface Props {
  data: ApplicationFormData;
  onGoToStep: (step: number) => void;
}

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (s: number) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3 p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button className="text-sm text-primary hover:underline" onClick={() => onEdit(step)}>Edit</button>
      </div>
      <div className="text-sm space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  const display = value === null || value === undefined || value === '' ? '—' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="flex justify-between py-1 border-b border-dashed last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{display}</span>
    </div>
  );
}

export function Step12Review({ data, onGoToStep }: Props) {
  const pd = data.personalDetails;
  const ah = data.addressHistory;
  const al = data.assetsLiabilities;
  const inc = data.income;
  const ld = data.loanDetails;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium">Please review all information before submitting. Click "Edit" on any section to make changes.</p>
      </div>

      <Section title="1. Personal Details" step={1} onEdit={onGoToStep}>
        <Field label="Name" value={`${pd.title} ${pd.firstName} ${pd.middleName} ${pd.surname}`.trim()} />
        <Field label="Date of Birth" value={pd.dateOfBirth} />
        <Field label="Email" value={pd.email} />
        <Field label="Mobile" value={pd.mobilePhone} />
        <Field label="Nationality" value={pd.nationality} />
        <Field label="NI Number" value={pd.nationalInsuranceNumber} />
        <Field label="Smoker" value={pd.smoker} />
        <Field label="Dependants" value={pd.dependants.length > 0 ? pd.dependants.map(d => d.name).join(', ') : 'None'} />
      </Section>

      <Section title="2. Address History" step={2} onEdit={onGoToStep}>
        <Field label="Current Address" value={`${ah.currentAddress.address}, ${ah.currentAddress.postcode}`} />
        <Field label="Status" value={ah.currentAddress.residentialStatus} />
        <Field label="Previous Addresses" value={`${ah.previousAddresses.length} recorded`} />
      </Section>

      <Section title="3. Expenditure" step={3} onEdit={onGoToStep}>
        {(() => {
          const total = Object.values(data.expenditure).reduce((s, v) => s + (v.current || 0), 0);
          return <Field label="Total Monthly Expenditure" value={`£${total.toLocaleString()}`} />;
        })()}
      </Section>

      <Section title="4. Bank Accounts" step={4} onEdit={onGoToStep}>
        <Field label="Accounts" value={`${data.bankAccounts.length} added`} />
        {data.bankAccounts.map((a, i) => <Field key={i} label={a.bankName || `Account ${i+1}`} value={a.accountType} />)}
      </Section>

      <Section title="5. Assets & Liabilities" step={5} onEdit={onGoToStep}>
        <Field label="Property Owner" value={al.propertyOwner} />
        {al.propertyOwner && <Field label="Property Value" value={al.currentPropertyValue ? `£${al.currentPropertyValue.toLocaleString()}` : '—'} />}
        <Field label="Secured Loans" value={`${al.securedLoans.length} recorded`} />
      </Section>

      <Section title="6. Debts & Credit" step={6} onEdit={onGoToStep}>
        <Field label="Debts" value={`${data.debts.length} recorded`} />
        {CREDIT_HISTORY_QUESTIONS.filter(q => data.creditHistory[q.key]?.answer).map(q => (
          <Field key={q.key} label={q.label} value="Yes" />
        ))}
      </Section>

      <Section title="7. Income" step={7} onEdit={onGoToStep}>
        <Field label="Occupation" value={inc.employmentIncome.occupation} />
        <Field label="Salary" value={inc.employmentIncome.salaryBeforeTax ? `£${inc.employmentIncome.salaryBeforeTax.toLocaleString()}` : '—'} />
        <Field label="Rental Income" value={inc.rentalIncome ? `£${inc.rentalIncome.toLocaleString()}/mo` : '—'} />
      </Section>

      <Section title="8. Business Ownership" step={8} onEdit={onGoToStep}>
        <Field label="Businesses" value={`${data.businesses.length} added`} />
        {data.businesses.map((b, i) => <Field key={i} label={b.businessName} value={b.companyStatus} />)}
      </Section>

      <Section title="9. Property Portfolio" step={9} onEdit={onGoToStep}>
        <Field label="Properties" value={`${data.properties.length} added`} />
        {data.properties.map((p, i) => <Field key={i} label={p.address || `Property ${i+1}`} value={p.currentValue ? `£${p.currentValue.toLocaleString()}` : '—'} />)}
      </Section>

      <Section title="10. Loan Details" step={10} onEdit={onGoToStep}>
        <Field label="Application Type" value={ld.applicationType} />
        <Field label="Loan Type" value={ld.loanType} />
        <Field label="Purchase Price" value={ld.purchasePrice ? `£${ld.purchasePrice.toLocaleString()}` : '—'} />
        <Field label="Loan %" value={ld.loanPercentage ? `${ld.loanPercentage}%` : '—'} />
      </Section>

      <Section title="11. Documents" step={11} onEdit={onGoToStep}>
        {DOCUMENT_TYPES.map(dt => {
          const count = data.documents.filter(d => d.type === dt.key).length;
          return <Field key={dt.key} label={dt.label} value={count > 0 ? <Badge variant="secondary">{count} uploaded</Badge> : '—'} />;
        })}
      </Section>
    </div>
  );
}
