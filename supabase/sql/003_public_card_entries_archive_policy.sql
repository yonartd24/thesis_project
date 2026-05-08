begin;

create policy "public_can_read_card_entries_archive"
on public.card_entries
for select
to anon, authenticated
using (week_number in (1, 2, 3));

commit;