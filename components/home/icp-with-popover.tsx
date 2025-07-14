import { PersonIcon } from "../icons/person";
import { ICP as ICPType } from "./paste-icp";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/components/ui/popover"
import {titleCase} from "title-case"

export function ICPWithPopover({ icp }: { icp: ICPType }) {
    console.log("icp", icp)
    const { metadata, distance, document } = icp
    const { age, sex, occupation, marital_status, education_level, bachelors_field, city, state, zipcode } = metadata
    const personaJSON = parseDocumentString(document)
    return (
        <Popover>
            <PopoverTrigger><PersonIcon size={24} /></PopoverTrigger>
            <PopoverContent side="top">
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{titleCase(occupation)}</h4>
                    <p className="text-sm">
                        {personaJSON["professionalRole"]}
                    </p>
                    <div className="text-muted-foreground text-xs">
                        {age}YO, {city}, {state}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function parseDocumentString(document: string) {
    const parsed: { [key: string]: string } = {};

    // Split by lines and process each one
    const lines = document.split('\n').map(line => line.trim()).filter(line => line);

    lines.forEach(line => {
        // Look for lines that start with a field name followed by a colon
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();

            // Convert key to camelCase for consistency
            const camelKey = key.replace(/\s+(.)/g, (match, letter) => letter.toUpperCase());
            const finalKey = camelKey.charAt(0).toLowerCase() + camelKey.slice(1);

            parsed[finalKey] = value;
        }
    });

    return parsed;
}