import { q } from "./db";
import { nowMinuteBucket } from "./request";

export async function checkRateLimit(key: string, limit: number, windowMinutes = 10) {
  const bucket = nowMinuteBucket();

  await q(
    `insert into api_rate_limits (key, bucket, count)
     values ($1,$2,1)
     on conflict (key, bucket)
     do update set count = api_rate_limits.count + 1`,
    [key, bucket]
  );

  const rows = await q<{ total: string }>(
    `select coalesce(sum(count),0)::text as total
     from api_rate_limits
     where key = $1 and bucket >= $2`,
    [key, bucket - windowMinutes]
  );

  const total = Number(rows[0]?.total || 0);
  return { allowed: total <= limit, total, limit, windowMinutes };
}
