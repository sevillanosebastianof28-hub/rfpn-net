import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { AddressHistory, AddressEntry } from '@/types/application-form';

interface Props {
  data: AddressHistory;
  onChange: (data: AddressHistory) => void;
}

const RESIDENTIAL_STATUSES = ['Owner', 'Tenant', 'Living with Family', 'Council Tenant', 'Other'];

const emptyAddress = (): AddressEntry => ({
  address: '', city: '', country: '', postcode: '', residentialStatus: '', startDate: '', endDate: '',
});

export function Step2AddressHistory({ data, onChange }: Props) {
  const updateCurrent = (field: string, value: string) => {
    onChange({ ...data, currentAddress: { ...data.currentAddress, [field]: value } });
  };

  const addPrevious = () => {
    onChange({ ...data, previousAddresses: [...data.previousAddresses, emptyAddress()] });
  };

  const updatePrevious = (idx: number, field: string, value: string) => {
    const addrs = [...data.previousAddresses];
    addrs[idx] = { ...addrs[idx], [field]: value };
    onChange({ ...data, previousAddresses: addrs });
  };

  const removePrevious = (idx: number) => {
    onChange({ ...data, previousAddresses: data.previousAddresses.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-accent bg-accent/10 p-3">
        <p className="text-sm text-accent-foreground font-medium">⚠️ Lenders require a minimum of 3 years of address history. Please add previous addresses to cover this period.</p>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Address</h3>
        <div className="space-y-2">
          <Label>Address *</Label>
          <Input value={data.currentAddress.address} onChange={e => updateCurrent('address', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={data.currentAddress.city} onChange={e => updateCurrent('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={data.currentAddress.country} onChange={e => updateCurrent('country', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Postcode *</Label>
            <Input value={data.currentAddress.postcode} onChange={e => updateCurrent('postcode', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Residential Status</Label>
            <Select value={data.currentAddress.residentialStatus} onValueChange={v => updateCurrent('residentialStatus', v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {RESIDENTIAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Move-in Date *</Label>
            <Input type="date" value={data.currentAddress.moveInDate} onChange={e => updateCurrent('moveInDate', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Previous Addresses</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPrevious}>
            <Plus className="h-4 w-4 mr-1" /> Add Previous Address
          </Button>
        </div>
        {data.previousAddresses.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No previous addresses added. Click above to add your address history.</p>
        )}
        {data.previousAddresses.map((addr, idx) => (
          <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Previous Address {idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removePrevious(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={addr.address} onChange={e => updatePrevious(idx, 'address', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>City</Label><Input value={addr.city} onChange={e => updatePrevious(idx, 'city', e.target.value)} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={addr.country} onChange={e => updatePrevious(idx, 'country', e.target.value)} /></div>
              <div className="space-y-2"><Label>Postcode</Label><Input value={addr.postcode} onChange={e => updatePrevious(idx, 'postcode', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Residential Status</Label>
                <Select value={addr.residentialStatus} onValueChange={v => updatePrevious(idx, 'residentialStatus', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{RESIDENTIAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={addr.startDate} onChange={e => updatePrevious(idx, 'startDate', e.target.value)} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={addr.endDate} onChange={e => updatePrevious(idx, 'endDate', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
