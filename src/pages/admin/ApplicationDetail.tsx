import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Download, Plus, FileDown, UserPlus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { STEP_LABELS, EXPENDITURE_CATEGORIES, CREDIT_HISTORY_QUESTIONS, DOCUMENT_TYPES, getDefaultFormData, type ApplicationFormData } from '@/types/application-form';
import { exportApplicationToPDF } from '@/lib/export-pdf';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRow = Database['public']['Tables']['applications']['Row'];

function Field({ label, value }: { label: string; value: any }) {
  const display = value === null || value === undefined || value === '' ? '—' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="flex justify-between py-1.5 border-b border-dashed last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm text-right max-w-[60%]">{display}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 p-4 rounded-lg border">
      <h3 className="font-semibold text-base">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState<AppRow | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>(getDefaultFormData());
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [brokers, setBrokers] = useState<{ user_id: string; first_name: string; last_name: string }[]>([]);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocBrokerName, setAllocBrokerName] = useState('JAG Finance');
  const [allocBrokerEmail, setAllocBrokerEmail] = useState('leanne@jagfs.co.uk');
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Load app and brokers in parallel
    Promise.all([
      supabase.from('applications').select('*').eq('id', id).single(),
      supabase.from('user_roles').select('user_id').eq('role', 'broker'),
    ]).then(async ([appRes, rolesRes]) => {
      if (appRes.data) {
        setApp(appRes.data);
        const pd = (appRes.data.project_details as any) || {};
        setFormData({ ...getDefaultFormData(), ...pd });
      }
      // Fetch broker profiles
      const brokerIds = (rolesRes.data || []).map(r => r.user_id);
      if (brokerIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name').in('user_id', brokerIds);
        setBrokers(profiles || []);
      }
      setLoading(false);
    });
  }, [id]);

  const assignBroker = async (brokerId: string) => {
    if (!app) return;
    const { error } = await supabase.from('applications').update({ assigned_broker_id: brokerId }).eq('id', app.id);
    if (error) { toast.error('Failed to assign broker'); return; }
    toast.success('Broker assigned');
    setApp({ ...app, assigned_broker_id: brokerId });
  };

  const changeStatus = async (status: string) => {
    if (!app) return;
    setStatusUpdating(true);
    const { error } = await supabase.from('applications').update({
      status: status as any,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    }).eq('id', app.id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success(`Status updated to ${status}`);
      setApp({ ...app, status: status as any });
    }
    setStatusUpdating(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !app) return;
    const notes = [...(formData.adminNotes || []), {
      note: newNote.trim(),
      author: 'Admin',
      createdAt: new Date().toISOString(),
    }];
    const updated = { ...formData, adminNotes: notes };
    await supabase.from('applications').update({ project_details: updated as any }).eq('id', app.id);
    setFormData(updated);
    setNewNote('');
    toast.success('Note added');
  };

  const downloadDoc = async (storagePath: string, fileName: string) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 300);
    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = fileName;
      a.click();
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!app) return <div className="text-center py-20 text-muted-foreground">Application not found.</div>;

  const pd = formData.personalDetails;
  const ah = formData.addressHistory;
  const al = formData.assetsLiabilities;
  const inc = formData.income;
  const ld = formData.loanDetails;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin/applications')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to Applications
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{app.title}</h1>
          <p className="text-sm text-muted-foreground">Created {format(new Date(app.created_at), 'PPP')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => exportApplicationToPDF(formData, app.title)}>
            <FileDown className="h-4 w-4 mr-1" /> Export PDF
          </Button>
          <StatusBadge status={app.status as any} />
          <Select value={app.status} onValueChange={changeStatus} disabled={statusUpdating}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['draft', 'submitted', 'under_review', 'info_requested', 'approved', 'declined', 'completed'].map(s => (
                <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Broker Assignment */}
      <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20">
        <UserPlus className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Assign Broker</p>
          <p className="text-xs text-muted-foreground">Application will appear in the assigned broker's portal</p>
        </div>
        <Select value={app.assigned_broker_id || 'unassigned'} onValueChange={v => v !== 'unassigned' && assignBroker(v)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select broker..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned" disabled>Unassigned</SelectItem>
            {brokers.map(b => (
              <SelectItem key={b.user_id} value={b.user_id}>{b.first_name} {b.last_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Application Data Sections */}
      <Section title="1. Personal Details">
        <Field label="Name" value={`${pd.title} ${pd.firstName} ${pd.middleName} ${pd.surname}`.trim()} />
        <Field label="Previous Surname" value={pd.previousSurname} />
        <Field label="Date of Birth" value={pd.dateOfBirth} />
        <Field label="Marital Status" value={pd.maritalStatus} />
        <Field label="Nationality" value={pd.nationality} />
        <Field label="Country of Birth" value={pd.countryOfBirth} />
        <Field label="NI Number" value={pd.nationalInsuranceNumber} />
        <Field label="Email" value={pd.email} />
        <Field label="Mobile" value={pd.mobilePhone} />
        <Field label="Home Phone" value={pd.homePhone} />
        <Field label="Work Phone" value={pd.workPhone} />
        <Field label="Smoker" value={pd.smoker} />
        <Field label="Dependants" value={pd.dependants.length > 0 ? pd.dependants.map(d => `${d.name} (${d.dateOfBirth})`).join('; ') : 'None'} />
      </Section>

      <Section title="2. Address History">
        <Field label="Current Address" value={`${ah.currentAddress.address}, ${ah.currentAddress.city}, ${ah.currentAddress.postcode}`} />
        <Field label="Residential Status" value={ah.currentAddress.residentialStatus} />
        <Field label="Move-in Date" value={ah.currentAddress.moveInDate} />
        {ah.previousAddresses.map((a, i) => (
          <div key={i} className="mt-2 pt-2 border-t">
            <Field label={`Previous Address ${i + 1}`} value={`${a.address}, ${a.city}, ${a.postcode}`} />
            <Field label="Period" value={`${a.startDate} — ${a.endDate}`} />
            <Field label="Status" value={a.residentialStatus} />
          </div>
        ))}
      </Section>

      <Section title="3. Monthly Expenditure">
        {EXPENDITURE_CATEGORIES.filter(c => formData.expenditure[c.key]?.current).map(c => (
          <Field key={c.key} label={c.label} value={`£${formData.expenditure[c.key].current} / £${formData.expenditure[c.key].proposed ?? '—'}`} />
        ))}
        <Field label="Total Current" value={`£${Object.values(formData.expenditure).reduce((s, v) => s + (v.current || 0), 0).toLocaleString()}`} />
      </Section>

      <Section title="4. Bank Accounts">
        {formData.bankAccounts.map((a, i) => (
          <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t' : ''}>
            <Field label="Holder" value={a.accountHolderName} />
            <Field label="Bank" value={a.bankName} />
            <Field label="Type" value={a.accountType} />
            <Field label="Sort Code" value={a.sortCode} />
            <Field label="Account No." value={a.accountNumber} />
          </div>
        ))}
        {formData.bankAccounts.length === 0 && <p className="text-muted-foreground text-sm">None provided</p>}
      </Section>

      <Section title="5. Assets & Liabilities">
        <Field label="Property Owner" value={al.propertyOwner} />
        {/* Show new multi-property format */}
        {(al.ownedProperties || []).length > 0 ? (
          (al.ownedProperties || []).map((p: any, i: number) => (
            <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t' : 'mt-2'}>
              <Field label={`Property ${i + 1}`} value={p.address} />
              <Field label="Held In" value={p.heldIn === 'personal' ? 'Personal Name' : p.heldIn === 'company' ? 'Company Name' : '—'} />
              <Field label="Ownership" value={p.ownershipStatus?.replace(/_/g, ' ') || '—'} />
              <Field label="Value" value={p.currentValue ? `£${p.currentValue.toLocaleString()}` : '—'} />
              <Field label="Mortgage Lender" value={p.mortgageLender} />
              <Field label="Outstanding" value={p.outstandingMortgageBalance ? `£${p.outstandingMortgageBalance.toLocaleString()}` : '—'} />
              <Field label="Monthly Payment" value={p.monthlyMortgagePayment ? `£${p.monthlyMortgagePayment}` : '—'} />
              <Field label="Interest Rate" value={p.interestRate ? `${p.interestRate}%` : '—'} />
            </div>
          ))
        ) : (
          <>
            <Field label="Property Value" value={al.currentPropertyValue ? `£${al.currentPropertyValue.toLocaleString()}` : '—'} />
            <Field label="Mortgage Lender" value={al.mortgageLender} />
            <Field label="Outstanding Balance" value={al.outstandingMortgageBalance ? `£${al.outstandingMortgageBalance.toLocaleString()}` : '—'} />
            <Field label="Interest Rate" value={al.interestRate ? `${al.interestRate}%` : '—'} />
            <Field label="Monthly Payment" value={al.monthlyMortgagePayment ? `£${al.monthlyMortgagePayment}` : '—'} />
          </>
        )}
        {al.securedLoans?.length > 0 && (
          <>
            <p className="font-medium text-sm mt-3">Secured Loans</p>
            {al.securedLoans.map((l: any, i: number) => (
              <div key={i} className="mt-1">
                <Field label={`Loan ${i + 1} — ${l.lender}`} value={l.amount ? `£${l.amount.toLocaleString()}` : '—'} />
              </div>
            ))}
          </>
        )}
      </Section>

      <Section title="6. Debts & Credit">
        {formData.debts.map((d, i) => (
          <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t' : ''}>
            <Field label="Type" value={d.debtType} />
            <Field label="Provider" value={d.provider} />
            <Field label="Outstanding" value={d.amountOutstanding ? `£${d.amountOutstanding.toLocaleString()}` : '—'} />
            <Field label="Monthly Payment" value={d.monthlyPayment ? `£${d.monthlyPayment}` : '—'} />
            <Field label="Repaid Before Completion" value={d.repaidBeforeCompletion} />
          </div>
        ))}
        {CREDIT_HISTORY_QUESTIONS.filter(q => formData.creditHistory[q.key]?.answer).map(q => (
          <div key={q.key} className="mt-2 pt-2 border-t">
            <Field label={q.label} value="Yes" />
            {formData.creditHistory[q.key]?.details && <Field label="Details" value={formData.creditHistory[q.key].details} />}
          </div>
        ))}
      </Section>

      <Section title="7. Income">
        <Field label="Occupation" value={inc.employmentIncome.occupation} />
        <Field label="Employer" value={inc.employmentIncome.employerName} />
        <Field label="Salary" value={inc.employmentIncome.salaryBeforeTax ? `£${inc.employmentIncome.salaryBeforeTax.toLocaleString()}` : '—'} />
        <Field label="Overtime" value={inc.employmentIncome.overtimeIncome ? `£${inc.employmentIncome.overtimeIncome.toLocaleString()}` : '—'} />
        <Field label="Bonus" value={inc.employmentIncome.bonusIncome ? `£${inc.employmentIncome.bonusIncome.toLocaleString()}` : '—'} />
        <Field label="Rental Income" value={inc.rentalIncome ? `£${inc.rentalIncome}/mo` : '—'} />
      </Section>

      <Section title="8. Business Ownership">
        {formData.businesses.map((b, i) => (
          <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t' : ''}>
            <Field label="Business Name" value={b.businessName} />
            <Field label="Status" value={b.companyStatus} />
            <Field label="Ownership" value={b.ownershipPercentage ? `${b.ownershipPercentage}%` : '—'} />
            <Field label="PAYE" value={b.payeIncome ? `£${b.payeIncome.toLocaleString()}` : '—'} />
            <Field label="Dividends" value={b.dividendIncome ? `£${b.dividendIncome.toLocaleString()}` : '—'} />
          </div>
        ))}
        {formData.businesses.length === 0 && <p className="text-muted-foreground text-sm">None provided</p>}
      </Section>

      <Section title="9. Property Portfolio">
        {formData.properties.map((p, i) => (
          <div key={i} className={i > 0 ? 'mt-2 pt-2 border-t' : ''}>
            <Field label="Address" value={p.address} />
            <Field label="Value" value={p.currentValue ? `£${p.currentValue.toLocaleString()}` : '—'} />
            <Field label="Outstanding Mortgage" value={p.outstandingMortgage ? `£${p.outstandingMortgage.toLocaleString()}` : '—'} />
            <Field label="Rental Income" value={p.rentalIncome ? `£${p.rentalIncome}/mo` : '—'} />
          </div>
        ))}
        {formData.properties.length === 0 && <p className="text-muted-foreground text-sm">None provided</p>}
      </Section>

      <Section title="10. Loan Details">
        <p className="font-medium text-sm mb-1">Loan Application 1</p>
        <Field label="Application Type" value={ld.applicationType} />
        <Field label="Loan Type" value={ld.loanType} />
        <Field label="Loan %" value={ld.loanPercentage ? `${ld.loanPercentage}%` : '—'} />
        <Field label="Loan Term" value={ld.loanTerm} />
        <Field label="Purchase Price" value={ld.purchasePrice ? `£${ld.purchasePrice.toLocaleString()}` : '—'} />
        <Field label="Property Value" value={ld.propertyValue ? `£${ld.propertyValue.toLocaleString()}` : '—'} />
        <Field label="Property Address" value={ld.propertyAddress} />
        <Field label="Property Description" value={ld.propertyDescription} />
        <Field label="Expected Rental" value={ld.rentalIncomeExpected ? `£${ld.rentalIncomeExpected}/mo` : '—'} />
        <Field label="Planned Use" value={ld.plannedUse} />
        <Field label="Repayment Plan" value={ld.repaymentPlan} />
        {(formData.additionalLoans || []).map((loan: any, i: number) => (
          <div key={i} className="mt-3 pt-3 border-t">
            <p className="font-medium text-sm mb-1">Loan Application {i + 2}</p>
            <Field label="Application Type" value={loan.applicationType} />
            <Field label="Loan Type" value={loan.loanType} />
            <Field label="Loan %" value={loan.loanPercentage ? `${loan.loanPercentage}%` : '—'} />
            <Field label="Purchase Price" value={loan.purchasePrice ? `£${loan.purchasePrice.toLocaleString()}` : '—'} />
            <Field label="Property Address" value={loan.propertyAddress} />
            <Field label="Planned Use" value={loan.plannedUse} />
          </div>
        ))}
      </Section>

      {/* Documents */}
      <Section title="11. Documents">
        <DocumentList appId={app.id} />
      </Section>

      {/* Admin Notes */}
      <Section title="Internal Notes">
        {(formData.adminNotes || []).map((note, i) => (
          <div key={i} className="p-3 rounded bg-muted/30 space-y-1 mb-2">
            <p className="text-sm">{note.note}</p>
            <p className="text-xs text-muted-foreground">{note.author} · {format(new Date(note.createdAt), 'PPp')}</p>
          </div>
        ))}
        <div className="flex gap-2 mt-3">
          <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." rows={2} className="flex-1" />
          <Button onClick={addNote} disabled={!newNote.trim()} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
      </Section>
    </div>
  );
}

function DocumentList({ appId }: { appId: string }) {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('documents').select('*').eq('application_id', appId).then(({ data }) => setDocs(data || []));
  }, [appId]);

  const download = async (doc: any) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  if (docs.length === 0) return <p className="text-muted-foreground text-sm">No documents uploaded</p>;

  return (
    <div className="space-y-2">
      {docs.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
          <div>
            <p className="text-sm font-medium">{doc.file_name}</p>
            <p className="text-xs text-muted-foreground">{doc.document_type} · {(doc.file_size / 1024).toFixed(0)} KB</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => download(doc)}><Download className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}
