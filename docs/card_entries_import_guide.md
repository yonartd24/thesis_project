# Card Entries Import Guide

This guide assumes you are using the Supabase dashboard directly and importing an already completed 3-week dataset.

## 1. Run the schema SQL

1. Open Supabase and create or select your project.
2. Go to `SQL Editor`.
3. Paste and run [`supabase/sql/001_closed_card_entries_schema.sql`](/Users/yona/Desktop/ESDIR/TERCER AÑO (erasmus Detroit)/2º cuatri/Design Theory/2 - Thesis/cards_web/supabase/sql/001_closed_card_entries_schema.sql).
4. Confirm that:
   - `public.card_entries` exists
   - the private bucket `card-doodles` exists
   - the three average views are available

## 2. Prepare your CSV files

Preferred format: one CSV per week.

Recommended filenames:

- `week_1_card_entries.csv`
- `week_2_card_entries.csv`
- `week_3_card_entries.csv`

Required columns:

```csv
entry_id,week_number,stage,q1_score,q2_score,q3_score,q4_score,participant_age,participant_gender,doodle_storage_path
```

Notes:

- `entry_id` should match the doodle filename suffix exactly, including zero padding such as `001`.
- `week_number` must be `1`, `2`, or `3`.
- `stage` must be `1` or `2`.
- `q1_score` to `q4_score` must be integers from `1` to `5`.
- `participant_age`, `participant_gender`, and `doodle_storage_path` are optional.
- Keep blank optional fields empty in the CSV instead of using placeholder text.

### Optional: clean the CSVs automatically

Use [`scripts/clean_card_entries_csv.py`](/Users/yona/Desktop/ESDIR/TERCER AÑO (erasmus Detroit)/2º cuatri/Design Theory/2 - Thesis/cards_web/scripts/clean_card_entries_csv.py) before import if your source files still need normalization.

Example:

```bash
python3 scripts/clean_card_entries_csv.py \
  week_1_card_entries.csv \
  week_2_card_entries.csv \
  week_3_card_entries.csv
```

What it does:

- validates `week_number`, `stage`, and `q1_score` to `q4_score`
- normalizes `participant_gender` to the database-safe values
- generates `doodle_storage_path` as `week-X/wX_sX_XXX.png`
- writes cleaned files into `cleaned_csv/`

Generated filenames:

- `cleaned_csv/week_1_card_entries_cleaned.csv`
- `cleaned_csv/week_2_card_entries_cleaned.csv`
- `cleaned_csv/week_3_card_entries_cleaned.csv`

## 3. Normalize `participant_gender`

Before importing, map raw values into one of these allowed values:

- `female`
- `male`
- `nonbinary`
- `prefer_not_to_say`
- `self_describe`

Suggested cleanup examples:

- `F`, `Female`, `woman` -> `female`
- `M`, `Male`, `man` -> `male`
- `Non-binary`, `non binary` -> `nonbinary`
- `Prefer not to say` -> `prefer_not_to_say`
- blank, `N/A`, `unknown` -> empty cell, which imports as `NULL`

If you need to keep a more descriptive answer, use `self_describe`.

## 4. Upload doodle scans

Bucket:

- `card-doodles`

Recommended folder layout:

- `week-1/`
- `week-2/`
- `week-3/`

Required file naming rule:

```text
w[week]_s[stage]_[entry_id].png
```

Examples:

- `week-1/w1_s1_001.png`
- `week-1/w1_s2_047.png`
- `week-3/w3_s1_112.png`

The `doodle_storage_path` value in the CSV should store the relative object path only:

```text
week-1/w1_s1_001.png
```

Do not store full public URLs in the CSV.

## 5. Import the CSVs

### Option A: Table Editor import

This is the fastest path for a fixed dataset.

1. Open `Table Editor`.
2. Select `card_entries`.
3. Choose `Insert` -> `Import data from CSV`.
4. Import `week_1_card_entries.csv`.
5. Repeat for weeks 2 and 3.

If the importer shows a validation error, fix the CSV and retry rather than weakening the schema.

### Option B: Staging table import

Use this if you want one extra review step before inserting into the final table.

```sql
create temporary table card_entries_staging (
  entry_id text,
  week_number smallint,
  stage smallint,
  q1_score smallint,
  q2_score smallint,
  q3_score smallint,
  q4_score smallint,
  participant_age smallint,
  participant_gender text,
  doodle_storage_path text
);
```

Import the CSV into the staging table first, then move it into `card_entries`:

```sql
insert into public.card_entries (
  entry_id,
  week_number,
  stage,
  q1_score,
  q2_score,
  q3_score,
  q4_score,
  participant_age,
  participant_gender,
  doodle_storage_path
)
select
  entry_id,
  week_number,
  stage,
  q1_score,
  q2_score,
  q3_score,
  q4_score,
  nullif(participant_age::text, '')::smallint,
  nullif(participant_gender, ''),
  nullif(doodle_storage_path, '')
from card_entries_staging;
```

## 6. Verify the import

Use these checks after the CSV load:

```sql
select count(*) as total_entries
from public.card_entries;
```

Expected result:

- `294`

```sql
select week_number, count(*) as entries_per_week
from public.card_entries
group by week_number
order by week_number;
```

```sql
select week_number, stage, count(*) as entries_per_block
from public.card_entries
group by week_number, stage
order by week_number, stage;
```

To find missing doodle references:

```sql
select entry_id, week_number, stage
from public.card_entries
where doodle_storage_path is null or doodle_storage_path = '';
```

## 7. Use the built-in analysis views

Weekly averages:

```sql
select *
from public.card_entries_average_by_week;
```

Stage averages:

```sql
select *
from public.card_entries_average_by_stage;
```

Week + stage averages:

```sql
select *
from public.card_entries_average_by_week_stage;
```

## Technical Notes

- `entry_id` is stored as text on purpose so your study IDs and doodle filenames stay aligned.
- RLS is enabled, but there are no public policies, so the dataset remains closed.
- The storage bucket is private, which prevents accidental public exposure of participant-linked images.
