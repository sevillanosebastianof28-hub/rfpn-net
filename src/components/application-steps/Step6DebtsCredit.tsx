import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { CREDIT_HISTORY_QUESTIONS, type DebtEntry, type CreditHistoryItem } from '@/types/application-form';

interface Props {
  debts: DebtEntry[];
  creditHistory: Record<string, CreditHistoryItem>;
  onDebtsChange: (debts: DebtEntry[]) => void;
  onCreditChange: (creditHistory: Record<string, CreditHistoryItem>) => void;
}

const DEBT_TYPES = ['Credit Card', 'Personal Loan', 'Overdraft', 'Hire Purchase', 'Student Loan', 'Other'];

const emptyDebt = (): DebtEntry => ({
  debtType: '', provider: '', amountOutstanding: null, monthlyPayment: null, repaidBeforeCompletion: null,
});

export function Step6DebtsCredit({ debts, creditHistory, onDebtsChange, onCreditChange }: Props) {
  const addDebt = () => onDebtsChange([...debts, emptyDebt()]);
  const removeDebt = (idx: number) => onDebtsChange(debts.filter((_, i) => i !== idx));
  const updateDebt = (idx: number, field: string, value: any) => {
    const d = [...debts];
    d[idx] = { ...d[idx], [field]: value };
    onDebtsChange(d);
  };

  const updateCredit = (key: string, field: 'answer' | 'details', value: any) => {
    onCreditChange({ ...creditHistory, [key]: { ...creditHistory[key], [field]: value } });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Other Debts</h3>
          <Button type="button" variant="outline" size="sm" onClick={addDebt}><Plus className="h-4 w-4 mr-1" /> Add Debt</Button>
        </div>
        {debts.length === 0 && <p className="text-sm text-muted-foreground italic">No debts added.</p>}
        {debts.map((debt, idx) => (
          <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Debt {idx + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeDebt(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Debt Type</Label>
                <Select value={debt.debtType} onValueChange={v => updateDebt(idx, 'debtType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DEBT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Provider</Label><Input value={debt.provider} onChange={e => updateDebt(idx, 'provider', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount Outstanding (£)</Label><Input type="number" value={debt.amountOutstanding ?? ''} onChange={e => updateDebt(idx, 'amountOutstanding', e.target.value ? parseFloat(e.target.value) : null)} /></div>
              <div className="space-y-2"><Label>Monthly Payment (£)</Label><Input type="number" value={debt.monthlyPayment ?? ''} onChange={e => updateDebt(idx, 'monthlyPayment', e.target.value ? parseFloat(e.target.value) : null)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Label>Will be repaid before completion?</Label>
              <Switch checked={debt.repaidBeforeCompletion === true} onCheckedChange={v => updateDebt(idx, 'repaidBeforeCompletion', v)} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Credit History</h3>
        <p className="text-sm text-muted-foreground">Please answer the following questions honestly.</p>
        <div className="space-y-3">
          {CREDIT_HISTORY_QUESTIONS.map(q => (
            <div key={q.key} className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{q.label}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{creditHistory[q.key]?.answer === null ? '' : creditHistory[q.key]?.answer ? 'Yes' : 'No'}</span>
                  <Switch checked={creditHistory[q.key]?.answer === true} onCheckedChange={v => updateCredit(q.key, 'answer', v)} />
                </div>
              </div>
              {creditHistory[q.key]?.answer && (
                <Textarea
                  placeholder="Please provide details..."
                  value={creditHistory[q.key]?.details || ''}
                  onChange={e => updateCredit(q.key, 'details', e.target.value)}
                  rows={2}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
