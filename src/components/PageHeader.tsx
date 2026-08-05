import type { ReactNode } from "react";
import Link from "next/link";
import { IconChevronLeft } from "@/components/icons";

interface PageHeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, backHref, backLabel, action }: PageHeaderProps) {
  const showTopRow = Boolean(backHref) || Boolean(action);
  return (
    <header className="page-header">
      {showTopRow && (
        <div className="flex items-center justify-between">
          {backHref ? (
            <Link href={backHref} className="page-header-back">
              <IconChevronLeft className="h-3.5 w-2" />
              {backLabel}
            </Link>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {title && <h1 className="large-title">{title}</h1>}
    </header>
  );
}
