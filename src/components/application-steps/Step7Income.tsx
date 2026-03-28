import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface IncomeData {
  employmentIncome: {
    occupation: string; employerName: string; employerAddress: string; employerPhone: string;
    employerEmail: string; startDate: string; salaryBeforeTax: number | null; overtimeIncome: number | null;
    bonusIncome: number | null; allowances: number | null;
  };
  otherIncome: Array<{ source: string; amount: number | null }>;
  rentalIncome: number | null;
}

interface Props {
  data: IncomeData;
  onChange: (data: IncomeData) => void;
}

export function Step7Income({ data, onChange }: Props) {
  const updateEmployment = (field: string, value: any) => {
    onChange({ ...data, employmentIncome: { ...data.employmentIncome, [field]: value } });
  };

  const addOther = () => {
    onChange({ ...data, otherIncome: [...data.otherIncome, { source: '', amount: null }] });
  };

  const updateOther = (idx: number, field: string, value: any) => {
    const items = [...data.otherIncome];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ ...data, otherIncome: items });
  };

  const removeOther = (idx: number) => {
    onChange({ ...data, otherIncome: data.otherIncome.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employment Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Occupation</Label><Input value={data.employmentIncome.occupation} onChange={e => updateEmployment('occupation', e.target.value)} /></div>
          <div className="space-y-2"><Label>Employer Name</Label><Input value={data.employmentIncome.employerName} onChange={e => updateEmployment('employerName', e.target.value)} /></div>
        </div>
        <div className="space-y-2"><Label>Employer Address</Label><Input value={data.employmentIncome.employerAddress} onChange={e => updateEmployment('employerAddress', e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Employer Phone</Label><Input value={data.employmentIncome.employerPhone} onChange={e => updateEmployment('employerPhone', e.target.value)} /></div>
          <div className="space-y-2"><Label>Employer Email</Label><Input type="email" value={data.employmentIncome.employerEmail ?? ''} onChange={e => updateEmployment('employerEmail', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Employment Start Date</Label><Input type="date" value={data.employmentIncome.startDate} onChange={e => updateEmployment('startDate', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Salary Before Tax (£/year)</Label><Input type="number" value={data.employmentIncome.salaryBeforeTax ?? ''} onChange={e => updateEmployment('salaryBeforeTax', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          <div className="space-y-2"><Label>Overtime Income (£/year)</Label><Input type="number" value={data.employmentIncome.overtimeIncome ?? ''} onChange={e => updateEmployment('overtimeIncome', e.target.value ? parseFloat(e.target.value) : null)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Bonus Income (£/year)</Label><Input type="number" value={data.employmentIncome.bonusIncome ?? ''} onChange={e => updateEmployment('bonusIncome', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          <div className="space-y-2"><Label>Allowances (£/year)</Label><Input type="number" value={data.employmentIncome.allowances ?? ''} onChange={e => updateEmployment('allowances', e.target.value ? parseFloat(e.target.value) : null)} /></div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Property Rental Income</h3>
        <div className="space-y-2 max-w-xs">
          <Label>Monthly Rental Income (£)</Label>
          <Input type="number" value={data.rentalIncome ?? ''} onChange={e => onChange({ ...data, rentalIncome: e.target.value ? parseFloat(e.target.value) : null })} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Other Income</h3>
          <Button type="button" variant="outline" size="sm" onClick={addOther}><Plus className="h-4 w-4 mr-1" /> Add Income Source</Button>
        </div>
        {data.otherIncome.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-end p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 space-y-2"><Label>Source</Label><Input value={item.source} onChange={e => updateOther(idx, 'source', e.target.value)} /></div>
            <div className="flex-1 space-y-2"><Label>Amount (£/year)</Label><Input type="number" value={item.amount ?? ''} onChange={e => updateOther(idx, 'amount', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeOther(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
