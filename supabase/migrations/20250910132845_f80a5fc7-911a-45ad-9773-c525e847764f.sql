-- Create storage bucket for orcamentos PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('orcamentos', 'orcamentos', true);

-- Create RLS policies for orcamentos bucket
CREATE POLICY "Users can view their own orcamento PDFs" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'orcamentos' AND 
  EXISTS (
    SELECT 1 FROM orcamentos 
    WHERE orcamentos.id::text = (string_to_array(storage.objects.name, '_'))[2]
    AND orcamentos.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can upload their own orcamento PDFs" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'orcamentos' AND 
  EXISTS (
    SELECT 1 FROM orcamentos 
    WHERE orcamentos.id::text = (string_to_array(storage.objects.name, '_'))[2]
    AND orcamentos.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own orcamento PDFs" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'orcamentos' AND 
  EXISTS (
    SELECT 1 FROM orcamentos 
    WHERE orcamentos.id::text = (string_to_array(storage.objects.name, '_'))[2]
    AND orcamentos.usuario_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own orcamento PDFs" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'orcamentos' AND 
  EXISTS (
    SELECT 1 FROM orcamentos 
    WHERE orcamentos.id::text = (string_to_array(storage.objects.name, '_'))[2]
    AND orcamentos.usuario_id = auth.uid()
  )
);