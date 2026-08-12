GRANT SELECT, UPDATE ON public.invoice_counter TO anon, authenticated;
GRANT ALL ON public.invoice_counter TO service_role;

DROP POLICY IF EXISTS "Anyone can update the invoice counter" ON public.invoice_counter;
CREATE POLICY "Anyone can update the invoice counter"
ON public.invoice_counter FOR UPDATE
TO anon, authenticated
USING (id = 1)
WITH CHECK (id = 1);

CREATE OR REPLACE FUNCTION public.peek_invoice_number()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT last_number + 1 FROM public.invoice_counter WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION public.reserve_invoice_number()
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  next_num integer;
BEGIN
  UPDATE public.invoice_counter
  SET last_number = last_number + 1, updated_at = now()
  WHERE id = 1
  RETURNING last_number INTO next_num;
  RETURN next_num;
END;
$$;