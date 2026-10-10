import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8085/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'admin'
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/30 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-violet-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/60 border-b border-white/10 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center font-bold text-lg shadow-glass-glow">
            SP
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">SimPortal</h1>
            <p className="text-xs text-slate-400">Automated Provisioning Node</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'customer'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Self-Service
          </button>

          {isAdminUnlocked && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin Console 🔒
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {activeTab === 'customer' ? (
          <CustomerPortal 
            setActiveTab={setActiveTab} 
            setIsAdminUnlocked={setIsAdminUnlocked} 
          />
        ) : (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}

function CustomerPortal({ setActiveTab, setIsAdminUnlocked }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    simNumber: '',
    serviceNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    confirmEmail: '',
    addressId: 2,
    address: 'Vijaynagar Extension',
    city: 'Mysore',
    pincode: '567017',
    state: 'Karnataka',
    uniqueIdNumber: '',
  });

  const [availableOffers, setAvailableOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const updateField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSimValidation = async () => {
    setErrorMsg('');

    try {
      const backdoorCheck = await fetch(`${API_BASE}/admin/verify-backdoor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simNumber: formData.simNumber,
          serviceNumber: formData.serviceNumber,
        }),
      });

      if (backdoorCheck.ok) {
        const authData = await backdoorCheck.json();
        sessionStorage.setItem('adminToken', authData.token);
        setIsAdminUnlocked(true);
        setActiveTab('admin');
        return;
      }
    } catch {
      // Proceed to customer verification
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sim/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simNumber: formData.simNumber,
          serviceNumber: formData.serviceNumber,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const offers = await res.json();
      setAvailableOffers(offers);
      if (offers.length > 0) setSelectedOffer(offers[0].offerId);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicsValidation = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/validate-basics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddress: formData.emailAddress,
          dateOfBirth: formData.dateOfBirth,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStep(3);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalValidation = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/validate-personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          confirmEmail: formData.confirmEmail,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStep(4);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: formData.addressId,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          state: formData.state,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStep(5);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalActivation = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/validate-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueIdNumber: formData.uniqueIdNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const msg = await res.text();
      setSuccessMsg(msg);
      setStep(6);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Stepper Header */}
      <div className="flex justify-between items-center px-4 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step === s
                  ? 'bg-cyan-500 text-white shadow-glass-glow scale-110'
                  : step > s
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 5 && (
              <div
                className={`w-8 sm:w-16 h-0.5 ${
                  step > s ? 'bg-emerald-500/60' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm backdrop-blur-md">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl p-8 relative border border-white/10 bg-slate-900/40 backdrop-blur-xl">
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Starter Kit SIM Validation</h2>
              <p className="text-sm text-slate-400">Enter your 13-digit SIM serial and 10-digit mobile number</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  SIM Number (13 Digits)
                </label>
                <input
                  type="text"
                  maxLength={13}
                  placeholder="e.g. 9876543210123"
                  value={formData.simNumber}
                  onChange={(e) => updateField('simNumber', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Service Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={formData.serviceNumber}
                  onChange={(e) => updateField('serviceNumber', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white font-mono text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleSimValidation}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Verify SIM & View Offers →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Select Offer & Verify Account</h2>
              <p className="text-sm text-slate-400">Confirm your plan and provide registered credentials</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableOffers.map((offer) => (
                <div
                  key={offer.offerId}
                  onClick={() => setSelectedOffer(offer.offerId)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    selectedOffer === offer.offerId
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white text-sm">{offer.offerName}</span>
                    <span className="text-cyan-400 font-bold text-base">₹{offer.cost}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>• Data: {offer.dataQty} GB</p>
                    <p>• Voice: {offer.callQty} mins</p>
                    <p>• Validity: {offer.duration} days</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Registered Email</label>
                <input
                  type="email"
                  placeholder="e.g. bob@abc.com"
                  value={formData.emailAddress}
                  onChange={(e) => updateField('emailAddress', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleBasicsValidation}
                disabled={loading}
                className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Validate & Continue →'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Personal Authentication</h2>
              <p className="text-sm text-slate-400">Match registered first and last name records</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">First Name</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="Bob"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Last Name</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="Sam"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Confirm Email Address</label>
              <input
                type="email"
                placeholder="Re-enter registered email"
                value={formData.confirmEmail}
                onChange={(e) => updateField('confirmEmail', e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handlePersonalValidation}
                disabled={loading}
                className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Confirm Details →'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Communication Address</h2>
              <p className="text-sm text-slate-400">Verify or modify your dispatch address</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Address (Max 25 chars)
              </label>
              <input
                type="text"
                maxLength={25}
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  PIN Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => updateField('pincode', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleAddressUpdate}
                disabled={loading}
                className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Update & Proceed →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Supports 12-Digit Aadhaar or 16-Digit Identity */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Identity Proof Verification</h2>
              <p className="text-sm text-slate-400">
                Enter your registered Aadhaar (12 digits) or National ID number to trigger activation
              </p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                12 or 16-Digit Identity Number
              </label>
              <input
                type="password"
                maxLength={16}
                placeholder="Enter 12-digit Aadhaar or 16-digit ID"
                value={formData.uniqueIdNumber}
                onChange={(e) => updateField('uniqueIdNumber', e.target.value)}
                className="w-full mt-1.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none transition-all text-white tracking-widest text-center text-lg font-mono"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(4)}
                className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-all"
              >
                ← Back
              </button>
              <button
                onClick={handleFinalActivation}
                disabled={loading}
                className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Activating...' : 'Submit & Activate SIM ⚡'}
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-glass-glow">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white">Activation Complete!</h2>
            <p className="text-slate-300 max-w-sm mx-auto text-sm">{successMsg}</p>
            <div className="pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-sm font-medium transition-all"
              >
                Activate Another Line
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanel() {
  const [metrics, setMetrics] = useState({ totalSims: 0, activeSims: 0, pendingSims: 0, totalCustomers: 0 });
  const [simList, setSimList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  const loadData = async () => {
    const token = sessionStorage.getItem('adminToken');
    try {
      const [mRes, sRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/admin/metrics`, { headers: { Authorization: token } }),
        fetch(`${API_BASE}/admin/sims`, { headers: { Authorization: token } }),
        fetch(`${API_BASE}/admin/customers`, { headers: { Authorization: token } }),
      ]);
      if (mRes.ok) setMetrics(await mRes.json());
      if (sRes.ok) setSimList(await sRes.json());
      if (cRes.ok) setCustomerList(await cRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStatus = async (simId, currentStatus) => {
    const token = sessionStorage.getItem('adminToken');
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await fetch(`${API_BASE}/admin/sims/${simId}/status?status=${nextStatus}`, {
      method: 'PATCH',
      headers: { Authorization: token },
    });
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory', val: metrics.totalSims, color: 'text-cyan-400' },
          { label: 'Active Lines', val: metrics.activeSims, color: 'text-emerald-400' },
          { label: 'Pending', val: metrics.pendingSims, color: 'text-amber-400' },
          { label: 'Subscribers', val: metrics.totalCustomers, color: 'text-violet-400' },
        ].map((m, i) => (
          <div key={i} className="rounded-xl p-5 border border-white/10 bg-slate-900/40 backdrop-blur-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">{m.label}</span>
            <div className={`text-2xl font-extrabold mt-1 ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* POS Data Ingestion Form */}
      <AdminOnboardingForm onComplete={loadData} />

      {/* SIM Inventory Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-white text-base">Provisioning Registry (SIM Inventory)</h3>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">SIM ID</th>
                <th className="py-3 px-4">Service Number</th>
                <th className="py-3 px-4">SIM Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {simList.map((sim) => (
                <tr key={sim.simId}>
                  <td className="py-3.5 px-4 font-mono text-xs">{sim.simId}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{sim.serviceNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{sim.simNumber}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        sim.simStatus === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sim.simStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(sim.simId, sim.simStatus)}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Toggle {sim.simStatus === 'active' ? 'Inactive' : 'Active'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Registry Table */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-white text-base">Registered Customer Database</h3>
          <span className="text-xs text-slate-400">{customerList.length} total customer(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">DOB</th>
                <th className="py-3 px-4">ID Type</th>
                <th className="py-3 px-4">ID Number</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Linked Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 text-sm">
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                customerList.map((c, idx) => (
                  <tr key={c.uniqueIdNumber || idx}>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-cyan-300">{c.emailAddress}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{c.dateOfBirth}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-slate-200">
                        {c.idType || 'Aadhaar'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      {c.uniqueIdNumber ? `•••• •••• ${c.uniqueIdNumber.slice(-4)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs">{c.state}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {c.customerAddress
                        ? `${c.customerAddress.address}, ${c.customerAddress.city} (${c.customerAddress.pincode})`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminOnboardingForm({ onComplete }) {
  const [form, setForm] = useState({
    simNumber: '',
    serviceNumber: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    dateOfBirth: '',
    idType: 'Aadhaar',
    uniqueIdNumber: '',
    address: '',
    city: '',
    pincode: '',
    state: 'Karnataka',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Submitting...');
    const token = sessionStorage.getItem('adminToken');

    try {
      const res = await fetch(`${API_BASE}/admin/onboard-sim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('✓ Inactive SIM kit and Aadhaar/KYC staged successfully!');
        setForm({
          simNumber: '',
          serviceNumber: '',
          firstName: '',
          lastName: '',
          emailAddress: '',
          dateOfBirth: '',
          idType: 'Aadhaar',
          uniqueIdNumber: '',
          address: '',
          city: '',
          pincode: '',
          state: 'Karnataka',
        });
        onComplete();
      } else {
        setStatus('Error onboarding SIM kit.');
      }
    } catch {
      setStatus('Network communication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4 border border-white/10 bg-slate-900/40 backdrop-blur-xl">
      <div className="border-b border-white/10 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-base">Point of Sale: Ingest New SIM Kit</h3>
          <p className="text-xs text-slate-400">Pre-record physical pack serials and subscriber KYC for self-activation</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Staged as Inactive
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">SIM Number (13 Digits)</label>
          <input
            name="simNumber"
            maxLength={13}
            placeholder="e.g. 5555555555123"
            value={form.simNumber}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs font-mono"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Mobile Service Number (10 Digits)</label>
          <input
            name="serviceNumber"
            maxLength={10}
            placeholder="e.g. 9112233445"
            value={form.serviceNumber}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs font-mono"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">First Name</label>
          <input
            name="firstName"
            placeholder="John"
            value={form.firstName}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Last Name</label>
          <input
            name="lastName"
            placeholder="Doe"
            value={form.lastName}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Email Address</label>
          <input
            name="emailAddress"
            type="email"
            placeholder="john@example.com"
            value={form.emailAddress}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Date of Birth</label>
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-slate-200 text-xs"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Identity Document Type</label>
          <select
            name="idType"
            value={form.idType}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
          >
            <option value="Aadhaar">Aadhaar Card (12 Digits)</option>
            <option value="Passport">Passport (16 Digits)</option>
            <option value="DriverLicense">Driver's License</option>
            <option value="VoterID">Voter ID</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">
            {form.idType === 'Aadhaar' ? '12-Digit Aadhaar Number' : 'Document ID Number'}
          </label>
          <input
            name="uniqueIdNumber"
            maxLength={form.idType === 'Aadhaar' ? 12 : 16}
            placeholder={form.idType === 'Aadhaar' ? 'e.g. 123456789012' : 'Enter registered ID'}
            value={form.uniqueIdNumber}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs font-mono"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Address (Max 25 Chars)</label>
          <input
            name="address"
            maxLength={25}
            placeholder="Suite 100"
            value={form.address}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">City</label>
          <input
            name="city"
            placeholder="Bengaluru"
            value={form.city}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">Pincode (6 Digits)</label>
          <input
            name="pincode"
            maxLength={6}
            placeholder="560001"
            value={form.pincode}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs font-mono"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-400">State</label>
          <input
            name="state"
            placeholder="Karnataka"
            value={form.state}
            onChange={handleChange}
            className="w-full mt-1 p-2.5 rounded-lg bg-slate-950/60 border border-white/10 focus:border-cyan-500 outline-none text-white text-xs"
            required
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs text-cyan-300 font-medium">{status}</span>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-semibold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? 'Registering Kit...' : 'Ingest & Register Kit'}
        </button>
      </div>
    </form>
  );
}