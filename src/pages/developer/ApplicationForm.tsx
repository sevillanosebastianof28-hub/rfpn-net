import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { StepIndicator } from '@/components/application-steps/StepIndicator';
import { Step1PersonalDetails } from '@/components/application-steps/Step1PersonalDetails';
import { Step2AddressHistory } from '@/components/application-steps/Step2AddressHistory';
import { Step3Expenditure } from '@/components/application-steps/Step3Expenditure';
import { Step4BankAccounts } from '@/components/application-steps/Step4BankAccounts';
import { Step5AssetsLiabilities } from '@/components/application-steps/Step5AssetsLiabilities';
import { Step6DebtsCredit } from '@/components/application-steps/Step6DebtsCredit';
import { Step7Income } from '@/components/application-steps/Step7Income';
import { Step8BusinessIncome } from '@/components/application-steps/Step8BusinessIncome';
import { Step9PropertyPortfolio } from '@/components/application-steps/Step9PropertyPortfolio';
import { Step10LoanDetails } from '@/components/application-steps/Step10LoanDetails';
import { Step11Documents } from '@/components/application-steps/Step11Documents';
import { Step12Review } from '@/components/application-steps/Step12Review';
import { STEP_LABELS, getDefaultFormData, type ApplicationFormData } from '@/types/application-form';

export default function ApplicationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ApplicationFormData>(getDefaultFormData());
  const [currentStep, setCurrentStep] = useState(1);
  const [appId, setAppId] = useState<string | null>(id && id !== 'new' ? id : null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing application
  useEffect(() => {
    const load = async () => {
      if (id && id !== 'new') {
        const { data } = await supabase.from('applications').select('*').eq('id', id).single();
        if (data) {
          const pd = (data.project_details as any) || {};
          const merged = { ...getDefaultFormData(), ...pd };
          setFormData(merged);
          setCurrentStep(merged.currentStep || 1);
          setAppId(data.id);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (!appId) return;
    autosaveTimer.current = setInterval(() => {
      saveProgress(true);
    }, 30000);
    return () => clearInterval(autosaveTimer.current);
  }, [appId, formData, currentStep]);

  const saveProgress = useCallback(async (silent = false) => {
    if (!user) return;
    setSaving(true);
    const projectDetails = { ...formData, currentStep };

    try {
      if (appId) {
        const { error } = await supabase.from('applications').update({
          project_details: projectDetails as any,
          title: formData.personalDetails.firstName && formData.personalDetails.surname
            ? `${formData.personalDetails.firstName} ${formData.personalDetails.surname} - Application`
            : 'Untitled Application',
          amount: formData.loanDetails.purchasePrice,
          type: formData.loanDetails.loanType || 'development_funding',
        }).eq('id', appId);
        if (error) throw error;
      } else {
        const { data: newApp, error } = await supabase.from('applications').insert({
          developer_id: user.id,
          tenant_id: user.tenantId,
          title: formData.personalDetails.firstName && formData.personalDetails.surname
            ? `${formData.personalDetails.firstName} ${formData.personalDetails.surname} - Application`
            : 'Untitled Application',
          type: formData.loanDetails.loanType || 'development_funding',
          amount: formData.loanDetails.purchasePrice,
          project_details: projectDetails as any,
        }).select('id').single();
        if (error) throw error;
        setAppId(newApp.id);
        // Update URL without re-render
        window.history.replaceState(null, '', `/developer/applications/${newApp.id}`);
      }
      setLastSaved(new Date());
      if (!silent) toast.success('Progress saved');
    } catch (err: any) {
      if (!silent) toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [user, appId, formData, currentStep]);

  const handleNext = async () => {
    await saveProgress(true);
    setCurrentStep(s => Math.min(s + 1, 12));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await saveProgress(true);
    const { error } = await supabase.from('applications').update({
      status: 'submitted' as any,
      submitted_at: new Date().toISOString(),
    }).eq('id', appId!);
    if (error) {
      toast.error('Failed to submit');
    } else {
      toast.success('Application submitted successfully!');
      navigate('/developer/applications');
    }
    setSubmitting(false);
  };

  const updateSection = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/developer/applications')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Applications
          </button>
          <h1 className="text-2xl font-bold">Funding Application</h1>
          {lastSaved && <p className="text-xs text-muted-foreground mt-1">Last saved: {lastSaved.toLocaleTimeString()}</p>}
        </div>
        <Button variant="outline" onClick={() => saveProgress(false)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Save Draft
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      {/* Step Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Step {currentStep}: {STEP_LABELS[currentStep - 1]}</h2>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && <Step1PersonalDetails data={formData.personalDetails} onChange={d => updateSection('personalDetails', d)} />}
        {currentStep === 2 && <Step2AddressHistory data={formData.addressHistory} onChange={d => updateSection('addressHistory', d)} />}
        {currentStep === 3 && <Step3Expenditure data={formData.expenditure} onChange={d => updateSection('expenditure', d)} />}
        {currentStep === 4 && <Step4BankAccounts data={formData.bankAccounts} onChange={d => updateSection('bankAccounts', d)} />}
        {currentStep === 5 && <Step5AssetsLiabilities data={formData.assetsLiabilities} onChange={d => updateSection('assetsLiabilities', d)} />}
        {currentStep === 6 && (
          <Step6DebtsCredit
            debts={formData.debts} creditHistory={formData.creditHistory}
            onDebtsChange={d => updateSection('debts', d)}
            onCreditChange={d => updateSection('creditHistory', d)}
          />
        )}
        {currentStep === 7 && <Step7Income data={formData.income} onChange={d => updateSection('income', d)} />}
        {currentStep === 8 && <Step8BusinessIncome data={formData.businesses} onChange={d => updateSection('businesses', d)} />}
        {currentStep === 9 && <Step9PropertyPortfolio data={formData.properties} onChange={d => updateSection('properties', d)} />}
        {currentStep === 10 && <Step10LoanDetails data={formData.loanDetails} onChange={d => updateSection('loanDetails', d)} />}
        {currentStep === 11 && appId && user && (
          <Step11Documents data={formData.documents} onChange={d => updateSection('documents', d)} applicationId={appId} userId={user.id} />
        )}
        {currentStep === 11 && !appId && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Please save your application first before uploading documents.</p>
            <Button variant="outline" className="mt-4" onClick={() => saveProgress(false)}>Save Now</Button>
          </div>
        )}
        {currentStep === 12 && <Step12Review data={formData} onGoToStep={handleStepClick} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">Step {currentStep} of 12</span>
        {currentStep < 12 ? (
          <Button onClick={handleNext}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}
