import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { ESignatureDialog } from '@/components/application-steps/ESignatureDialog';
import { KycVerification } from '@/components/application-steps/KycVerification';
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
import { STEP_LABELS, getDefaultFormData, type ApplicationFormData, type ESignature } from '@/types/application-form';

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
  const [showSignature, setShowSignature] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load existing application or pre-fill from profile for new ones
  useEffect(() => {
    const load = async () => {
      if (id && id !== 'new') {
        // Load existing application
        const { data } = await supabase.from('applications').select('*').eq('id', id).single();
        if (data) {
          const pd = (data.project_details as any) || {};
          const merged = { ...getDefaultFormData(), ...pd };
          setFormData(merged);
          setCurrentStep(merged.currentStep || 1);
          setAppId(data.id);
        }
      } else if (user) {
        // NEW application — pre-fill from profile + developer_profiles to avoid repeat data entry
        const defaultData = getDefaultFormData();
        const [profileRes, devProfileRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('developer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        ]);

        const profile = profileRes.data;
        const devProfile = devProfileRes.data;

        if (profile) {
          defaultData.personalDetails.firstName = profile.first_name || '';
          defaultData.personalDetails.surname = profile.last_name || '';
          defaultData.personalDetails.email = profile.email || '';
          defaultData.personalDetails.mobilePhone = profile.phone || '';
        }

        // Pre-fill company details from developer_profiles into businesses
        if (devProfile?.company_name) {
          defaultData.businesses = [{
            businessName: devProfile.company_name || '',
            businessType: '',
            startDate: '',
            ownershipPercentage: null,
            businessAddress: devProfile.company_address || '',
            companyStatus: '',
            yearlyNetProfit: [{ year: new Date().getFullYear().toString(), profit: null }],
            payeIncome: null,
            dividendIncome: null,
          }];
        }

        // If KYC/Credas data is available (verification passed), we can trust the profile data
        // This is where future Credas API pre-fill will slot in
        if (devProfile?.verification_status === 'passed') {
          // Mark that data has been KYC-verified (informational only for now)
          (defaultData as any)._kycVerified = true;
        }

        setFormData(defaultData);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

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

  const handleSubmitClick = () => {
    setShowSignature(true);
  };

  const handleSignAndSubmit = async (sig: ESignature) => {
    setSubmitting(true);
    const updatedForm = { ...formData, eSignature: sig };
    setFormData(updatedForm);
    
    // Save with signature data
    const projectDetails = { ...updatedForm, currentStep };
    await supabase.from('applications').update({
      project_details: projectDetails as any,
      status: 'submitted' as any,
      submitted_at: new Date().toISOString(),
      signature_data: sig.signatureData,
      signed_at: sig.signedAt,
    }).eq('id', appId!);

    toast.success('Application signed and submitted successfully!');
    setShowSignature(false);
    navigate('/developer/applications');
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
        {currentStep === 1 && (
          <>
            {!appId && formData.personalDetails.firstName && (
              <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <span className="font-medium">✨ Fields pre-filled from your profile.</span>{' '}
                <span className="text-muted-foreground">Review and update as needed.</span>
              </div>
            )}
            <Step1PersonalDetails data={formData.personalDetails} onChange={d => updateSection('personalDetails', d)} />
            
            {/* KYC Verification - shown after personal details are filled */}
            {user && (formData.personalDetails.firstName && formData.personalDetails.surname && formData.personalDetails.dateOfBirth && formData.addressHistory.currentAddress.postcode) && (
              <div className="mt-6">
                <KycVerification
                  personalDetails={formData.personalDetails}
                  addressHistory={formData.addressHistory}
                  applicationId={appId}
                  userId={user.id}
                  onVerified={(verifiedFields) => {
                    // Mark verified fields in form data
                    const updated = { ...formData };
                    if (verifiedFields.firstName) updated.personalDetails.firstName = verifiedFields.firstName as string;
                    if (verifiedFields.lastName) updated.personalDetails.surname = verifiedFields.lastName as string;
                    if (verifiedFields.dateOfBirth) updated.personalDetails.dateOfBirth = verifiedFields.dateOfBirth as string;
                    setFormData(updated);
                  }}
                />
              </div>
            )}
          </>
        )}
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
        {currentStep === 10 && <Step10LoanDetails data={formData.loanDetails} additionalLoans={formData.additionalLoans || []} onChange={d => updateSection('loanDetails', d)} onAdditionalChange={d => updateSection('additionalLoans', d)} />}
        {currentStep === 11 && appId && user && (
          <Step11Documents data={formData.documents} onChange={d => updateSection('documents', d)} applicationId={appId} userId={user.id} />
        )}
        {currentStep === 11 && !appId && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Please save your application first before uploading documents.</p>
            <Button variant="outline" className="mt-4" onClick={() => saveProgress(false)}>Save Now</Button>
          </div>
        )}
        {currentStep === 12 && <Step12Review data={formData} onGoToStep={handleStepClick} applicationTitle={`${formData.personalDetails.firstName} ${formData.personalDetails.surname} - Application`} />}
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
          <Button onClick={handleSubmitClick} disabled={submitting} variant="default" className="gap-1">
            <Send className="h-4 w-4" />
            Sign & Submit
          </Button>
        )}
      </div>

      {/* E-Signature Dialog */}
      <ESignatureDialog
        open={showSignature}
        onClose={() => setShowSignature(false)}
        onSign={handleSignAndSubmit}
        applicantName={`${formData.personalDetails.firstName} ${formData.personalDetails.surname}`.trim()}
        submitting={submitting}
      />
    </div>
  );
}
