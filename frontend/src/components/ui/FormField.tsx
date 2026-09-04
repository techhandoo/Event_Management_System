import { ReactNode } from 'react';

interface FormFieldProps {
 label: string;
 icon?: ReactNode;
 required?: boolean;
 children: ReactNode;
}

export default function FormField({ label, icon, required, children }: FormFieldProps) {
 return (
  <div className="form-item">
   <label className="label flex items-center gap-1.5">
    {icon && <span className="text-surface-400">{icon}</span>}
    {label}
    {required && <span className="text-red-400 text-xs">*</span>}
   </label>
   {children}
  </div>
 );
}
