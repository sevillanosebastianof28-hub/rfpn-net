import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EXPENDITURE_CATEGORIES, type ExpenditureItem } from '@/types/application-form';

interface Props {
  data: Record<string, ExpenditureItem>;
  onChange: (data: Record<string, ExpenditureItem>) => void;
}

export function Step3Expenditure({ data, onChange }: Props) {
  const update = (key: string, field: 'current' | 'proposed', value: string) => {
    onChange({
      ...data,
      [key]: { ...data[key], [field]: value ? parseFloat(value) : null },
    });
  };

  const totalCurrent = Object.values(data).reduce((s, v) => s + (v.current || 0), 0);
  const totalProposed = Object.values(data).reduce((s, v) => s + (v.proposed || 0), 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter your monthly expenditure. Include current costs and proposed costs after the loan.</p>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-3 gap-0 bg-muted/50 px-4 py-3 text-sm font-semibold border-b">
          <span>Category</span>
          <span className="text-center">Current (£/month)</span>
          <span className="text-center">Proposed (£/month)</span>
        </div>
        <div className="divide-y">
          {EXPENDITURE_CATEGORIES.map(cat => (
            <div key={cat.key} className="grid grid-cols-3 gap-0 px-4 py-2 items-center hover:bg-muted/20 transition-colors">
              <Label className="text-sm">{cat.label}</Label>
              <div className="px-2">
                <Input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={data[cat.key]?.current ?? ''}
                  onChange={e => update(cat.key, 'current', e.target.value)}
                  className="text-center h-9"
                />
              </div>
              <div className="px-2">
                <Input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={data[cat.key]?.proposed ?? ''}
                  onChange={e => update(cat.key, 'proposed', e.target.value)}
                  className="text-center h-9"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-0 bg-muted/50 px-4 py-3 text-sm font-bold border-t">
          <span>Total</span>
          <span className="text-center">£{totalCurrent.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
          <span className="text-center">£{totalProposed.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
