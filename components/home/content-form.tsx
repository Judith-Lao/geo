"use client"

import { useState } from "react"
import { BreadcrumbWithCustomSeparator } from "@/components/home/custom-breadcrumbs";
import { PasteContent } from "./paste-content";
import { PasteICP } from "./paste-icp"

export function ContentForm() {
  const [marketingContent, setMarketingContent] = useState<string>("");
  const [icp, setICP] = useState<string>("");
  // TODO: rn it can go anywhere, implement: can only step backwards if step is completed, needs a [marketingContent, setMarketingContent]
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <>
      <BreadcrumbWithCustomSeparator step={currentStep} setCurrentStep={setCurrentStep} />
      {
        currentStep === 0 && <PasteContent marketingContent={marketingContent} setMarketingContent={setMarketingContent}/>
      }
      {
        currentStep === 1 && <PasteICP/>
      }
      {
        currentStep === 2 && <></>
      }
    </>
  )
}