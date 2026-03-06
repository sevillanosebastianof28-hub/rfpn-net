import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pen, RotateCcw, Send, Loader2 } from 'lucide-react';
import type { ESignature } from '@/types/application-form';

interface Props {
  open: boolean;
  onClose: () => void;
  onSign: (sig: ESignature) => void;
  applicantName: string;
  submitting: boolean;
}

export function ESignatureDialog({ open, onClose, onSign, applicantName, submitting }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [fullName, setFullName] = useState(applicantName);
  const [agreed, setAgreed] = useState(false);

  const getCtx = () => canvasRef.current?.getContext('2d') || null;

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'hsl(280, 60%, 35%)';
    ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  }, [isDrawing]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const ctx = getCtx();
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasSigned(false);
    }
  };

  const handleSign = () => {
    if (!canvasRef.current || !hasSigned || !fullName.trim() || !agreed) return;
    const signatureData = canvasRef.current.toDataURL('image/png');
    onSign({
      signatureData,
      signedAt: new Date().toISOString(),
      signerName: fullName.trim(),
    });
  };

  const canSubmit = hasSigned && fullName.trim().length > 0 && agreed && !submitting;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="h-5 w-5 text-primary" />
            E-Signature Required
          </DialogTitle>
          <DialogDescription>
            By signing below, you confirm that all information provided in this application is true and accurate to the best of your knowledge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Full name confirmation */}
          <div>
            <Label>Full Legal Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" />
          </div>

          {/* Signature canvas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Draw Your Signature</Label>
              <Button type="button" variant="ghost" size="sm" onClick={clearCanvas}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear
              </Button>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg bg-background p-1">
              <canvas
                ref={canvasRef}
                width={440}
                height={150}
                className="w-full cursor-crosshair touch-none rounded"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>
            {!hasSigned && <p className="text-xs text-muted-foreground mt-1">Sign in the box above using your mouse or finger</p>}
          </div>

          {/* Agreement checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox id="agree" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
            <label htmlFor="agree" className="text-sm leading-tight cursor-pointer">
              I confirm that all information provided is true and accurate. I understand that providing false information may result in my application being rejected and may constitute a criminal offence.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSign} disabled={!canSubmit} variant="default" className="gap-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Sign & Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
