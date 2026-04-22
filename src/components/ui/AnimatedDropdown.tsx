import * as React from 'react';
import { useState, useRef, FC, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "outline" ? "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900" :
      variant === "ghost" ? "hover:bg-gray-100 hover:text-gray-900" :
      variant === "link" ? "text-blue-600 underline-offset-4 hover:underline" :
      "bg-blue-600 text-white hover:bg-blue-700",
      size === "sm" ? "h-9 px-3" : size === "lg" ? "h-11 px-8" : size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
      className
    )} {...props} />
  )
);
Button.displayName = "Button";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

export interface DropdownItem {
  name: string;
  link?: string;
  onClick?: () => void;
  icon?: ReactNode;
  destructive?: boolean;
}

export interface AnimatedDropdownProps {
  items: DropdownItem[];
  text?: string;
  className?: string;
  triggerClassName?: string;
  trigger?: ReactNode;
  align?: 'left' | 'right' | 'center';
}

export default function AnimatedDropdown({
  items,
  text = 'Select Option',
  className,
  triggerClassName,
  trigger,
  align = 'center',
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAlignmentClass = () => {
    if (align === 'left') return 'left-0';
    if (align === 'right') return 'right-0 left-auto';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <OnClickOutside onClickOutside={() => setIsOpen(false)}>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('group relative inline-block', className)}
      >
        {trigger ? (
           <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
             {trigger}
           </div>
        ) : (
          <Button
            variant='default'
            aria-haspopup='listbox'
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={cn("gap-2 min-h-[44px] rounded-xl", triggerClassName)}
          >
            <span>{text}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <ChevronDown className='h-5 w-5' />
            </motion.div>
          </Button>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role='listbox'
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute top-[calc(100%+0.5rem)] z-50 w-fit min-w-[200px] max-w-[calc(100vw-1rem)]',
                getAlignmentClass(),
                'overflow-hidden rounded-xl',
                'bg-white',
                'border border-gray-100',
                'shadow-xl shadow-black/5'
              )}
            >
              <motion.div
                initial='hidden'
                animate='visible'
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.03,
                    },
                  },
                }}
                className="flex flex-col p-1"
              >
                {items.map((item, index) => {
                  const itemClasses = cn(
                    'flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium rounded-lg text-left',
                    'hover:bg-gray-50 focus:bg-gray-50 outline-none',
                    'transition-colors duration-150',
                    item.destructive ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-gray-700 hover:text-gray-900'
                  );

                  const ItemContent = (
                    <>
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      {item.name}
                    </>
                  );

                  const variants = {
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  };

                  if (item.link) {
                    return (
                      <motion.div key={index} variants={variants}>
                        <Link 
                          to={item.link} 
                          className={itemClasses}
                          onClick={() => setIsOpen(false)}
                        >
                          {ItemContent}
                        </Link>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.button
                      key={index}
                      variants={variants}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className={itemClasses}
                    >
                      {ItemContent}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnClickOutside>
  );
}

interface Props {
  children: ReactNode;
  onClickOutside: () => void;
  classes?: string;
}

const OnClickOutside: FC<Props> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, onClickOutside);

  return (
    <div ref={wrapperRef} className={cn(classes)}>
      {children}
    </div>
  );
};
