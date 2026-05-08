#!/usr/bin/env python3
"""Normalize thesis CSV files for Supabase import.

This script:
- validates `week_number`, `stage`, and score ranges
- normalizes `participant_gender` into the allowed schema values
- generates `doodle_storage_path` using the agreed bucket layout
- writes cleaned CSV files ready for Supabase import
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from collections import Counter
from pathlib import Path


OUTPUT_FIELDS = [
    "entry_id",
    "week_number",
    "stage",
    "q1_score",
    "q2_score",
    "q3_score",
    "q4_score",
    "participant_age",
    "participant_gender",
    "doodle_storage_path",
]

FIELD_ALIASES = {
    "entry_id": ["entry_id", "id", "participant_id", "participant_code", "code"],
    "week_number": ["week_number", "week", "week_no"],
    "stage": ["stage", "block", "collection_stage"],
    "q1_score": [
        "q1_score",
        "q1",
        "score_q1",
        "score_1",
        "score1",
        "question_1",
        "question1",
        "score_nutrition",
    ],
    "q2_score": [
        "q2_score",
        "q2",
        "score_q2",
        "score_2",
        "score2",
        "question_2",
        "question2",
        "score_screens",
    ],
    "q3_score": [
        "q3_score",
        "q3",
        "score_q3",
        "score_3",
        "score3",
        "question_3",
        "question3",
        "score_activity",
    ],
    "q4_score": [
        "q4_score",
        "q4",
        "score_q4",
        "score_4",
        "score4",
        "question_4",
        "question4",
        "score_other",
    ],
    "participant_age": ["participant_age", "age"],
    "participant_gender": ["participant_gender", "gender", "participant_sex", "sex"],
    "doodle_storage_path": ["doodle_storage_path", "doodle_path", "doodle_scan_url"],
}

ALLOWED_GENDERS = {
    "female": "female",
    "f": "female",
    "woman": "female",
    "girl": "female",
    "male": "male",
    "m": "male",
    "man": "male",
    "boy": "male",
    "nonbinary": "nonbinary",
    "non-binary": "nonbinary",
    "non binary": "nonbinary",
    "nb": "nonbinary",
    "genderqueer": "nonbinary",
    "prefer_not_to_say": "prefer_not_to_say",
    "prefer not to say": "prefer_not_to_say",
    "prefer-not-to-say": "prefer_not_to_say",
    "decline": "prefer_not_to_say",
    "declined": "prefer_not_to_say",
    "self_describe": "self_describe",
    "self describe": "self_describe",
    "self-describe": "self_describe",
}

NULL_GENDER_VALUES = {
    "",
    "na",
    "n/a",
    "none",
    "null",
    "unknown",
    "unspecified",
    "prefer not to answer",
}

WEEK_PATTERN = re.compile(r"week[\W_]*([1-3])", re.IGNORECASE)


class DataValidationError(Exception):
    """Raised when the input CSV cannot be normalized safely."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clean thesis CSV files for Supabase import."
    )
    parser.add_argument(
        "inputs",
        nargs="+",
        help="Input CSV files. One file per week is recommended.",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        default="cleaned_csv",
        help="Directory for cleaned CSV files. Default: %(default)s",
    )
    parser.add_argument(
        "--doodle-extension",
        default="png",
        help="Extension used for generated doodle filenames. Default: %(default)s",
    )
    return parser.parse_args()


