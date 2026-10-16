import type { ReactNode } from 'react';
/** Wire this to the server-confirmed session when IAM is implemented. */
export function RouteGuard({ allowed, children }: { allowed: boolean; children: ReactNode }) { return allowed ? <>{children}</> : <p>Bạn chưa có quyền truy cập.</p>; }
