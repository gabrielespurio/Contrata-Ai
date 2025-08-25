import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Plus, X } from 'lucide-react';

interface ElegantFormProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface FormRowProps {
  children: ReactNode;
  className?: string;
}

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}

interface PhotoUploadProps {
  label?: string;
  onUpload?: (file: File) => void;
  currentPhoto?: string;
  className?: string;
}

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function ElegantForm({ children, title, subtitle, className }: ElegantFormProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8", className)}>
      <div className="max-w-4xl mx-auto px-4">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FormSection({ title, children, className, collapsible = false, defaultExpanded = true }: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
}

export function FormField({ label, children, required = false, error, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export const ElegantInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 rounded-lg",
          "placeholder:text-gray-400 text-gray-900",
          "transition-all duration-200 ease-in-out",
          className
        )}
        {...props}
      />
    );
  }
);

export const ElegantSelect = Select;
export const ElegantSelectTrigger = forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    className={cn(
      "h-12 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 rounded-lg",
      "text-gray-900 data-[placeholder]:text-gray-400",
      "transition-all duration-200 ease-in-out",
      className
    )}
    {...props}
  />
));

export const ElegantTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "min-h-[100px] border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 rounded-lg",
          "placeholder:text-gray-400 text-gray-900 resize-none",
          "transition-all duration-200 ease-in-out",
          className
        )}
        {...props}
      />
    );
  }
);

export function ElegantRadioGroup({ children, className, ...props }: React.ComponentPropsWithoutRef<typeof RadioGroup>) {
  return (
    <RadioGroup className={cn("flex gap-6", className)} {...props}>
      {children}
    </RadioGroup>
  );
}

export function ElegantRadioItem({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <RadioGroupItem 
        value={value} 
        id={value}
        className="border-gray-300 text-orange-500 focus:ring-orange-400/20"
      />
      <Label 
        htmlFor={value}
        className="text-sm font-medium text-gray-700 cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}

export function PhotoUpload({ label = "Adicionar Foto", onUpload, currentPhoto, className }: PhotoUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-orange-100 border-2 border-dashed border-orange-300 flex items-center justify-center overflow-hidden">
          {currentPhoto ? (
            <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-8 h-8 text-orange-400" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <Label className="text-sm font-medium text-orange-600 cursor-pointer hover:text-orange-700 transition-colors">
        {label}
      </Label>
    </div>
  );
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex justify-end space-x-4 pt-6 border-t border-gray-200", className)}>
      {children}
    </div>
  );
}

export const ElegantButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400/50 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400/50",
    outline: "border-2 border-gray-300 hover:border-orange-400 text-gray-700 hover:text-orange-600 focus:ring-orange-400/50 bg-white"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <Button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export function AddAnotherSection({ 
  label, 
  onAdd, 
  className 
}: { 
  label: string; 
  onAdd: () => void; 
  className?: string; 
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onAdd}
      className={cn(
        "w-full border-2 border-dashed border-orange-300 text-orange-600 hover:border-orange-400 hover:text-orange-700",
        "py-3 font-medium transition-all duration-200",
        className
      )}
    >
      <Plus className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

export function RemovableSection({ 
  children, 
  onRemove, 
  className 
}: { 
  children: ReactNode; 
  onRemove: () => void; 
  className?: string; 
}) {
  return (
    <div className={cn("relative p-4 border border-gray-200 rounded-lg bg-gray-50", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
      >
        <X className="w-4 h-4" />
      </Button>
      {children}
    </div>
  );
}

// Componentes de layout para formulários multi-step
export function StepIndicator({ 
  steps, 
  currentStep, 
  className 
}: { 
  steps: string[]; 
  currentStep: number; 
  className?: string; 
}) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index < currentStep ? "bg-orange-500 text-white" :
                index === currentStep ? "bg-orange-100 text-orange-600 border-2 border-orange-500" :
                "bg-gray-200 text-gray-500"
              )}>
                {index + 1}
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium",
                index === currentStep ? "text-orange-600" : "text-gray-500"
              )}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-4",
                  index < currentStep ? "bg-orange-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ElegantInput.displayName = "ElegantInput";
ElegantSelectTrigger.displayName = "ElegantSelectTrigger";
ElegantTextarea.displayName = "ElegantTextarea";
ElegantButton.displayName = "ElegantButton";