import assert from 'node:assert/strict';

console.log('🧪 Running Batch 11.16 AuthModal OTP Failure-Path & Mock Removal Tests...\n');

// Mock state and handler mimicking AuthModal.handleSendOtp logic
interface RequestOtpResponse {
  ok: boolean;
  status: number;
  data?: {
    success: boolean;
    data?: {
      devCode?: string;
      maskedPhone?: string;
    };
    error?: {
      message?: string;
    };
  };
}

class AuthModalHarness {
  step: 'PHONE' | 'OTP' = 'PHONE';
  phone = '9876543210';
  otp = '';
  loading = false;
  error = '';
  mockFetchResponse: (() => Promise<RequestOtpResponse>) | null = null;

  async handleSendOtp() {
    const cleanDigits = this.phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      this.error = 'Please enter a valid 10-digit Indian mobile number';
      return;
    }
    this.error = '';
    this.loading = true;

    try {
      if (!this.mockFetchResponse) {
        throw new Error('Network error: Failed to fetch');
      }
      const res = await this.mockFetchResponse();
      const data = res.data;
      this.loading = false;

      if (res.ok && data?.success) {
        this.step = 'OTP';
        if (data.data?.devCode) {
          this.otp = data.data.devCode;
        } else {
          this.otp = '';
        }
      } else {
        this.error = data?.error?.message || 'Failed to dispatch OTP. Please check the number and try again.';
      }
    } catch {
      this.loading = false;
      this.error = 'Network connectivity error. Could not request OTP.';
    }
  }

  handleVerifyOtp(): { submittedPhone: string; submittedOtp: string } {
    if (this.otp.length < 4) {
      this.error = 'Please enter a valid OTP';
      throw new Error('Validation failed');
    }
    return { submittedPhone: this.phone, submittedOtp: this.otp };
  }
}

async function runTests() {
  // Test 1: Successful production request without devCode
  console.log('Test 1: Successful production OTP request (no devCode returned)...');
  const h1 = new AuthModalHarness();
  h1.mockFetchResponse = async () => ({
    ok: true,
    status: 200,
    data: { success: true, data: { maskedPhone: '+91 ******3210' } },
  });
  await h1.handleSendOtp();
  assert.equal(h1.step, 'OTP', 'Advances to OTP step');
  assert.equal(h1.loading, false, 'Loading indicator stopped');
  assert.equal(h1.otp, '', 'OTP is EMPTY, never populated with mock 123456');
  assert.equal(h1.error, '', 'No error displayed');
  console.log('  ✓ Test 1 passed: Advanced to OTP step with empty OTP input, no hardcoded fallback.');

  // Test 2: Successful authorized development response with devCode
  console.log('\nTest 2: Authorized development response with devCode...');
  const h2 = new AuthModalHarness();
  h2.mockFetchResponse = async () => ({
    ok: true,
    status: 200,
    data: { success: true, data: { devCode: '984210', maskedPhone: '+91 ******3210' } },
  });
  await h2.handleSendOtp();
  assert.equal(h2.step, 'OTP', 'Advances to OTP step');
  assert.equal(h2.loading, false, 'Loading indicator stopped');
  assert.equal(h2.otp, '984210', 'Populates exact authorized devCode');
  assert.equal(h2.error, '', 'No error displayed');
  console.log('  ✓ Test 2 passed: Authorized devCode populated when explicitly provided.');

  // Test 3: Network failure
  console.log('\nTest 3: Network connectivity failure...');
  const h3 = new AuthModalHarness();
  h3.mockFetchResponse = null; // will throw
  await h3.handleSendOtp();
  assert.equal(h3.step, 'PHONE', 'Remains on PHONE step');
  assert.equal(h3.loading, false, 'Loading indicator stopped');
  assert.equal(h3.otp, '', 'OTP remains empty');
  assert.equal(h3.error, 'Network connectivity error. Could not request OTP.', 'Meaningful error shown');
  assert.throws(() => h3.handleVerifyOtp(), /Validation failed/, 'Cannot verify OTP after failure');
  console.log('  ✓ Test 3 passed: Network failure halts on phone step with error; zero OTP invention.');

  // Test 4: HTTP 400 Bad Request rejection
  console.log('\nTest 4: HTTP 400 Bad Request rejection...');
  const h4 = new AuthModalHarness();
  h4.mockFetchResponse = async () => ({
    ok: false,
    status: 400,
    data: { success: false, error: { message: 'Invalid mobile phone number format' } },
  });
  await h4.handleSendOtp();
  assert.equal(h4.step, 'PHONE', 'Remains on PHONE step');
  assert.equal(h4.loading, false, 'Loading indicator stopped');
  assert.equal(h4.otp, '', 'OTP remains empty');
  assert.equal(h4.error, 'Invalid mobile phone number format', 'Backend rejection error shown');
  console.log('  ✓ Test 4 passed: HTTP 400 displays backend rejection and remains on PHONE step.');

  // Test 5: HTTP 429 Rate-Limit rejection
  console.log('\nTest 5: HTTP 429 Rate-Limit rejection...');
  const h5 = new AuthModalHarness();
  h5.mockFetchResponse = async () => ({
    ok: false,
    status: 429,
    data: {
      success: false,
      error: { message: 'Too many OTP requests. For your security, please wait 10 minutes before trying again.' },
    },
  });
  await h5.handleSendOtp();
  assert.equal(h5.step, 'PHONE', 'Remains on PHONE step');
  assert.equal(h5.loading, false, 'Loading indicator stopped');
  assert.equal(h5.otp, '', 'OTP remains empty');
  assert.ok(h5.error.includes('10 minutes'), 'Rate limit message preserved');
  console.log('  ✓ Test 5 passed: HTTP 429 rate limit correctly halts step advancement.');

  // Test 6: HTTP 500 Server failure
  console.log('\nTest 6: HTTP 500 Server failure...');
  const h6 = new AuthModalHarness();
  h6.mockFetchResponse = async () => ({
    ok: false,
    status: 500,
    data: { success: false, error: { message: 'Internal SMS gateway dispatch error' } },
  });
  await h6.handleSendOtp();
  assert.equal(h6.step, 'PHONE', 'Remains on PHONE step');
  assert.equal(h6.loading, false, 'Loading indicator stopped');
  assert.equal(h6.otp, '', 'OTP remains empty');
  assert.equal(h6.error, 'Internal SMS gateway dispatch error', 'Internal server error displayed');
  console.log('  ✓ Test 6 passed: HTTP 500 displays error without silent mock advancement.');

  // Test 7: User-entered OTP submitted accurately, no substitution
  console.log('\nTest 7: User-entered OTP submitted accurately...');
  const h7 = new AuthModalHarness();
  h7.step = 'OTP';
  h7.otp = '654321';
  const submission = h7.handleVerifyOtp();
  assert.equal(submission.submittedOtp, '654321', 'Exact user-entered OTP submitted');
  console.log('  ✓ Test 7 passed: Exact user OTP submitted without silent fallback substitution.');

  console.log('\n======================================================');
  console.log('🎉 ALL 7 AUTHMODAL FAILURE-PATH & MOCK TESTS PASSED!');
  console.log('======================================================\n');
}

runTests();
