import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { PropertyEntry } from '@/types/application-form';

interface Props {
  data: PropertyEntry[];
  onChange: (data: PropertyEntry[]) => void;
}

const emptyProperty = (): PropertyEntry => ({
  address: '', ownershipType: '', currentValue: null, mortgageLender: '', purchaseDate: '',
  outstandingMortgage: null, interestRate: null, monthlyPayment: null, repaymentMethod: '',
  remainingTerm: '', rentalIncome: null,
});

export function Step9PropertyPortfolio({ data, onChange }: Props) {
  const add = () => onChange([...data, emptyProperty()]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));
  const update = (idx: number, field: string, value: any) => {
    const items = [...data];
    items[idx] = { ...items[idx], [field]: value };
    onChange(items);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add all properties you currently own or have an interest in.</p>
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add Property</Button>
      </div>

      {data.length === 0 && <p className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">No properties added. Skip if not applicable.</p>}

      {data.map((prop, idx) => (
        <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Property {idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <div className="space-y-2"><Label>Property Address</Label><Input value={prop.address} onChange={e => update(idx, 'address', e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ownership Type</Label>
              <Select value={prop.ownershipType} onValueChange={v => update(idx, 'ownershipType', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole">Sole Owner</SelectItem>
                  <SelectItem value="joint">Joint Owner</SelectItem>
                  <SelectItem value="company">Company Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Current Value (£)</Label><Input type="number" value={prop.currentValue ?? ''} onChange={e => update(idx, 'currentValue', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={prop.purchaseDate} onChange={e => update(idx, 'purchaseDate', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mortgage Lender</Label><Input value={prop.mortgageLender} onChange={e => update(idx, 'mortgageLender', e.target.value)} /></div>
            <div className="space-y-2"><Label>Outstanding Mortgage (£)</Label><Input type="number" value={prop.outstandingMortgage ?? ''} onChange={e => update(idx, 'outstandingMortgage', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" step="0.01" value={prop.interestRate ?? ''} onChange={e => update(idx, 'interestRate', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2"><Label>Monthly Payment (£)</Label><Input type="number" value={prop.monthlyPayment ?? ''} onChange={e => update(idx, 'monthlyPayment', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2">
              <Label>Repayment Method</Label>
              <Select value={prop.repaymentMethod} onValueChange={v => update(idx, 'repaymentMethod', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="repayment">Repayment</SelectItem>
                  <SelectItem value="interest_only">Interest Only</SelectItem>
                  <SelectItem value="part_and_part">Part & Part</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Remaining Term</Label><Input value={prop.remainingTerm} onChange={e => update(idx, 'remainingTerm', e.target.value)} placeholder="e.g. 15 years" /></div>
            <div className="space-y-2"><Label>Monthly Rental Income (£)</Label><Input type="number" value={prop.rentalIncome ?? ''} onChange={e => update(idx, 'rentalIncome', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
