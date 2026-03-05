import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { BankAccount } from '@/types/application-form';

interface Props {
  data: BankAccount[];
  onChange: (data: BankAccount[]) => void;
}

const emptyAccount = (): BankAccount => ({
  accountHolderName: '', bankName: '', accountType: '', sortCode: '', accountNumber: '',
  incomePaidIn: null, usedForMortgage: null,
});

export function Step4BankAccounts({ data, onChange }: Props) {
  const add = () => onChange([...data, emptyAccount()]);
  const remove = (idx: number) => onChange(data.filter((_, i) => i !== idx));
  const update = (idx: number, field: string, value: any) => {
    const accounts = [...data];
    accounts[idx] = { ...accounts[idx], [field]: value };
    onChange(accounts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Add all bank accounts relevant to this application.</p>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Bank Account
        </Button>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p>No bank accounts added yet.</p>
        </div>
      )}

      {data.map((acc, idx) => (
        <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Account {idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Account Holder Name *</Label><Input value={acc.accountHolderName} onChange={e => update(idx, 'accountHolderName', e.target.value)} /></div>
            <div className="space-y-2"><Label>Bank Name *</Label><Input value={acc.bankName} onChange={e => update(idx, 'bankName', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={acc.accountType} onValueChange={v => update(idx, 'accountType', v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Sort Code</Label><Input value={acc.sortCode} onChange={e => update(idx, 'sortCode', e.target.value)} placeholder="00-00-00" /></div>
            <div className="space-y-2"><Label>Account Number</Label><Input value={acc.accountNumber} onChange={e => update(idx, 'accountNumber', e.target.value)} /></div>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Label>Income Paid Into Account</Label>
              <Switch checked={acc.incomePaidIn === true} onCheckedChange={v => update(idx, 'incomePaidIn', v)} />
            </div>
            <div className="flex items-center gap-2">
              <Label>Used to Pay Mortgage</Label>
              <Switch checked={acc.usedForMortgage === true} onCheckedChange={v => update(idx, 'usedForMortgage', v)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
