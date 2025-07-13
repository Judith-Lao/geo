import Link from "next/link"
import { SlashIcon } from "@/components/icons/slash"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/components/ui/breadcrumb"

export function BreadcrumbWithCustomSeparator({step, setCurrentStep}: {step: number, setCurrentStep: (step: number) => void}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {step === 0 ? (
          <BreadcrumbPage>
            Paste Marketing Content
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem onClick={() => setCurrentStep(0)} className="cursor-pointer">
            Paste Marketing Content
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        {step === 1 ? (
          <BreadcrumbPage>
            Enter Your ICP
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem onClick={() => setCurrentStep(1)} className="cursor-pointer">
            Enter Your ICP
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>
        {step === 2 ? (
          <BreadcrumbPage>
            Hyper-target Your ICP
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem onClick={() => setCurrentStep(2)} className="cursor-pointer">
            Hyper-target Your ICP
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
