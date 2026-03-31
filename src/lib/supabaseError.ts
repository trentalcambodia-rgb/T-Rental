
export interface SupabaseErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  table: string | null;
  authInfo: {
    userId: string | undefined;
  };
}

export function handleSupabaseError(
  error: any, 
  operationType: SupabaseErrorInfo['operationType'], 
  table: string | null
) {
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined, // We can't access auth here easily without passing it in
    },
    operationType,
    table
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