def normalize_header(header: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", header.strip().lower()).strip("_")


def resolve_headers(fieldnames: list[str]) -> dict[str, str]:
    normalized = {normalize_header(name): name for name in fieldnames}
    resolved: dict[str, str] = {}

    for target, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            if alias in normalized:
                resolved[target] = normalized[alias]
                break

    required = {"entry_id", "stage", "q1_score", "q2_score", "q3_score", "q4_score"}
    missing = sorted(required - set(resolved))
    if missing:
        raise DataValidationError(
            "Missing required columns: " + ", ".join(missing)
        )

    return resolved


def derive_week(input_path: Path, row: dict[str, str], resolved: dict[str, str]) -> int:
    if "week_number" in resolved:
        raw = (row.get(resolved["week_number"]) or "").strip()
        if raw:
            return validate_small_int(raw, "week_number", {1, 2, 3})

    match = WEEK_PATTERN.search(input_path.stem)
    if match:
        return int(match.group(1))

    raise DataValidationError(
        f"Could not determine week_number for {input_path.name}. "
        "Add a `week_number` column or include `week_1`, `week_2`, or `week_3` in the filename."
    )


def validate_small_int(raw: str, field_name: str, allowed: set[int]) -> int:
    try:
        value = int(str(raw).strip())
    except ValueError as exc:
        raise DataValidationError(f"{field_name} must be an integer. Received: {raw!r}") from exc

    if value not in allowed:
        allowed_text = ", ".join(str(item) for item in sorted(allowed))
        raise DataValidationError(
            f"{field_name} must be one of {allowed_text}. Received: {value}"
        )
    return value


def validate_score(raw: str, field_name: str) -> int:
    return validate_small_int(raw, field_name, {1, 2, 3, 4, 5})


def normalize_entry_id(raw: str) -> str:
    entry_id = str(raw).strip()
    if not entry_id:
        raise DataValidationError("entry_id cannot be blank")
    return entry_id


def normalize_age(raw: str) -> str:
    text = str(raw or "").strip()
    if not text:
        return ""
    try:
        age = int(text)
    except ValueError as exc:
        raise DataValidationError(f"participant_age must be an integer. Received: {raw!r}") from exc
    if age < 0 or age > 120:
        raise DataValidationError(
            f"participant_age must be between 0 and 120. Received: {age}"
        )
    return str(age)


def normalize_gender(raw: str, stats: Counter) -> str:
    value = str(raw or "").strip()
    normalized = normalize_header(value).replace("_", " ")
    stats["gender_rows_seen"] += 1

    if not value or normalized in NULL_GENDER_VALUES:
        stats["gender_blank"] += 1
        return ""

    if normalized in ALLOWED_GENDERS:
        mapped = ALLOWED_GENDERS[normalized]
        stats[f"gender_{mapped}"] += 1
        return mapped

    raise DataValidationError(
        "participant_gender contains an unsupported value "
        f"{value!r}. Normalize it manually or extend the script mapping."
    )


def build_doodle_path(week_number: int, stage: int, entry_id: str, extension: str) -> str:
    ext = extension.lower().lstrip(".")
    return f"week-{week_number}/w{week_number}_s{stage}_{entry_id}.{ext}"


def clean_row(
    row: dict[str, str],
    resolved: dict[str, str],
    input_path: Path,
    doodle_extension: str,
    stats: Counter,
) -> dict[str, str]:
    week_number = derive_week(input_path, row, resolved)
    stage = validate_small_int(row.get(resolved["stage"], ""), "stage", {1, 2})
    entry_id = normalize_entry_id(row.get(resolved["entry_id"], ""))
    q1 = validate_score(row.get(resolved["q1_score"], ""), "q1_score")
    q2 = validate_score(row.get(resolved["q2_score"], ""), "q2_score")
    q3 = validate_score(row.get(resolved["q3_score"], ""), "q3_score")
    q4 = validate_score(row.get(resolved["q4_score"], ""), "q4_score")

    age = normalize_age(row.get(resolved.get("participant_age", ""), ""))
    gender = normalize_gender(row.get(resolved.get("participant_gender", ""), ""), stats)
    doodle_path = build_doodle_path(week_number, stage, entry_id, doodle_extension)

    stats["rows_cleaned"] += 1

    return {
        "entry_id": entry_id,
        "week_number": str(week_number),
        "stage": str(stage),
        "q1_score": str(q1),
        "q2_score": str(q2),
        "q3_score": str(q3),
        "q4_score": str(q4),
        "participant_age": age,
        "participant_gender": gender,
        "doodle_storage_path": doodle_path,
    }


def clean_file(input_file: Path, output_dir: Path, doodle_extension: str) -> tuple[Path, Counter]:
    stats: Counter = Counter()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{input_file.stem}_cleaned.csv"

    with input_file.open("r", newline="", encoding="utf-8-sig") as infile:
        reader = csv.DictReader(infile)
        if not reader.fieldnames:
            raise DataValidationError(f"{input_file.name} does not contain a header row")
        resolved = resolve_headers(reader.fieldnames)

        cleaned_rows = [
            clean_row(row, resolved, input_file, doodle_extension, stats)
            for row in reader
        ]

    with output_path.open("w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    return output_path, stats


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)

    overall = Counter()
    generated_files: list[Path] = []

    try:
        for input_name in args.inputs:
            input_file = Path(input_name)
            if input_file.suffix.lower() != ".csv":
                raise DataValidationError(f"{input_file.name} is not a CSV file")
            if not input_file.exists():
                raise DataValidationError(f"Input file not found: {input_file}")

            output_path, stats = clean_file(
                input_file=input_file,
                output_dir=output_dir,
                doodle_extension=args.doodle_extension,
            )
            generated_files.append(output_path)
            overall.update(stats)
            print(
                f"Cleaned {input_file.name} -> {output_path} "
                f"({stats['rows_cleaned']} rows)"
            )

    except DataValidationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print("")
    print("Summary")
    print(f"- files cleaned: {len(generated_files)}")
    print(f"- rows cleaned: {overall['rows_cleaned']}")
    print(f"- blank gender rows: {overall['gender_blank']}")
    for key in (
        "gender_female",
        "gender_male",
        "gender_nonbinary",
        "gender_prefer_not_to_say",
        "gender_self_describe",
    ):
        if overall[key]:
            print(f"- {key.replace('gender_', '').replace('_', ' ')}: {overall[key]}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
