const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY'
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

export const getRequiredEnv = (name: RequiredEnvVar): string => {
  const value = process.env[name];

  if (!value || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

export const getOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value || value.length === 0) {
    return undefined;
  }

  return value;
};
