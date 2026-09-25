import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  shimmerColor?: string;
  background?: string;
}

/** Primary CTA with a light that sweeps around its edge. */
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, children, asChild, shimmerColor = '#ffffff', background = 'hsl(245 80% 58%)', style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const vars = {
      '--spread': '90deg',
      '--shimmer-color': shimmerColor,
      '--radius': '9999px',
      '--speed': '3s',
      '--cut': '0.07em',
      '--bg': background,
      ...style,
    } as CSSProperties;

    return (
      <Comp
        ref={ref}
        style={vars}
        className={cn(
          'group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap',
          'rounded-[var(--radius)] border border-white/10 px-6 py-3 text-sm font-medium text-white [background:var(--bg)]',
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-60',
          className
        )}
        {...props}
      >
        <Slottable>{children}</Slottable>
        <span aria-hidden className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
          <span className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <span className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </span>
        </span>
        <span
          aria-hidden
          className="absolute inset-0 rounded-[var(--radius)] shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]"
        />
        <span aria-hidden className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
      </Comp>
    );
  }
);
ShimmerButton.displayName = 'ShimmerButton';
