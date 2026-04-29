"use client";

import { CreditCard, TrendingUp, DollarSign, Calendar, ArrowUpRight, Search, Filter } from 'lucide-react';

const MOCK_PLANS = [
  { id: 1, school: "St. Mary's Convent", plan: "Premium", amount: "₹45,000", status: "Paid", nextBilling: "2026-05-15" },
  { id: 2, school: "Delhi Public School", plan: "Standard", amount: "₹25,000", status: "Paid", nextBilling: "2026-05-20" },
  { id: 3, school: "Sunrise Academy", plan: "Trial", amount: "₹0", status: "Expiring", nextBilling: "2026-05-04" },
  { id: 4, school: "Greenwood High", plan: "Premium", amount: "₹45,000", status: "Paid", nextBilling: "2026-06-01" },
];

export default function SubscriptionsPage() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
        </div>
        <button className="btn btn-primary">
          Manage Plans
        </button>
      </header>

      <div className="p-8 flex flex-col gap-8">
        {/* Revenue Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs text-success flex items-center gap-1 font-bold">+15.4% <ArrowUpRight className="w-3 h-3" /></div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Monthly Recurring Revenue</p>
            <h3 className="text-3xl font-bold">₹12.4L</h3>
          </div>
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-xs text-primary flex items-center gap-1 font-bold">+8.2% <ArrowUpRight className="w-3 h-3" /></div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Conversion Rate</p>
            <h3 className="text-3xl font-bold">24.5%</h3>
          </div>
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Upcoming Renewals</p>
            <h3 className="text-3xl font-bold">18</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by school or plan type..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Subscription Table */}
        <div className="table-wrapper">
          <table className="w-full">
            <thead>
              <tr>
                <th>School</th>
                <th>Plan Tier</th>
                <th>Amount</th>
                <th>Billing Status</th>
                <th>Next Invoice</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PLANS.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="font-semibold text-white">{item.school}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      item.plan === 'Premium' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {item.plan}
                    </span>
                  </td>
                  <td className="font-mono">{item.amount}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Paid' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{item.nextBilling}</td>
                  <td className="text-right">
                    <button className="text-sm text-primary hover:underline">View Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
