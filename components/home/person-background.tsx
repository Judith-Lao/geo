import { PersonIcon } from "../icons/person";
import { ICP } from "./paste-icp";

export function PersonBackground({ matchingICPs }: { matchingICPs: ICP[] }) {
    return (
        <div className="absolute inset-0 flex flex-wrap -m-1 overflow-hidden">
            {[...Array(30)].map((_, i) =>
                [...Array(30)].map((_, j) => (
                    <PersonIcon key={`${i}-${j}`} className="m-1 opacity-10" size={24} />
                ))
            )}
        </div>
    )
}