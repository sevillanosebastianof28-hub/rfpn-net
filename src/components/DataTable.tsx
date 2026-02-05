import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends { id: string }>({ 
  columns, 
  data, 
  isLoading, 
  emptyState,
  onRowClick,
  className 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          {emptyState.icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="mb-1 text-lg font-semibold">{emptyState.title}</h3>
        {emptyState.description && (
          <p className="mb-4 text-sm text-muted-foreground">{emptyState.description}</p>
        )}
        {emptyState.action}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-border/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render 
                    ? column.render(item) 
                    : (item as Record<string, unknown>)[column.key] as React.ReactNode
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
