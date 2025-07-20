/**
 * Configurações de ambiente da aplicação
 * Em produção, estas variáveis devem vir de variáveis de ambiente reais
 */

// Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://broetwrkuceepnqocpiw.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyb2V0d3JrdWNlZXBucW9jcGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2MTUsImV4cCI6MjA2ODMzNjYxNX0.jwgrsp3OizQLkWRVxicO2PSv8r5-RFmhJlKFJb5jBMM';

// API
export const API_URL = `${SUPABASE_URL}/rest/v1`;

// Storage
export const STORAGE_URL = `${SUPABASE_URL}/storage/v1`;
export const PUBLIC_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

// Configurações da aplicação
export const APP_NAME = 'RepSUN';
export const APP_VERSION = '1.0.0';

// Configurações de upload
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];