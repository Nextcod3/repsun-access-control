-- Fix security vulnerability: Restrict product access to authenticated users only
-- Change from public access (true) to authenticated users only (auth.uid() IS NOT NULL)

DROP POLICY "Todos usuários podem ver produtos" ON public.produtos;

CREATE POLICY "Apenas usuários autenticados podem ver produtos" 
ON public.produtos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);