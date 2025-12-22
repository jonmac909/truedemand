'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

/**
 * C2 Export Buttons Component
 *
 * Provides buttons to export blueprints in different formats:
 * - Full Blueprint (Markdown)
 * - Marketing Plan (derived Markdown)
 */
interface ExportButtonsProps {
  blueprintId: string;
  className?: string;
}

export function ExportButtons({ blueprintId, className }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<'blueprint' | 'marketing' | null>(null);

  const handleExport = async (type: 'blueprint' | 'marketing') => {
    setIsExporting(type);

    try {
      const endpoint =
        type === 'blueprint'
          ? `/api/blueprints/${blueprintId}/export`
          : `/api/blueprints/${blueprintId}/export-marketing`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${type}-export.md`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <Button
        onClick={() => handleExport('blueprint')}
        disabled={isExporting !== null}
        className="gap-2"
      >
        {isExporting === 'blueprint' ? (
          <>
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Blueprint
          </>
        )}
      </Button>

      <Button
        onClick={() => handleExport('marketing')}
        disabled={isExporting !== null}
        variant="secondary"
        className="gap-2"
      >
        {isExporting === 'marketing' ? (
          <>
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Export Marketing Plan
          </>
        )}
      </Button>
    </div>
  );
}
