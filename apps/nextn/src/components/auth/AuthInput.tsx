'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  invalid?: boolean;
}

/**
 * Icon-prefixed input with optional password show/hide toggle.
 * Built on top of the project's <Input> primitive.
 */
const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, type = 'text', invalid, className, ...rest }, ref) => {
    const isPassword = type === 'password';
    const [show, setShow] = useState(false);
    const resolvedType = isPassword ? (show ? 'text' : 'password') : type;

    return (
      <div
        className={cn(
          'group relative flex items-center rounded-xl border bg-background/50 transition-all duration-200',
          'focus-within:bg-background/80 focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]',
          invalid
            ? 'border-destructive/50'
            : 'border-border/60 hover:border-border'
        )}
      >
        {icon && (
          <div className="pl-3.5 pr-1.5 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          type={resolvedType}
          className={cn(
            'h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60',
            icon ? 'pl-1' : 'pl-3.5',
            isPassword ? 'pr-12' : 'pr-3.5',
            className
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label={show ? 'Нууц үг нуух' : 'Нууц үг харах'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);
AuthInput.displayName = 'AuthInput';

export default AuthInput;
