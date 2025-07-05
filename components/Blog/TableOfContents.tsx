
import React from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  active: boolean;
}

interface TableOfContentsProps {
  items: TocItem[];
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items, isMobile = false, onLinkClick }) => {
  if (items.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset for fixed navbar (h-20 = 80px) + some breathing room
      const navbarHeight = 96; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };
  
  const getItemClasses = (item: TocItem): string => {
    const baseClasses = 'block rounded-md transition-all duration-200 border-l-4';
    
    // Hierarchy styles
    let hierarchyClasses = 'text-sm py-1.5 px-3';
    if (item.level === 3) hierarchyClasses = 'text-sm py-1 px-3 ml-3';
    if (item.level >= 4) hierarchyClasses = 'text-xs py-1 px-3 ml-6';

    // Active/Inactive styles
    let stateClasses = '';
    if (item.active) {
      stateClasses = 'bg-brand-accent/10 dark:bg-brand-accent-dark/10 text-brand-accent dark:text-brand-accent-dark font-semibold border-brand-accent dark:border-brand-accent-dark';
    } else {
      stateClasses = 'text-brand-text-muted dark:text-brand-text-muted-dark border-transparent hover:bg-brand-bg dark:hover:bg-brand-surface hover:text-brand-text dark:hover:text-brand-text-dark';
    }

    return `${baseClasses} ${hierarchyClasses} ${stateClasses}`;
  };

  const renderItems = () => (
    <ul className="space-y-1">
      {items.map(item => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleLinkClick(e, item.id)}
            className={getItemClasses(item)}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (isMobile) {
    return (
      <nav>
        {renderItems()}
      </nav>
    );
  }

  return (
    <div className="sticky top-28">
      <div className="p-4 rounded-lg bg-brand-surface/50 dark:bg-brand-surface-dark/50 backdrop-blur-sm border border-brand-border dark:border-brand-border-dark">
        <h3 className="text-sm font-semibold uppercase text-brand-text dark:text-brand-text-dark tracking-wider mb-3 px-3">
          On this page
        </h3>
        <nav>
          {renderItems()}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
