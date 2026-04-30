"use client";

import { GraduationCap } from 'lucide-react';

export default function BrandIcon({ className = "w-8 h-8", animated = true }: { className?: string, animated?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Animated Glow Ring */}
      {animated && (
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
      )}
      
      {/* Rotating Orbit (Inner) */}
      {animated && (
        <div className="absolute inset-[-4px] border border-primary/20 rounded-full animate-[spin_8s_linear_infinite]" />
      )}

      {/* Rotating Orbit (Outer) */}
      {animated && (
        <div className="absolute inset-[-8px] border border-secondary/10 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
      )}

      {/* Main Icon */}
      <GraduationCap 
        className={`relative z-10 text-primary ${animated ? 'animate-pulse-soft' : ''}`} 
        strokeWidth={2.5}
      />
    </div>
  );
}
