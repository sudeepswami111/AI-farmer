import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
        secondary:
          "border border-primary bg-transparent text-primary hover:bg-primary/5",
        accent:
          "bg-accent text-accent-foreground shadow-soft hover:bg-accent/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost:
          "text-foreground hover:bg-muted",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
        hero:
          "bg-primary text-primary-foreground shadow-medium hover:shadow-strong hover:bg-primary/95",
        "hero-secondary":
          "border-2 border-primary/20 bg-surface/80 backdrop-blur-sm text-primary hover:bg-primary/5 hover:border-primary/40",
      },
      size: {
        default: "h-12 px-6 text-base rounded-md",
        sm: "h-10 px-4 text-sm rounded-md",
        lg: "h-14 px-8 text-base rounded-md",
        icon: "h-12 w-12 rounded-md",
        "icon-sm": "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
