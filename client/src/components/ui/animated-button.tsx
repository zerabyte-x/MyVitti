import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ComponentProps, forwardRef } from "react";

const MotionButton = motion(
  forwardRef<HTMLButtonElement, ComponentProps<typeof Button>>((props, ref) => (
    <Button ref={ref} {...props} />
  ))
);

export function AnimatedButton({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <MotionButton
      {...props}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </MotionButton>
  );
}