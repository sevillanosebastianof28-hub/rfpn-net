import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { BusinessEntry } from '@/types/application-form';

interface Props {
  data: BusinessEntry[];
  onChange: (data: BusinessEntry[]) => void;
}

const emptyBusiness = (): BusinessEntry => ({
  businessName: '', businessType: '', startDate: '', ownershipPercentage: null,
  businessAddress: '', companyStatus: '',
  yearlyNetProfit: [{ year: new Date().getFullYear().toString(), profit: null }],
  payeIncome: null, dividendIncome: null,
});

export function Step8BusinessIncome({ data, onChange }: Props) {
  const add = () => onChange([...data, emptyBusiness()]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));
  const update = (idx: number, field: string, value: any) => {
    const items = [...data];
    items[idx] = { ...items[idx], [field]: value };
    onChange(items);
  };

  const addProfitYear = (bizIdx: number) => {
    const items = [...data];
    items[bizIdx] = {
      ...items[bizIdx],
      yearlyNetProfit: [...items[bizIdx].yearlyNetProfit, { year: '', profit: null }],
    };
    onChange(items);
  };

  const updateProfit = (bizIdx: number, yearIdx: number, field: string, value: any) => {
    const items = [...data];
    const profits = [...items[bizIdx].yearlyNetProfit];
    profits[yearIdx] = { ...profits[yearIdx], [field]: value };
    items[bizIdx] = { ...items[bizIdx], yearlyNetProfit: profits };
    onChange(items);
  };

  const removeProfit = (bizIdx: number, yearIdx: number) => {
    const items = [...data];
    items[bizIdx] = {
      ...items[bizIdx],
      yearlyNetProfit: items[bizIdx].yearlyNetProfit.filter((_, i) => i !== yearIdx),
    };
    onChange(items);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add businesses where you are an owner or director.</p>
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" /> Add Business</Button>
      </div>

      {data.length === 0 && <p className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">No businesses added. Skip this step if not applicable.</p>}

      {data.map((biz, idx) => (
        <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Business {idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Business Name</Label><Input value={biz.businessName} onChange={e => update(idx, 'businessName', e.target.value)} /></div>
            <div className="space-y-2"><Label>Business Type</Label><Input value={biz.businessType} onChange={e => update(idx, 'businessType', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={biz.startDate} onChange={e => update(idx, 'startDate', e.target.value)} /></div>
            <div className="space-y-2"><Label>Ownership %</Label><Input type="number" min="0" max="100" value={biz.ownershipPercentage ?? ''} onChange={e => update(idx, 'ownershipPercentage', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2">
              <Label>Company Status</Label>
              <Select value={biz.companyStatus} onValueChange={v => update(idx, 'companyStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="sole_trader">Sole Trader</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="llp">LLP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Business Address</Label><Input value={biz.businessAddress} onChange={e => update(idx, 'businessAddress', e.target.value)} /></div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Yearly Net Profit</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => addProfitYear(idx)}><Plus className="h-3 w-3 mr-1" /> Add Year</Button>
            </div>
            {biz.yearlyNetProfit.map((yp, yIdx) => (
              <div key={yIdx} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1"><Label className="text-xs">Year</Label><Input value={yp.year} onChange={e => updateProfit(idx, yIdx, 'year', e.target.value)} placeholder="e.g. 2024" /></div>
                <div className="flex-1 space-y-1"><Label className="text-xs">Net Profit (£)</Label><Input type="number" value={yp.profit ?? ''} onChange={e => updateProfit(idx, yIdx, 'profit', e.target.value ? parseFloat(e.target.value) : null)} /></div>
                {biz.yearlyNetProfit.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeProfit(idx, yIdx)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>PAYE Income (£/year)</Label><Input type="number" value={biz.payeIncome ?? ''} onChange={e => update(idx, 'payeIncome', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            <div className="space-y-2"><Label>Dividend Income (£/year)</Label><Input type="number" value={biz.dividendIncome ?? ''} onChange={e => update(idx, 'dividendIncome', e.target.value ? parseFloat(e.target.value) : null)} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
