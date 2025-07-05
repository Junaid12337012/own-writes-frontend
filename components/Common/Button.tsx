import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'highlight';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-display font-semibold rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-brand-bg-dark transition-all duration-200 ease-in-out inline-flex items-center justify-center shadow-sm hover:shadow-md disabled:shadow-sm"; 
  
  const variantStyles = {
    primary: "bg-brand-accent text-white hover:bg-brand-accent/90 focus-visible:ring-brand-accent active:scale-95 disabled:bg-brand-accent/50",
    secondary: "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 focus-visible:ring-brand-accent dark:bg-brand-accent-dark/10 dark:text-brand-accent-dark dark:hover:bg-brand-accent-dark/20 dark:focus-visible:ring-brand-accent-dark active:scale-95 border border-brand-accent/20 dark:border-brand-accent-dark/20",
    highlight: "bg-brand-highlight text-white hover:bg-brand-highlight/90 focus-visible:ring-brand-highlight active:scale-95 disabled:bg-brand-highlight/50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-red-500 active:scale-95",
    ghost: "bg-transparent text-brand-text-muted hover:bg-gray-500/10 focus-visible:ring-brand-accent hover:text-brand-accent dark:text-brand-text-muted-dark dark:hover:bg-white/10 dark:hover:text-brand-accent-dark dark:focus-visible:ring-brand-accent-dark",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm", 
    md: "px-5 py-2 text-base", 
    lg: "px-6 py-2.5 text-lg", 
  };

  const loadingStyles = isLoading ? "opacity-75 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${loadingStyles} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2 h-5 w-5 flex items-center justify-center">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2 h-5 w-5 flex items-center justify-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;