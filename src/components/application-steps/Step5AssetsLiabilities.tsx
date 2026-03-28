import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { AssetsLiabilities, OwnedProperty } from '@/types/application-form';
import { getEmptyOwnedProperty } from '@/types/application-form';

interface Props {
  data: AssetsLiabilities;
  onChange: (data: AssetsLiabilities) => void;
}

export function Step5AssetsLiabilities({ data, onChange }: Props) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value });

  // Ensure ownedProperties array exists (backward compat)
  const properties = data.ownedProperties || [];

  const addProperty = () => update('ownedProperties', [...properties, getEmptyOwnedProperty()]);
  const removeProperty = (idx: number) => update('ownedProperties', properties.filter((_, i) => i !== idx));
  const updateProperty = (idx: number, field: string, value: any) => {
    const items = [...properties];
    items[idx] = { ...items[idx], [field]: value };
    update('ownedProperties', items);
  };

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Properties</h3>
            <Button type="button" variant="outline" size="sm" onClick={addProperty}>
              <Plus className="h-4 w-4 mr-1" /> Add Property
            </Button>
          </div>

          {properties.length === 0 && (
            <p className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
              No properties added yet. Click "Add Property" to get started.
            </p>
          )}

          {properties.map((prop, idx) => (
            <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Property {idx + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeProperty(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Property Address</Label>
                <Input value={prop.address} onChange={e => updateProperty(idx, 'address', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Held In *</Label>
                  <Select value={prop.heldIn} onValueChange={v => updateProperty(idx, 'heldIn', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal Name</SelectItem>
                      <SelectItem value="company">Company Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ownership Status *</Label>
                  <Select value={prop.ownershipStatus} onValueChange={v => updateProperty(idx, 'ownershipStatus', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_owner">Sole Owner</SelectItem>
                      <SelectItem value="joint_owner">Joint Owner</SelectItem>
                      <SelectItem value="joint_mortgage">Joint Mortgage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price (£)</Label>
                  <Input type="number" value={prop.purchasePrice ?? ''} onChange={e => updateProperty(idx, 'purchasePrice', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={prop.purchaseDate ?? ''} onChange={e => updateProperty(idx, 'purchaseDate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Current Value (£)</Label>
                  <Input type="number" value={prop.currentValue ?? ''} onChange={e => updateProperty(idx, 'currentValue', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mortgage Lender</Label>
                  <Input value={prop.mortgageLender} onChange={e => updateProperty(idx, 'mortgageLender', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rental Income (£)</Label>
                  <Input type="number" value={prop.monthlyRentalIncome ?? ''} onChange={e => updateProperty(idx, 'monthlyRentalIncome', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Outstanding Mortgage (£)</Label>
                  <Input type="number" value={prop.outstandingMortgageBalance ?? ''} onChange={e => updateProperty(idx, 'outstandingMortgageBalance', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Mortgage Payment (£)</Label>
                  <Input type="number" value={prop.monthlyMortgagePayment ?? ''} onChange={e => updateProperty(idx, 'monthlyMortgagePayment', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input type="number" step="0.01" value={prop.interestRate ?? ''} onChange={e => updateProperty(idx, 'interestRate', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Repayment Method</Label>
                  <Select value={prop.repaymentMethod} onValueChange={v => updateProperty(idx, 'repaymentMethod', v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repayment">Repayment</SelectItem>
                      <SelectItem value="interest_only">Interest Only</SelectItem>
                      <SelectItem value="part_and_part">Part & Part</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Term Remaining</Label>
                  <Input value={prop.mortgageTermRemaining} onChange={e => updateProperty(idx, 'mortgageTermRemaining', e.target.value)} placeholder="e.g. 20 years" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Early Repayment Charges (£)</Label>
                <Input type="number" value={prop.earlyRepaymentCharges ?? ''} onChange={e => updateProperty(idx, 'earlyRepaymentCharges', e.target.value ? parseFloat(e.target.value) : null)} className="max-w-xs" />
              </div>
            </div>
          ))}
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
