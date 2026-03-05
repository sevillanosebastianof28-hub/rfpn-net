import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import type { PersonalDetails } from '@/types/application-form';

interface Props {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
}

export function Step1PersonalDetails({ data, onChange }: Props) {
  const update = <K extends keyof PersonalDetails>(key: K, value: PersonalDetails[K]) => {
    onChange({ ...data, [key]: value });
  };

  const addDependant = () => {
    update('dependants', [...data.dependants, { name: '', dateOfBirth: '' }]);
  };

  const updateDependant = (idx: number, field: string, value: string) => {
    const deps = [...data.dependants];
    deps[idx] = { ...deps[idx], [field]: value };
    update('dependants', deps);
  };

  const removeDependant = (idx: number) => {
    update('dependants', data.dependants.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Select value={data.title} onValueChange={v => update('title', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Other'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input value={data.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input value={data.middleName} onChange={e => update('middleName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Surname *</Label>
          <Input value={data.surname} onChange={e => update('surname', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Previous Surname</Label>
          <Input value={data.previousSurname} onChange={e => update('previousSurname', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <Input type="date" value={data.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Marital Status</Label>
          <Select value={data.maritalStatus} onValueChange={v => update('maritalStatus', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {['Single', 'Married', 'Civil Partnership', 'Divorced', 'Widowed', 'Separated'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nationality</Label>
          <Input value={data.nationality} onChange={e => update('nationality', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country of Birth</Label>
          <Input value={data.countryOfBirth} onChange={e => update('countryOfBirth', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>National Insurance Number</Label>
          <Input value={data.nationalInsuranceNumber} onChange={e => update('nationalInsuranceNumber', e.target.value)} placeholder="e.g. AB123456C" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email Address *</Label>
          <Input type="email" value={data.email} onChange={e => update('email', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Mobile Number *</Label>
          <Input type="tel" value={data.mobilePhone} onChange={e => update('mobilePhone', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Home Phone</Label>
          <Input type="tel" value={data.homePhone} onChange={e => update('homePhone', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Work Phone</Label>
          <Input type="tel" value={data.workPhone} onChange={e => update('workPhone', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Label>Smoker</Label>
        <Switch checked={data.smoker === true} onCheckedChange={v => update('smoker', v)} />
        <span className="text-sm text-muted-foreground">{data.smoker === null ? 'Not specified' : data.smoker ? 'Yes' : 'No'}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Dependants</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDependant}>
            <Plus className="h-4 w-4 mr-1" /> Add Dependant
          </Button>
        </div>
        {data.dependants.map((dep, idx) => (
          <div key={idx} className="flex gap-3 items-end p-3 rounded-lg border bg-muted/30">
            <div className="flex-1 space-y-2">
              <Label>Name</Label>
              <Input value={dep.name} onChange={e => updateDependant(idx, 'name', e.target.value)} />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={dep.dateOfBirth} onChange={e => updateDependant(idx, 'dateOfBirth', e.target.value)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeDependant(idx)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
