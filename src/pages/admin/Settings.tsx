import { Settings as SettingsIcon, Shield, Bell, Palette, Database, Lock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const settingsSections = [
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Configure authentication and access control policies',
    icon: Shield,
    settings: [
      { id: 'mfa', label: 'Require Multi-Factor Authentication', description: 'Enforce MFA for all admin users', enabled: true },
      { id: 'session', label: 'Session Timeout', description: 'Auto-logout after 30 minutes of inactivity', enabled: true },
      { id: 'audit', label: 'Enhanced Audit Logging', description: 'Log all data access events', enabled: true },
    ],
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Manage email and system notifications',
    icon: Bell,
    settings: [
      { id: 'new-tenant', label: 'New Tenant Registrations', description: 'Email alerts for new tenant sign-ups', enabled: true },
      { id: 'security-alerts', label: 'Security Alerts', description: 'Immediate notification of suspicious activity', enabled: true },
      { id: 'application-updates', label: 'Application Status Updates', description: 'Updates on application processing', enabled: false },
    ],
  },
  {
    id: 'branding',
    title: 'Platform Branding',
    description: 'Customize the platform appearance',
    icon: Palette,
    locked: true,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with external services (Credas, JAG Finance)',
    icon: Database,
    locked: true,
  },
];

export default function Settings() {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Settings"
        description="Configure platform settings and preferences"
      />

      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div 
            key={section.id}
            className={cn(
              'rounded-xl border border-border bg-card p-6',
              section.locked && 'opacity-60'
            )}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-semibold">
                    {section.title}
                    {section.locked && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </div>

            {section.settings && !section.locked && (
              <div className="ml-12 space-y-4">
                <Separator className="mb-4" />
                {section.settings.map((setting, index) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={setting.id} className="text-sm font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch id={setting.id} defaultChecked={setting.enabled} />
                  </div>
                ))}
              </div>
            )}

            {section.locked && (
              <div className="ml-12 mt-4 rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  This feature will be available in a future milestone. Stay tuned!
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="gradient">Save Changes</Button>
      </div>
    </div>
  );
}
