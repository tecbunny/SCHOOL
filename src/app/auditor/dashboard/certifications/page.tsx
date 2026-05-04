"use client";

import { Award, BadgeCheck, CalendarDays, FileCheck2, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from('certifications')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (data && data.length > 0) {
          setCertifications(data.map((cert: any) => ({
            name: cert.certification_name,
            status: new Date(cert.expiry_at) > new Date() ? 'active' : 'attention',
            expires: cert.expiry_at || 'Unknown',
            coverage: cert.file_url ? 100 : 75
          })));
        }
      } catch (err) {
        console.error('Fetch certs error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [supabase]);

  return (
    <section className="min-h-screen bg-[#070B19] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-success font-black uppercase tracking-widest text-xs mb-3">
              <Award className="w-5 h-5" />
              Certifications
            </div>
            <h1 className="text-4xl font-black">Institution certification tracker</h1>
            <p className="text-muted mt-2">Expiry, coverage, and review status for board-facing certifications.</p>
          </div>
          <button className="btn btn-primary bg-success border-success gap-2 px-6 py-3 rounded-2xl">
            <FileCheck2 className="w-5 h-5" />
            Issue certificate
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading && (
            <div className="lg:col-span-2 glass-card rounded-[2rem] p-7 text-center text-xs font-black uppercase tracking-widest text-muted">
              Loading certification records...
            </div>
          )}
          {!loading && certifications.length === 0 && (
            <div className="lg:col-span-2 glass-card rounded-[2rem] p-10 text-center">
              <h2 className="text-xl font-black text-white">No certification records yet</h2>
              <p className="text-sm text-muted mt-2">Issue or import school certification records to populate this tracker.</p>
            </div>
          )}
          {certifications.map((cert) => (
            <article key={cert.name} className="glass-card rounded-[2rem] p-7">
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                    <BadgeCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{cert.name}</h2>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4" />
                      Valid until {cert.expires}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  cert.status === 'active' ? 'bg-success/10 text-success' :
                  cert.status === 'review' ? 'bg-warning/10 text-warning' :
                  'bg-danger/10 text-danger'
                }`}>
                  {cert.status}
                </span>
              </div>

              <div className="mt-8">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted mb-3">
                  <span>Coverage</span>
                  <span>{cert.coverage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cert.coverage > 80 ? 'bg-success' : cert.coverage > 65 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${cert.coverage}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="w-4 h-4 text-success" />
                Signed audit evidence required before final board export.
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
