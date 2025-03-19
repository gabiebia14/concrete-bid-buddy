
# Guia de Migração do Supabase Cloud para Auto-hospedado

Este guia descreve os passos necessários para migrar sua aplicação do Supabase Cloud para uma instância auto-hospedada.

## 1. Backup dos Dados

Execute os seguintes comandos para fazer o backup dos seus dados do Supabase Cloud:

```bash
# Instalar ferramentas necessárias
npm install supabase

# Login na CLI do Supabase
npx supabase login

# Inicializar projeto local
npx supabase init

# Vincular ao projeto existente
npx supabase link --project-ref ehrerbpblmensiodhgka

# Exportar esquema e dados
npx supabase db dump --file ./schema_dump.sql
npx supabase db dump --data-only --file ./data_dump.sql
```

## 2. Importar para a Instância Auto-hospedada

Após configurar o Supabase via Docker:

```bash
# Copiar arquivo de dump para o contêiner
docker cp schema_dump.sql supabase-db:/dump.sql

# Acessar o contêiner
docker exec -it supabase-db /bin/bash

# Importar o dump
psql -U postgres -d postgres -f /dump.sql

# Repetir para o dump de dados se necessário
docker cp data_dump.sql supabase-db:/data_dump.sql
psql -U postgres -d postgres -f /data_dump.sql
```

## 3. Atualizar Configuração da Aplicação

Edite o arquivo `src/integrations/supabase/client.ts`:

1. Obtenha a URL e a chave anon da sua instância auto-hospedada
2. Atualize as constantes `SUPABASE_SELF_HOSTED_URL` e `SUPABASE_SELF_HOSTED_KEY`
3. Mude `USE_SELF_HOSTED` para `true`

## 4. Verificações Importantes

Após a migração, verifique:

- Políticas de Segurança RLS (Row Level Security)
- Autenticação (provedores de login)
- Buckets de Storage (se utilizados)
- Funções Edge (se utilizadas)
- Gatilhos e funções do banco de dados

## 5. Testes

Teste todas as funcionalidades da aplicação para garantir que tudo esteja funcionando:

- Login/autenticação
- Criação e visualização de orçamentos
- Gerenciamento de clientes
- Chat e assistente AI
- Upload e download de arquivos (se aplicável)
