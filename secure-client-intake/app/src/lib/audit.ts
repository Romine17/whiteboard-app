import { q } from "./db";

export async function writeAudit(event: {
  actorType: "client" | "staff" | "system";
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}) {
  await q(
    `insert into audit_events (actor_type, actor_id, action, resource_type, resource_id, ip, metadata_json)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [
      event.actorType,
      event.actorId,
      event.action,
      event.resourceType,
      event.resourceId,
      event.ip || null,
      JSON.stringify(event.metadata || {}),
    ]
  );
}
