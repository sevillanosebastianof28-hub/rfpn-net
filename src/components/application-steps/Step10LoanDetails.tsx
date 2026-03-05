import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LoanDetails } from '@/types/application-form';

interface Props {
  data: LoanDetails;
  onChange: (data: LoanDetails) => void;
}

export function Step10LoanDetails({ data, onChange }: Props) {
  const update = (field: string, value: any) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Application Type *</Label>
          <Select value={data.applicationType} onValueChange={v => update('applicationType', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="refinance">Refinance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Loan Type *</Label>
          <Select value={data.loanType} onValueChange={v => update('loanType', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="bridge">Bridge</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Loan Required (%)</Label><Input type="number" min="0" max="100" value={data.loanPercentage ?? ''} onChange={e => update('loanPercentage', e.target.value ? parseFloat(e.target.value) : null)} /></div>
        <div className="space-y-2"><Label>Loan Term</Label><Input value={data.loanTerm} onChange={e => update('loanTerm', e.target.value)} placeholder="e.g. 12 months" /></div>
        <div className="space-y-2">
          <Label>Repayment Method</Label>
          <Select value={data.repaymentMethod} onValueChange={v => update('repaymentMethod', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="repayment">Repayment</SelectItem>
              <SelectItem value="interest_only">Interest Only</SelectItem>
              <SelectItem value="rolled_up">Rolled Up Interest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Purchase Price (£)</Label><Input type="number" value={data.purchasePrice ?? ''} onChange={e => update('purchasePrice', e.target.value ? parseFloat(e.target.value) : null)} /></div>
        <div className="space-y-2"><Label>Property Value (£)</Label><Input type="number" value={data.propertyValue ?? ''} onChange={e => update('propertyValue', e.target.value ? parseFloat(e.target.value) : null)} /></div>
      </div>

      <div className="space-y-2"><Label>Property Address</Label><Input value={data.propertyAddress} onChange={e => update('propertyAddress', e.target.value)} /></div>

      <div className="space-y-2"><Label>Property Description</Label><Textarea value={data.propertyDescription} onChange={e => update('propertyDescription', e.target.value)} rows={3} placeholder="Describe the property type, condition, planned works..." /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Expected Rental Income (£/month)</Label><Input type="number" value={data.rentalIncomeExpected ?? ''} onChange={e => update('rentalIncomeExpected', e.target.value ? parseFloat(e.target.value) : null)} /></div>
        <div className="space-y-2"><Label>Planned Use of Property</Label><Input value={data.plannedUse} onChange={e => update('plannedUse', e.target.value)} placeholder="e.g. Buy-to-let, Development, Flip" /></div>
      </div>

      <div className="space-y-2"><Label>Loan Repayment Plan</Label><Textarea value={data.repaymentPlan} onChange={e => update('repaymentPlan', e.target.value)} rows={3} placeholder="How do you plan to repay the loan?" /></div>
    </div>
  );
}
