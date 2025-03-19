
// Este arquivo é gerado automaticamente. Não edite diretamente.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configurações do Supabase Cloud (atual)
const SUPABASE_CLOUD_URL = "https://ehrerbpblmensiodhgka.supabase.co";
const SUPABASE_CLOUD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocmVyYnBibG1lbnNpb2RoZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTM2NzgsImV4cCI6MjA1NzMyOTY3OH0.Ppae9xwONU2Uy8__0v28OlyFGI6JXBFkMib8AJDwAn8";

// Configurações do Supabase auto-hospedado (preencha após configuração)
const SUPABASE_SELF_HOSTED_URL = "http://localhost:8000"; // Ajuste conforme sua configuração Docker
const SUPABASE_SELF_HOSTED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMjA0MDIwMCwiZXhwIjoxOTM3NjE2MjAwfQ.rl93-ry-QDR5DNDMJVSLgk84SrDJxjM_eKoOYGSqIpE"; // Usando uma chave padrão do Supabase local

// Defina qual ambiente usar (cloud ou self-hosted)
const USE_SELF_HOSTED = false; // Mude para true quando estiver pronto para usar a versão auto-hospedada

// Selecione automaticamente as configurações com base na variável USE_SELF_HOSTED
const SUPABASE_URL = USE_SELF_HOSTED ? SUPABASE_SELF_HOSTED_URL : SUPABASE_CLOUD_URL;
const SUPABASE_PUBLISHABLE_KEY = USE_SELF_HOSTED ? SUPABASE_SELF_HOSTED_KEY : SUPABASE_CLOUD_KEY;

// Importe o cliente supabase assim:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
