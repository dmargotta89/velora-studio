import type { MappingMode } from "../types";
import { mappingModeCopy } from "../lib/mapping";

export function MappingBadge({ mode }: { mode: MappingMode }) {
  const copy = mappingModeCopy(mode);
  return (
    <div className={`mapping-badge mode-${mode}`}>
      <span>{copy.tag}</span>
      {copy.line}
    </div>
  );
}
