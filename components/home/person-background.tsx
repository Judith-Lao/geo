import { useEffect, useRef, useState } from "react";
import { ICP } from "./paste-icp";
import gsap from "gsap";
import { ICPWithPopover } from "./icp-with-popover";
import { PersonIcon } from "../icons/person";

export function PersonBackground({ matchingICPs }: { matchingICPs: ICP[] }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const iconsRef = useRef<(HTMLDivElement | null)[]>([])
    const selectedIconsRef = useRef<Set<number>>(new Set())
    const animationRef = useRef<GSAPTimeline | null>(null)
    const [iconToICPMap, setIconToICPMap] = useState<Map<number, ICP>>(new Map())

    const totalIcons = 900
    const iconsToSelect = Math.min(10, matchingICPs.length)

    useEffect(() => {
        if (!containerRef.current || matchingICPs.length === 0) return

        // Kill any existing animations
        if (animationRef.current) {
            animationRef.current.kill()
        }
        
        // Clear the map
        setIconToICPMap(new Map())

        // Reset previously selected icons
        selectedIconsRef.current.forEach(index => {
            const icon = iconsRef.current[index]
            if (icon) {
                gsap.set(icon, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 0.1,
                    zIndex: 1,
                    rotation: 0
                })
            }
        })
        selectedIconsRef.current.clear()

        // Select random icons with better distribution
        const selectedIndices = getRandomDistributedIndices(totalIcons, iconsToSelect)
        selectedIconsRef.current = new Set(selectedIndices)

        console.log("BEFORE", iconToICPMap)
        // Map selected icons to specific ICPs
        const newMap = new Map<number, ICP>()
        selectedIndices.forEach((iconIndex, i) => {
            const icpIndex = i % matchingICPs.length
            newMap.set(iconIndex, matchingICPs[icpIndex])
        })
        setIconToICPMap(newMap)
        console.log("AFTER", iconToICPMap)

        // Create master timeline
        const masterTL = gsap.timeline()
        animationRef.current = masterTL

        // Add ripple effect before selection
        masterTL.to(iconsRef.current.filter(Boolean), {
            duration: 0.1,
            scale: 1.05,
            opacity: 0.2,
            ease: "power2.out",
            stagger: {
                amount: 0.3,
                from: "random"
            }
        })
            .to(iconsRef.current.filter(Boolean), {
                duration: 0.2,
                scale: 1,
                opacity: 0.1,
                ease: "power2.out"
            }, "-=0.2")

        // Animate selected icons
        selectedIndices.forEach((iconIndex, animationIndex) => {
            const icon = iconsRef.current[iconIndex]
            if (!icon || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()

            // Calculate target position (top-right grid)
            const targetX = containerRect.width - 40 - (animationIndex % 5) * 35  // 5 per row
            const targetY = 20 + Math.floor(animationIndex / 5) * 35

            // Get current position
            const iconRect = icon.getBoundingClientRect()
            const deltaX = targetX - (iconRect.left - containerRect.left)
            const deltaY = targetY - (iconRect.top - containerRect.top)

            // Add to timeline
            masterTL.set(icon, { zIndex: 100 }, 0.5 + animationIndex * 0.05)
                .to(icon, {
                    duration: 0.2,
                    scale: 1.3,
                    opacity: 0.9,
                    rotation: 5,
                    ease: "back.out(1.7)"
                }, 0.5 + animationIndex * 0.05)
                .to(icon, {
                    duration: 1,
                    x: deltaX,
                    y: deltaY,
                    scale: 1.1,
                    opacity: 1,
                    rotation: 0,
                    ease: "power2.inOut"
                }, 0.6 + animationIndex * 0.05)
                .to(icon, {
                    duration: 0.3,
                    scale: 1.2,
                    ease: "elastic.out(1, 0.5)"
                })
                .to(icon, {
                    duration: 0.2,
                    scale: 1.1,
                    ease: "power2.out"
                })
        })

        return () => {
            if (animationRef.current) {
                animationRef.current.kill()
            }
        }
    }, [matchingICPs])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex flex-wrap -m-1 overflow-hidden"
        >
            {[...Array(30)].map((_, i) =>
                [...Array(30)].map((_, j) => {
                    const iconIndex = i * 30 + j
                    const isSelected = selectedIconsRef.current.has(iconIndex)

                    return (
                        <div
                            key={`${i}-${j}`}
                            ref={(el) => {
                                iconsRef.current[iconIndex] = el
                            }}
                            className={`m-1 relative transition-colors duration-300 ${isSelected ? 'text-blue-500 cursor-pointer' : 'text-gray-400'
                                }`}
                            style={{
                                width: 24,
                                height: 24,
                                transformOrigin: 'center center',
                                opacity: 0.1
                            }}
                        >
                            {isSelected ? <ICPWithPopover icp={iconToICPMap.get(iconIndex)!} /> : <PersonIcon size={24} />}
                        </div>
                    )
                })
            )}
        </div >
    )
}


// Helper function to get randomly distributed indices
function getRandomDistributedIndices(total: number, count: number): number[] {
    const indices: number[] = []
    const gridSize = Math.sqrt(total) // 30 for a 30x30 grid
    const sections = Math.ceil(Math.sqrt(count))
    const sectionSize = Math.floor(gridSize / sections)

    for (let i = 0; i < count; i++) {
        const sectionX = (i % sections) * sectionSize
        const sectionY = Math.floor(i / sections) * sectionSize

        const randomX = sectionX + Math.floor(Math.random() * sectionSize)
        const randomY = sectionY + Math.floor(Math.random() * sectionSize)

        const index = Math.min(randomY * gridSize + randomX, total - 1)
        indices.push(index)
    }

    return indices
}