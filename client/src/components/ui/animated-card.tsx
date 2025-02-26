import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ComponentProps } from "react";

const MotionCard = motion(Card);

export function AnimatedCard({ children, ...props }: ComponentProps<typeof Card>) {
  return (
    <MotionCard
      {...props}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 },
        boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </MotionCard>
  );
}
