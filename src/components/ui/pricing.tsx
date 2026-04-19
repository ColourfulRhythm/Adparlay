import { motion, useSpring } from 'framer-motion';
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import confetti from 'canvas-confetti';
import { Check, Star as LucideStar } from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-gray-200',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600',
        ghost: 'text-white hover:bg-white/10',
        link: 'text-white underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

function Star({
  mousePosition,
  containerRef
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [initialPos] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`
  });

  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  useEffect(() => {
    if (!containerRef.current || mousePosition.x === null || mousePosition.y === null) {
      springX.set(0);
      springY.set(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const starX = containerRect.left + (parseFloat(initialPos.left) / 100) * containerRect.width;
    const starY = containerRect.top + (parseFloat(initialPos.top) / 100) * containerRect.height;

    const deltaX = mousePosition.x - starX;
    const deltaY = mousePosition.y - starY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const radius = 600;

    if (distance < radius) {
      const force = 1 - distance / radius;
      springX.set(deltaX * force * 0.5);
      springY.set(deltaY * force * 0.5);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initialPos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute bg-white/70 rounded-full"
      style={{
        top: initialPos.top,
        left: initialPos.left,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        x: springX,
        y: springY
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 5
      }}
    />
  );
}

function InteractiveStarfield({
  mousePosition,
  containerRef
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {Array.from({ length: 90 }).map((_, i) => (
        <Star key={`star-${i}`} mousePosition={mousePosition} containerRef={containerRef} />
      ))}
    </div>
  );
}

export interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  currency?: string;
  isPopular?: boolean;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

const PricingContext = createContext<{
  isMonthly: boolean;
  setIsMonthly: (value: boolean) => void;
}>({
  isMonthly: true,
  setIsMonthly: () => {}
});

export function PricingSection({
  plans,
  title = 'Simple, Transparent Pricing',
  description = "Choose the plan that's right for you. All plans include our core features and support."
}: PricingSectionProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <PricingContext.Provider value={{ isMonthly, setIsMonthly }}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className="relative w-full py-16 sm:py-20 rounded-[2.2rem] border border-white/15 bg-black/45 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]"
      >
        <InteractiveStarfield mousePosition={mousePosition} containerRef={containerRef} />
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">{title}</h2>
            <p className="text-white/70 text-lg md:text-xl whitespace-pre-line">{description}</p>
          </div>
          <PricingToggle />
          <div className={cn('mt-12 grid grid-cols-1 items-start gap-8', plans.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PricingContext.Provider>
  );
}

function PricingToggle() {
  const { isMonthly, setIsMonthly } = useContext(PricingContext);
  const confettiRef = useRef<HTMLDivElement>(null);
  const monthlyBtnRef = useRef<HTMLButtonElement>(null);
  const annualBtnRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({});

  useEffect(() => {
    const btnRef = isMonthly ? monthlyBtnRef : annualBtnRef;
    if (btnRef.current) {
      setPillStyle({
        width: btnRef.current.offsetWidth,
        transform: `translateX(${btnRef.current.offsetLeft}px)`
      });
    }
  }, [isMonthly]);

  const handleToggle = (monthly: boolean) => {
    if (isMonthly === monthly) return;
    setIsMonthly(monthly);

    if (!monthly && confettiRef.current && annualBtnRef.current) {
      const rect = annualBtnRef.current.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: originX, y: originY },
        colors: ['#ffffff', '#cbd5e1', '#64748b'],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div ref={confettiRef} className="relative flex w-fit items-center rounded-full bg-black/40 p-1.5 border border-white/15 backdrop-blur-md">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-white text-black p-1.5"
          style={pillStyle}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
        <button
          ref={monthlyBtnRef}
          onClick={() => handleToggle(true)}
          className={cn(
            'relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-semibold transition-colors',
            isMonthly ? 'text-black' : 'text-white/70 hover:text-white'
          )}
        >
          Monthly
        </button>
        <button
          ref={annualBtnRef}
          onClick={() => handleToggle(false)}
          className={cn(
            'relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-semibold transition-colors',
            !isMonthly ? 'text-black' : 'text-white/70 hover:text-white'
          )}
        >
          Annual
          <span className={cn('hidden sm:inline', !isMonthly ? 'text-black/80' : '')}> (Save 20%)</span>
        </button>
      </div>
    </div>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMonthly } = useContext(PricingContext);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: plan.isPopular && isDesktop ? -20 : 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: index * 0.15
      }}
      className={cn(
        'rounded-3xl p-8 flex flex-col relative backdrop-blur-sm',
        plan.isPopular
          ? 'border-2 border-white bg-white text-black shadow-2xl'
          : 'border border-white/15 bg-black/55 text-white shadow-[0_18px_35px_-24px_rgba(0,0,0,0.9)]'
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="bg-black py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-md">
            <LucideStar className="text-white h-4 w-4 fill-current" />
            <span className="text-white text-sm font-semibold">Most Popular</span>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col text-center">
        <h3 className={cn('text-2xl font-black tracking-tight', plan.isPopular ? 'text-black' : 'text-white')}>{plan.name}</h3>
        <p className={cn('mt-2 text-sm', plan.isPopular ? 'text-black/70' : 'text-white/70')}>{plan.description}</p>
        <div className="mt-6 flex items-baseline justify-center gap-x-1">
          <span className={cn('text-5xl font-bold tracking-tight', plan.isPopular ? 'text-black' : 'text-white')}>
            <NumberFlow
              value={isMonthly ? plan.price : plan.yearlyPrice}
              format={{
                style: 'currency',
                currency: plan.currency || 'USD',
                minimumFractionDigits: 0
              }}
            />
          </span>
          <span className={cn('text-sm font-semibold leading-6 tracking-wide', plan.isPopular ? 'text-black/70' : 'text-white/60')}>
            / {plan.period}
          </span>
        </div>
        <p className={cn('text-xs mt-2', plan.isPopular ? 'text-black/60' : 'text-white/60')}>
          {isMonthly ? 'Billed Monthly' : 'Billed Annually'}
        </p>

        <ul className={cn('mt-8 space-y-3 text-sm leading-6 text-left', plan.isPopular ? 'text-black/80' : 'text-white/75')}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <Check className={cn('h-6 w-5 flex-none', plan.isPopular ? 'text-black' : 'text-white')} aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Button asChild variant={plan.isPopular ? 'default' : 'outline'} size="lg" className="w-full">
            <a href={plan.href}>{plan.buttonText}</a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

