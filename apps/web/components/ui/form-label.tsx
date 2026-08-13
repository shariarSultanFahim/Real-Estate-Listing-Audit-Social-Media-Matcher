"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
    </label>
  )
)
FormLabel.displayName = "FormLabel"

export { FormLabel }
