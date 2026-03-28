import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 * Use ONLY in server-side code (API routes, webhooks).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Singleton accessor used by awards modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serviceClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServiceClient(): any {
  if (!_serviceClient) {
    _serviceClient = createServiceClient();
  }
  return _serviceClient;
}
