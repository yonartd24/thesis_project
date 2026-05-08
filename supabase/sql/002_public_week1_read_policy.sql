begin;

create policy "public_can_read_week_1_card_entries"
on public.card_entries
for select
to anon, authenticated
using (week_number = 1);

commit;