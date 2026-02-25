interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`text-sm text-destructive font-medium ${className ?? ""}`}
    >
      {message}
    </div>
  );
}
