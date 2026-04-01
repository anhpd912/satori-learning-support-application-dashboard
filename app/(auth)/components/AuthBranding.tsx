import React from 'react';
import Image from 'next/image';

export default function AuthBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-[#1F3A8A] flex-col justify-center items-center text-white overflow-hidden">
      
      <div className="absolute inset-0 z-0">
         <Image 
           src="/Images/login.png" 
           alt="Satori Background" 
           fill
           className="object-cover opacity-90"
           priority
         />
      </div>
    </div>
  );
}