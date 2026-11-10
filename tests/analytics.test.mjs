import assert from 'node:assert';
import { reportExportService } from '../src/modules/analytics/report-export-service';
import { analyticsQueryService } from '../src/modules/analytics/analytics-query-service';
import { resolveDateRange } from '../src/modules/analytics/analytics-validation';

console.log('--- Running Batch 8 Analytics Unit Test Suite ---');

// Test 1: Formula Injection Protection
console.log('Test 1: Formula injection protection on spreadsheet export...');
const maliciousInputs = ['=cmd|', '+SUM(A1:B1)', '-124.50', '@malicious', '  =evil()', '\t+danger'];
for (const input of maliciousInputs) {
  const sanitized = reportExportService.sanitizeCell(input);
  assert(
    sanitized.startsWith("'") || sanitized.startsWith('"\''),
    `Failed formula sanitization for: ${input} (got: ${sanitized})`
  );
}
console.log('✓ Test 1 passed: All formula prefixes safely neutralized.');

// Test 2: Standard Currency Formatting & Integer Paise
console.log('Test 2: Integer paise currency formatting...');
assert.strictEqual(analyticsQueryService.formatPaiseToInr(0), '₹0.00');
assert.strictEqual(analyticsQueryService.formatPaiseToInr(12500), '₹125.00');
assert.strictEqual(analyticsQueryService.formatPaiseToInr(100050), '₹1,000.50');
assert.strictEqual(analyticsQueryService.formatPaiseToInr(-5000), '-₹50.00');
console.log('✓ Test 2 passed: Integer paise to INR format verified.');

// Test 3: Safe Deterministic Percentage
console.log('Test 3: Safe deterministic percentage calculation...');
assert.strictEqual(analyticsQueryService.safePercentage(50, 100), 50);
assert.strictEqual(analyticsQueryService.safePercentage(1, 3), 33);
assert.strictEqual(analyticsQueryService.safePercentage(10, 0), null);
assert.strictEqual(analyticsQueryService.safePercentage(0, 10), 0);
console.log('✓ Test 3 passed: Safe percentage calculation verified.');

// Test 4: Date Range Resolver
console.log('Test 4: Date range resolution...');
const range = resolveDateRange({ days: 14, page: 1, pageSize: 20, format: 'json' });
assert.strictEqual(range.days, 14);
assert(range.start < range.end);
console.log('✓ Test 4 passed: Date range resolver deterministic.');

// Test 5: CSV Generation with Quoting
console.log('Test 5: CSV format and header quoting...');
const sampleData = [
  { Item: 'Atta, Chakki', Qty: 2, Total: '₹500.00' },
  { Item: 'Milk', Qty: 1, Total: '=SUM(1,2)' },
];
const csv = reportExportService.generateCsv(sampleData);
assert(csv.includes('"Atta, Chakki"'), 'Failed to escape comma in string');
assert(csv.includes("'=SUM(1,2)"), 'Failed to neutralize formula in CSV row');
console.log('✓ Test 5 passed: CSV generation and escaping verified.');

console.log('\n========================================');
console.log('ALL BATCH 8 UNIT TESTS PASSED (5/5)');
console.log('========================================');
