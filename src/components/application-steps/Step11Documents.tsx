import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, FileText, CheckCircle } from 'lucide-react';
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

export function Step11Documents({ data, onChange, applicationId, userId }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);

  const getDocsForType = (type: string) => data.filter(d => d.type === type);

  const handleUpload = async (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(type);

    try {
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
        }).select('id').single();

        if (insertErr) throw insertErr;

        onChange([...data, { type, fileId: docRow.id, fileName: file.name }]);
      }
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
      <p className="text-sm text-muted-foreground">Upload supporting documents. Accepted formats: PDF, JPG, PNG.</p>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map(dt => {
          const docs = getDocsForType(dt.key);
          return (
            <div key={dt.key} className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {docs.length > 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  <Label className="font-semibold">{dt.label}</Label>
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
              {docs.length > 0 && (
                <div className="space-y-1">
                  {docs.map(doc => (
                    <div key={doc.fileId} className="flex items-center justify-between py-1 px-2 rounded bg-background text-sm">
                      <span className="truncate">{doc.fileName}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(doc)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
