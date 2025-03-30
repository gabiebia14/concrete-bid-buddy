
// Tipos para o cliente
export interface ClienteFormData {
  tipoPessoa: 'fisica' | 'juridica';
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  representanteNome?: string;
  representanteCpf?: string;
}
