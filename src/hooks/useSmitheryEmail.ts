
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EmailData {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const useSmitheryEmail = () => {
  const [isSending, setIsSending] = useState(false);
  
  /**
   * Envia um email através da edge function do Smithery
   */
  const sendEmail = async (emailData: EmailData) => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('smithery-email', {
        body: emailData
      });
      
      if (error) {
        throw new Error(`Erro na função edge: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido ao enviar email');
      }
      
      toast.success('Email enviado com sucesso!');
      return data.result;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error(`Falha ao enviar email: ${error.message}`);
      throw error;
    } finally {
      setIsSending(false);
    }
  };
  
  return {
    sendEmail,
    isSending
  };
};
