import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { AssetsLiabilities } from '@/types/application-form';

interface Props {
  data: AssetsLiabilities;
  onChange: (data: AssetsLiabilities) => void;
}

export function Step5AssetsLiabilities({ data, onChange }: Props) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value });

  const addLoan = () => {
    update('securedLoans', [...data.securedLoans, { lender: '', amount: null, monthlyPayment: null, purpose: '' }]);
  };

  const updateLoan = (idx: number, field: string, value: any) => {
    const loans = [...data.securedLoans];
    loans[idx] = { ...loans[idx], [field]: value };
    update('securedLoans', loans);
  };

  const removeLoan = (idx: number) => {
    update('securedLoans', data.securedLoans.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label>Do you own property?</Label>
        <Switch checked={data.propertyOwner === true} onCheckedChange={v => update('propertyOwner', v)} />
        <span className="text-sm text-muted-foreground">{data.propertyOwner === null ? 'Not specified' : data.propertyOwner ? 'Yes' : 'No'}</span>
      </div>

      {data.propertyOwner && (
        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Current Property Value (£)</Label><Input type="number" value={data.currentPropertyValue ?? ''} onChange={e => update('currentPropertyValue', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2"><Label>Monthly Mortgage Payment (£)</Label><Input type="number" value={data.monthlyMortgagePayment ?? ''} onChange={e => update('monthlyMortgagePayment', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mortgage Lender</Label><Input value={data.mortgageLender} onChange={e => update('mortgageLender', e.target.value)} /></div>
            <div className="space-y-2"><Label>Outstanding Mortgage Balance (£)</Label><Input type="number" value={data.outstandingMortgageBalance ?? ''} onChange={e => update('outstandingMortgageBalance', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" step="0.01" value={data.interestRate ?? ''} onChange={e => update('interestRate', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2">
              <Label>Repayment Method</Label>
              <Select value={data.repaymentMethod} onValueChange={v => update('repaymentMethod', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="repayment">Repayment</SelectItem>
                  <SelectItem value="interest_only">Interest Only</SelectItem>
                  <SelectItem value="part_and_part">Part & Part</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Term Remaining</Label><Input value={data.mortgageTermRemaining} onChange={e => update('mortgageTermRemaining', e.target.value)} placeholder="e.g. 20 years" /></div>
          </div>
          <div className="space-y-2"><Label>Early Repayment Charges (£)</Label><Input type="number" value={data.earlyRepaymentCharges ?? ''} onChange={e => update('earlyRepaymentCharges', e.target.value ? parseFloat(e.target.value) : null)} className="max-w-xs" /></div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Additional Secured Loans</h3>
          <Button type="button" variant="outline" size="sm" onClick={addLoan}><Plus className="h-4 w-4 mr-1" /> Add Secured Loan</Button>
        </div>
        {data.securedLoans.map((loan, idx) => (
          <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Loan {idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLoan(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Lender</Label><Input value={loan.lender} onChange={e => updateLoan(idx, 'lender', e.target.value)} /></div>
              <div className="space-y-2"><Label>Purpose</Label><Input value={loan.purpose} onChange={e => updateLoan(idx, 'purpose', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount (£)</Label><Input type="number" value={loan.amount ?? ''} onChange={e => updateLoan(idx, 'amount', e.target.value ? parseFloat(e.target.value) : null)} /></div>
              <div className="space-y-2"><Label>Monthly Payment (£)</Label><Input type="number" value={loan.monthlyPayment ?? ''} onChange={e => updateLoan(idx, 'monthlyPayment', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
