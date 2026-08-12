CREATE TABLE public.invoice_counter (
  id integer PRIMARY KEY DEFAULT 1,
  last_number integer NOT NULL DEFAULT 1000,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_counter_single_row CHECK (id = 1)
);

GRANT SELECT ON public.invoice_counter TO anon, authenticated;
GRANT ALL ON public.invoice_counter TO service_role;

ALTER TABLE public.invoice_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view the invoice counter"
ON public.invoice_counter FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.invoice_counter (id, last_number) VALUES (1, 1000);

CREATE OR REPLACE FUNCTION public.peek_invoice_number()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT last_number + 1 FROM public.invoice_counter WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION public.reserve_invoice_number()
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
BEGIN
  UPDATE public.invoice_counter
  SET last_number = last_number + 1, updated_at = now()
  WHERE id = 1
  RETURNING last_number INTO next_number;
  RETURN next_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.peek_invoice_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_invoice_number() TO anon, authenticated;