import mapping from "../config/field-mapping-template.json";

type GenericRecord = Record<string, unknown>;

function getPath(obj: GenericRecord, path: string) {
  return path.split(".").reduce((acc: any, part) => (acc ? acc[part] : undefined), obj);
}

export function buildMappedPayload(source: GenericRecord) {
  const out: Record<string, unknown> = {};
  for (const item of (mapping as any).mappings as Array<any>) {
    const v = getPath(source, item.sourceField);
    if (v === undefined || v === null || v === "") continue;
    out[item.targetField] = v;
  }
  return out;
}
