import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { BindingRecord } from '../types';

interface PassportCardProps {
  record: BindingRecord;
}

export const PassportCard: React.FC<PassportCardProps> = ({ record }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-3xl border-2 border-black overflow-hidden shadow-2xl bg-white"
    >
      <div className="absolute top-2 right-4 z-10 pointer-events-none">
        <div className="stamp-effect">
          <div className="stamp-inner-effect">
            <CheckCircle className="mx-auto mb-1" size={24} />
            SOUL<br/>LINKED
          </div>
        </div>
      </div>

      <div className="bg-black text-white p-5 text-center">
        <div className="mb-2 text-2xl">🥷</div>
        <h2 className="text-xl font-black tracking-[0.2em]">SOULLINK PASSPORT</h2>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-dashed border-border text-green-600">
          <CheckCircle size={20} />
          <span className="font-bold text-lg">Human Verified</span>
        </div>

        <div className="space-y-4">
          <InfoRow label="Wallet Address" value={record.address} isHash />
          <InfoRow label="Passkey ID" value={record.passkeyId} isHash truncate />
          
          <div className="grid grid-cols-2 gap-4">
            <InfoRow 
              label="Date" 
              value={new Date(record.timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\//g, '-')} 
            />
            <InfoRow label="Status" value="Permanent" valueClassName="text-green-600 font-bold" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoRow = ({ label, value, isHash, truncate, valueClassName }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <div className={`${isHash ? 'hash-font' : 'text-sm font-medium'} ${valueClassName || ''}`}>
      {truncate && value.length > 32 ? `${value.substring(0, 32)}...` : value}
    </div>
  </div>
);
