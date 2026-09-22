import React, { useState } from 'react';
import { submitVerification } from '../services/api';
import { ClipboardCheck, CheckCircle2, Send } from 'lucide-react';

interface VerificationPageProps {
  initialAnimalId?: string;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ initialAnimalId = 'COW-027' }) => {
  const [animalId, setAnimalId] = useState(initialAnimalId);
  const [verifierType, setVerifierType] = useState<'FARMER' | 'VETERINARIAN' | 'FIELD_OFFICER'>('VETERINARIAN');
  const [cmtResult, setCmtResult] = useState<'NEGATIVE' | 'TRACE' | '1+' | '2+' | '3+'>('2+');
  const [sccResult, setSccResult] = useState<number>(650000);
  const [clinicalSymptoms, setClinicalSymptoms] = useState('Mild warmth in rear quarter, elevated electrical conductivity.');
  const [vetNotes, setVetNotes] = useState('Subclinical mastitis verified early. Administered quarter wash.');
  const [isMastitisConfirmed, setIsMastitisConfirmed] = useState(true);
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await submitVerification({
      animal_id: animalId,
      verifier_type: verifierType,
      cmt_result: cmtResult,
      scc_result: sccResult,
      clinical_symptoms: clinicalSymptoms,
      veterinary_notes: vetNotes,
      is_mastitis_confirmed: isMastitisConfirmed
    });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">CMT & Veterinary Verification Logging</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Record actual field verification outcomes (CMT / SCC) to feed the model feedback loop.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Verification Outcome Logged Successfully!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Verification recorded for future model improvement. Ground truth data for <strong className="text-white font-bold">{animalId}</strong> has been stored in the database.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg"
          >
            Log Another Verification Record
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Animal ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Animal ID</label>
              <input
                type="text"
                value={animalId}
                onChange={(e) => setAnimalId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Verifier Role */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Verifier Role</label>
              <select
                value={verifierType}
                onChange={(e: any) => setVerifierType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="FARMER">Dairy Farmer</option>
                <option value="VETERINARIAN">Veterinarian</option>
                <option value="FIELD_OFFICER">Field Officer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CMT Result */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">CMT Reactive Score</label>
              <select
                value={cmtResult}
                onChange={(e: any) => setCmtResult(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="NEGATIVE">Negative (0)</option>
                <option value="TRACE">Trace</option>
                <option value="1+">1+ Reactive</option>
                <option value="2+">2+ Moderate Reactive</option>
                <option value="3+">3+ Highly Reactive</option>
              </select>
            </div>

            {/* SCC Result */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Somatic Cell Count (SCC / mL)</label>
              <input
                type="number"
                value={sccResult}
                onChange={(e) => setSccResult(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Clinical Symptoms */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Observed Symptoms / Physical Signs</label>
            <textarea
              rows={2}
              value={clinicalSymptoms}
              onChange={(e) => setClinicalSymptoms(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Vet Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Veterinary Action / Notes</label>
            <textarea
              rows={2}
              value={vetNotes}
              onChange={(e) => setVetNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Final Ground Truth Confirmation Checkbox */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Was Mastitis Confirmed?</span>
              <span className="text-[11px] text-slate-400">Mark true if CMT or SCC confirmed subclinical/clinical mastitis.</span>
            </div>
            <input
              type="checkbox"
              checked={isMastitisConfirmed}
              onChange={(e) => setIsMastitisConfirmed(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting Record...' : 'Submit Verification & Feedback'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
