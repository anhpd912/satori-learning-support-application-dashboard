'use client';

import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label?: string;
  options: (string | FilterOption)[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const normalizedOptions: FilterOption[] = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );
  const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}

      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">

          {/* 1. Nút bấm chính (Thay thế thẻ Select cũ) */}
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
            <span className="block truncate text-gray-900">{selectedOption?.label || value}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              {/* Icon Mũi tên */}
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </Listbox.Button>

          {/* 2. Danh sách xổ xuống (Custom hoàn toàn bằng Tailwind) */}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {normalizedOptions.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-4 ${active ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}