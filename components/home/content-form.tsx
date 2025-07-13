"use client"

import { useEffect, useState } from "react"
import { BreadcrumbWithCustomSeparator } from "@/components/home/custom-breadcrumbs";
import { PasteContent } from "./paste-content";
import { PasteICP } from "./paste-icp"

export function ContentForm() {
  const [marketingContent, setMarketingContent] = useState<string>("");
  const [icp, setICP] = useState<string>("");

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set<number>());

  useEffect(() => {
    if (marketingContent) {
      setCompletedSteps(completedSteps.add(0));
    }
    if (icp) {
      setCompletedSteps(completedSteps.add(1));
    }
  }, [marketingContent, icp])

  return (
    <>
      <BreadcrumbWithCustomSeparator step={currentStep} setCurrentStep={setCurrentStep} completedSteps={completedSteps} />
      {
        currentStep === 0 && <PasteContent marketingContent={marketingContent} setMarketingContent={setMarketingContent}/>
      }
      {
        currentStep === 1 && <PasteICP icp={icp} setICP={setICP}/>
      }
      {
        currentStep === 2 && <>Tailor Content</>
      }
    </>
  )
}