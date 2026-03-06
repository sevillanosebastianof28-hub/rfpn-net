import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, FileText, CheckCircle, CalendarDays, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DOCUMENT_TYPES, type DocumentUpload } from '@/types/application-form';

interface Props {
  data: DocumentUpload[];
  onChange: (data: DocumentUpload[]) => void;
  applicationId: string;
  userId: string;
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png';

function getDaysUntilExpiry(documentDate: string): number | null {
  if (!documentDate) return null;
  const docDate = new Date(documentDate);
  const expiryDate = new Date(docDate);
  expiryDate.setDate(expiryDate.getDate() + 90);
  const now = new Date();
  const diff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function ExpiryWarning({ daysLeft }: { daysLeft: number | null }) {
  if (daysLeft === null) return null;
  if (daysLeft <= 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
      <AlertTriangle className="h-3 w-3" /> Expired — please re-upload
    </span>
  );
  if (daysLeft <= 14) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
      <AlertTriangle className="h-3 w-3" /> Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
    </span>
  );
  return (
    <span className="text-xs text-muted-foreground">Valid for {daysLeft} more days</span>
  );
}

export function Step11Documents({ data, onChange, applicationId, userId }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<Record<string, string>>({});

  const getDocsForType = (type: string) => data.filter(d => d.type === type);

  const handleUpload = async (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const docDate = pendingDate[type];
    if (!docDate) {
      toast.error('Please enter the document date before uploading');
      return;
    }

    setUploading(type);

    try {
      const newDocs = [...data];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop();
        const path = `${userId}/${applicationId}/${type}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
        if (uploadErr) throw uploadErr;

        const { data: docRow, error: insertErr } = await supabase.from('documents').insert({
          owner_id: userId,
          application_id: applicationId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: path,
          document_type: type,
          document_date: docDate,
        }).select('id').single();

        if (insertErr) throw insertErr;

        newDocs.push({ type, fileId: docRow.id, fileName: file.name, documentDate: docDate });
      }
      onChange(newDocs);
      toast.success('Document uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (doc: DocumentUpload) => {
    await supabase.from('documents').delete().eq('id', doc.fileId);
    onChange(data.filter(d => d.fileId !== doc.fileId));
    toast.success('Document removed');
  };

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm space-y-1">
        <p className="font-medium">Upload supporting documents (PDF, JPG, PNG)</p>
        <p className="text-muted-foreground">You must enter the <strong>date of the document</strong> (not today's date). Documents older than 90 days will need to be refreshed.</p>
      </div>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map(dt => {
          const docs = getDocsForType(dt.key);
          return (
            <div key={dt.key} className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {docs.length > 0 ? <CheckCircle className="h-4 w-4 text-success" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <Label className="font-semibold">{dt.label}</Label>
                </div>
              </div>

              {/* Document date + upload row */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Document Date
                  </Label>
                  <Input
                    type="date"
                    value={pendingDate[dt.key] || ''}
                    onChange={e => setPendingDate(prev => ({ ...prev, [dt.key]: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-9"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept={ACCEPTED}
                    multiple
                    id={`file-${dt.key}`}
                    className="hidden"
                    onChange={e => handleUpload(dt.key, e.target.files)}
                  />
                  <Button
                    type="button" variant="outline" size="sm" asChild
                    disabled={uploading === dt.key}
                  >
                    <label htmlFor={`file-${dt.key}`} className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-1" />
                      {uploading === dt.key ? 'Uploading...' : 'Upload'}
                    </label>
                  </Button>
                </div>
              </div>

              {/* Uploaded files list */}
              {docs.length > 0 && (
                <div className="space-y-1">
                  {docs.map(doc => {
                    const daysLeft = getDaysUntilExpiry(doc.documentDate || '');
                    return (
                      <div key={doc.fileId} className="flex items-center justify-between py-1.5 px-2 rounded bg-background text-sm">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="truncate font-medium">{doc.fileName}</span>
                          <div className="flex items-center gap-2">
                            {doc.documentDate && <span className="text-xs text-muted-foreground">Dated: {doc.documentDate}</span>}
                            <ExpiryWarning daysLeft={daysLeft} />
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(doc)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
