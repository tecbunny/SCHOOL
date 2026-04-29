"use client";

import { Inbox, CheckCircle, XCircle, Search, Filter, Clock, Eye, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Request {
  id: string;
  school_name: string;
  udise_code: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests');
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.school_name.toLowerCase().includes(search.toLowerCase()) || 
    r.applicant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-warning/20 p-2 rounded-lg">
            <Inbox className="w-6 h-6 text-warning" />
          </div>
          <h1 className="text-2xl font-bold">Registration Requests</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-warning">{requests.filter(r => r.status === 'pending').length} Pending</span>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by school name or applicant..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Requests Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>School Details</th>
                  <th>Applicant</th>
                  <th>Date Received</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td>
                      <div className="font-semibold text-white">{req.school_name}</div>
                      <div className="text-xs text-muted font-mono mt-1">U-DISE: {req.udise_code}</div>
                    </td>
                    <td>
                      <div>{req.applicant_name}</div>
                      <div className="text-xs text-muted">{req.applicant_email}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-muted">
                        <Clock className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        req.status === 'pending' ? 'badge-warning' : 
                        req.status === 'approved' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button 
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-success" 
                              title="Approve"
                              onClick={() => handleUpdateStatus(req.id, 'approved')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-danger" 
                              title="Reject"
                              onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

