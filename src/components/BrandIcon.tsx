"use client";

import { GraduationCap } from 'lucide-react';

export default function BrandIcon({ className = "w-8 h-8", animated = true }: { className?: string, animated?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {animated && (
        <div className="absolute inset-0 bg-secondary/20 rounded-xl blur-md animate-pulse" />
      )}
      <div className="absolute inset-0 rounded-xl bg-primary shadow-lg" />
      <GraduationCap
        className="relative z-10"
        style={{ color: '#ffffff' }}
        strokeWidth={2.5}
      />
    </div>
  );
}
