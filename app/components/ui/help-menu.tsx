import { useState } from 'react';
import { HelpCircle, Keyboard, FileText, Shield, Book, ChevronRight } from 'lucide-react';
import { Modal } from './modal';
import { KeyboardShortcuts } from './keyboard-shortcuts';

interface HelpItem {
  id: string;
  icon: JSX.Element;
  label: string;
  content: JSX.Element;
}

export function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const helpItems: HelpItem[] = [
    {
      id: 'shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
      label: 'Keyboard Shortcuts',
      content: <KeyboardShortcuts />
    },
    {
      id: 'docs',
      icon: <Book className="w-4 h-4" />,
      label: 'Documentation',
      content: <div className="prose dark:prose-invert">Documentation content here...</div>
    },
    {
      id: 'terms',
      icon: <FileText className="w-4 h-4" />,
      label: 'Terms of Service',
      content: <div className="prose dark:prose-invert">Terms content here...</div>
    },
    {
      id: 'privacy',
      icon: <Shield className="w-4 h-4" />,
      label: 'Privacy Policy',
      content: <div className="prose dark:prose-invert">Privacy policy content here...</div>
    }
  ];

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-full bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-lg border border-neutral-200 dark:border-neutral-800"
          aria-label="Help and keyboard shortcuts"
          title="Help and keyboard shortcuts"
        >
          <HelpCircle className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
        </button>

        {isOpen && (
          <div className="absolute bottom-14 right-0 w-72 py-2 rounded-lg bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
            {helpItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModal(item.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span className="text-neutral-600 dark:text-neutral-400">{item.icon}</span>
                <span className="flex-1 text-sm text-left font-medium">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {helpItems.map((item) => (
        <Modal
          key={item.id}
          isOpen={activeModal === item.id}
          onClose={() => setActiveModal(null)}
          title={item.label}
        >
          {item.content}
        </Modal>
      ))}
    </>
  );
}
