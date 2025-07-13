import Link from "next/link"
import { SlashIcon } from "@/components/icons/slash"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator({
  step,
  setCurrentStep,
  completedSteps
}: {
  step: number;
  setCurrentStep: (step: number) => void;
  completedSteps: Set<number>;
}) {
  // design decision: rn step 0 and 1 are independent, step 2 depends on both step 0 and 1 being completed. 
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {step === 0 ? (
          <BreadcrumbPage>
            Paste Marketing Content
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem 
            onClick={() => {
              // Can only go back to step 0 if we're not on step 0 and step 0 is completed
              // if (step > 0 && completedSteps.has(0)) {
              //   setCurrentStep(0);
              // }
              setCurrentStep(0);
            }} 
            className="cursor-pointer"
          >
            Paste Marketing Content
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator>
          +
        </BreadcrumbSeparator>
        {step === 1 ? (
          <BreadcrumbPage>
            Enter Your ICP
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem 
            onClick={() => {
              // Can only go back to step 1 if we're not on step 1 and step 1 is completed
              // if (step > 1 && completedSteps.has(1)) {
              //   setCurrentStep(1);
              // }
              // Can only go forward to step 1 if step 0 is completed -- commented out so you can go to step 0 or 1 independently, like an a + b = c equation, a and b should be independent
              // if (step === 0 && completedSteps.has(0)) {
              //   setCurrentStep(1);
              // }
              setCurrentStep(1);
            }} 
            className="cursor-pointer"
          >
            Enter Your ICP
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator>
          =
        </BreadcrumbSeparator>
        {step === 2 ? (
          <BreadcrumbPage>
            Hyper-target Your ICP
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem 
            onClick={() => {
              // Can only go back to step 2 if we're not on step 2 and step 2 is completed
              if (step > 2 && completedSteps.has(2)) {
                setCurrentStep(2);
              }
              // Can only go forward to step 2 if step 1 is completed
              if (step === 1 && completedSteps.has(1)) {
                setCurrentStep(2);
              }
            }} 
            className="cursor-pointer"
          >
            Hyper-target Your ICP
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
