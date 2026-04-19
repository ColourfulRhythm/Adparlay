import React, { memo, forwardRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../../utils';

// ==================== Label Component ====================
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

export const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-semibold leading-none text-[#b8b8b8] font-[\'Epilogue\'] peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
});

// ==================== Input Component ====================
export const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100; // hover effect radius
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          rgba(191, 128, 255, 0.4), 
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-xl p-[2px] transition duration-300 w-full"
      >
        <input
          type={type}
          className={cn(
            `flex w-full rounded-[10px] border border-white/10 bg-[#141414] px-4 py-3.5 text-base text-white font-[\'Epilogue\'] transition duration-400 placeholder:text-[#666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bf80ff] focus-visible:border-[#bf80ff] disabled:cursor-not-allowed disabled:opacity-50`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BottomGradient Component ====================
export const BottomGradient = () => {
  return (
    <>
      <span className="group-hover:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-[#bf80ff] to-transparent" />
      <span className="group-hover:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-[#a060ee] to-transparent" />
    </>
  );
};
