import React from 'react';

import AuthBranding from '../components/AuthBranding';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      
      <AuthBranding />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
            {children}
        </div>
      </div>

    </div>
  );
}