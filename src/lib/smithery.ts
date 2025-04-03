
import { createTransport } from "@modelcontextprotocol/sdk/transport";
import { Client } from "@modelcontextprotocol/sdk/client/index";

/**
 * Configura e retorna um cliente Smithery para envio de emails
 * @param resendApiToken Token da API Resend (opcional, pode ser carregado das variáveis de ambiente)
 * @param smitheryApiKey Chave da API Smithery
 */
export const setupSmitheryClient = async (
  resendApiToken: string = "", 
  smitheryApiKey: string
) => {
  try {
    // Criar o transporte para o servidor Smithery
    const transport = createTransport(
      "https://server.smithery.ai/@ykhli/mcp-send-emails", 
      {
        "resendApiToken": resendApiToken
      }, 
      smitheryApiKey
    );

    // Inicializar o cliente MCP
    const client = new Client({
      name: "IPT Teixeira",
      version: "1.0.0"
    });

    // Conectar ao transporte
    await client.connect(transport);
    
    // Listar ferramentas disponíveis
    const tools = await client.listTools();
    console.log(`Ferramentas disponíveis: ${tools.map(t => t.name).join(", ")}`);
    
    return { client, tools };
  } catch (error) {
    console.error("Erro ao configurar cliente Smithery:", error);
    throw error;
  }
};

/**
 * Envia um email usando o cliente Smithery
 * @param client Cliente MCP configurado
 * @param emailData Dados do email a ser enviado
 */
export const sendEmail = async (
  client: Client,
  emailData: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }
) => {
  try {
    const result = await client.callTool("sendEmail", emailData);
    console.log("Email enviado com sucesso:", result);
    return result;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
};
