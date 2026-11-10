/**
 * Export engine providing secure CSV string generation with Formula Injection Protection
 */
export class ReportExportService {
  /**
   * Sanitizes a cell value to prevent CSV Formula Injection (DDE injection).
   * Characters =, +, -, @, and leading whitespace/tab/carriage returns are neutralized.
   */
  sanitizeCell(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    let str = String(value);

    // Trim leading whitespace and check sensitive formula injection characters
    const trimmedLeading = str.replace(/^[\s\t\r\n]+/, '');
    const sensitivePrefixes = ['=', '+', '-', '@', '\t', '\r'];

    if (sensitivePrefixes.some((prefix) => trimmedLeading.startsWith(prefix))) {
      // Prepend single quote (') to escape formula execution in Excel/Sheets/LibreOffice
      str = `'${str}`;
    }

    // Escape quotes and wrap in quotes if comma, newline or quotes are present
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Converts array of objects into safe, sanitized CSV format
   */
  generateCsv(data: Record<string, unknown>[], headers?: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const fieldKeys = headers || Object.keys(data[0]);
    const headerRow = fieldKeys.map((k) => this.sanitizeCell(k)).join(',');

    const rows = data.map((item) => {
      return fieldKeys.map((k) => this.sanitizeCell(item[k])).join(',');
    });

    return [headerRow, ...rows].join('\r\n');
  }
}

export const reportExportService = new ReportExportService();
