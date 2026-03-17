import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, ShieldAlert, ShieldX, AlertCircle } from 'lucide-react';
import type { PersonalDetails, AddressHistory } from '@/types/application-form';

interface KycVerificationProps {
  personalDetails: PersonalDetails;
  addressHistory: AddressHistory;
  applicationId: string | null;
  userId: string;
  onVerified?: (verifiedFields: Record<string, unknown>) => void;
}

type KycStatus = 'idle' | 'loading' | 'VERIFIED' | 'REVIEW_REQUIRED' | 'FAILED' | 'error';

interface KycResult {
  status: string;
  message: string;
  verificationId?: string;
  providerReference?: string;
  score?: number;
  verifiedFields?: Record<string, unknown>;
}

export function KycVerification({
  personalDetails,
  addressHistory,
  applicationId,
  userId,
  onVerified,
}: KycVerificationProps) {
  const [status, setStatus] = useState<KycStatus>('idle');
  const [result, setResult] = useState<KycResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingVerification, setExistingVerification] = useState<any>(null);

  // Check for existing verification
  useEffect(() => {
    if (!applicationId) return;
    supabase
      .from('kyc_verifications')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setExistingVerification(data[0]);
          const v = data[0] as any;
          setStatus(v.verification_status as KycStatus);
          setResult({
            status: v.verification_status,
            message:
              v.verification_status === 'VERIFIED'
                ? 'Identity verified successfully'
                : v.verification_status === 'REVIEW_REQUIRED'
                ? 'Verification requires manual review'
                : 'Verification was not successful',
            verificationId: v.id,
            verifiedFields: v.verified_fields,
          });
        }
      });
  }, [applicationId]);

  const canVerify =
    personalDetails.firstName &&
    personalDetails.surname &&
    personalDetails.dateOfBirth &&
    addressHistory.currentAddress.postcode;

  const handleVerify = async () => {
    if (!canVerify) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setStatus('error');
        setErrorMessage('Please sign in to verify your identity');
        return;
      }

      const payload = {
        applicationId: applicationId || undefined,
        firstName: personalDetails.firstName,
        middleName: personalDetails.middleName || undefined,
        lastName: personalDetails.surname,
        dateOfBirth: personalDetails.dateOfBirth,
        address: addressHistory.currentAddress.address,
        city: addressHistory.currentAddress.city,
        postcode: addressHistory.currentAddress.postcode,
        country: addressHistory.currentAddress.country || 'GBR',
        email: personalDetails.email || undefined,
        phone: personalDetails.mobilePhone || undefined,
      };

      const { data, error } = await supabase.functions.invoke('experian-kyc', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || 'Verification request failed');
      }

      setResult(data);
      setStatus(data.status as KycStatus);

      if (data.status === 'VERIFIED' && data.verifiedFields && onVerified) {
        onVerified(data.verifiedFields);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message || 'Unable to complete verification at this time. Please try again later.'
      );
    }
  };

  const statusConfig = {
    idle: { icon: ShieldCheck, color: 'text-muted-foreground', bg: 'bg-muted/30' },
    loading: { icon: Loader2, color: 'text-primary', bg: 'bg-primary/5' },
    VERIFIED: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' },
    REVIEW_REQUIRED: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    FAILED: { icon: ShieldX, color: 'text-destructive', bg: 'bg-destructive/5' },
    error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={`border ${config.bg}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.bg}`}>
            <Icon
              className={`h-6 w-6 ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">RFPN Identity Verification</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {status === 'idle' &&
                  'Verify your identity to proceed with your application. This check confirms your personal details against official records.'}
                {status === 'loading' && 'Verifying identity...'}
                {status === 'VERIFIED' && (result?.message || 'Identity verified successfully')}
                {status === 'REVIEW_REQUIRED' &&
                  (result?.message || 'Verification requires manual review. Your application will continue to be processed.')}
                {status === 'FAILED' &&
                  (result?.message || 'Verification was not successful. Please check your details and try again.')}
                {status === 'error' && (errorMessage || 'An error occurred during verification.')}
              </p>
            </div>

            {!canVerify && status === 'idle' && (
              <p className="text-sm text-amber-600">
                Please complete your personal details (name, date of birth) and current address (postcode) before verifying.
              </p>
            )}

            {result?.verificationId && (
              <p className="text-xs text-muted-foreground">
                Reference: {result.verificationId.slice(0, 8).toUpperCase()}
              </p>
            )}

            {(status === 'idle' || status === 'FAILED' || status === 'error') && (
              <Button
                onClick={handleVerify}
                disabled={!canVerify || status === 'loading'}
                variant={status === 'idle' ? 'default' : 'outline'}
                size="sm"
              >
                {status === 'idle' ? 'Verify Identity' : 'Retry Verification'}
              </Button>
            )}

            {status === 'VERIFIED' && (
              <div className="text-sm text-green-700 dark:text-green-400 font-medium">
                ✓ Your verified details have been applied to your application.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
