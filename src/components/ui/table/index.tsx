import React, { ReactNode } from "react";

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
  onClick?: () => void; // Optional click handler (e.g., row navigation)
  role?: string; // Accessibility role if needed
  tabIndex?: number; // Enable keyboard focus
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  onClick?: () => void; // Optional click handler (e.g., row navigation)
  className?: string; // Optional className for styling
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead
      className={`border-b border-gray-100 dark:border-white/[0.05] ${className}`}
    >
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  onClick,
  role,
  tabIndex,
}) => {
  return (
    <tr
      className={`hover:bg-brand-gray/15 dark:hover:bg-brand-gray/10 ${className}`}
      onClick={onClick}
      role={role || (onClick ? "button" : undefined)}
      tabIndex={tabIndex !== undefined ? tabIndex : onClick ? 0 : undefined}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      style={{
        wordBreak: "break-word",
      }}
      className={`max-w-52 px-4 py-3 break-words text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
