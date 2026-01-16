export interface A4PageProps {
  children?: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  footer?: React.ReactNode;
}

export const A4Page: React.FC<A4PageProps> = ({
  children,
  className = '',
  title,
  footer,
}) => {
  return (
    <div className={`w-[210mm] h-[297mm] break-after-page break-inside-avoid bg-white flex flex-col ${className}`}>
      {title && <div className="flex-shrink-0 pt-8 pb-4 text-center text-[32px] font-bold">{title}</div>}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      {footer && <div className="flex-shrink-0 pb-8 text-xs opacity-60">{footer}</div>}
    </div>
  );
};