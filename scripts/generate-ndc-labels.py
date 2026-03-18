"""
NDC-LD (ndc9.ttl) から ndc-labels.json を生成するスクリプト

入力: assets/ndc9.ttl (JLA公式 NDC-LD, CC-BY)
出力: src/data/ndc-labels.json

使い方:
  python3 scripts/generate-ndc-labels.py
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "assets" / "ndc9.ttl"
OUTPUT = ROOT / "src" / "data" / "ndc-labels.json"


def parse_ndc_ttl(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    blocks = re.split(r"\n(?=ndc9:\S)", content)

    classes = {}
    divisions = {}

    for block in blocks:
        notation_match = re.search(r'skos:notation\s+"(\d+)"', block)
        if not notation_match:
            continue
        notation = notation_match.group(1)

        label_match = re.search(r'skos:prefLabel\s+"([^"]+)"@ja', block)
        if not label_match:
            continue
        label = label_match.group(1)

        is_main = "ndcv:MainClass" in block
        is_section = "ndcv:Section" in block

        if len(notation) == 1 and is_main:
            classes[notation] = label
        elif len(notation) == 3 and is_section:
            divisions[notation] = label

    return {
        "classes": dict(sorted(classes.items())),
        "divisions": dict(sorted(divisions.items())),
    }


def main():
    if not INPUT.exists():
        print(f"Error: {INPUT} が見つかりません")
        print(f"https://www.jla.or.jp/wp/wp-content/uploads/2025/06/ndc9.zip からダウンロードし、")
        print(f"assets/ndc9.ttl に配置してください。")
        raise SystemExit(1)

    result = parse_ndc_ttl(INPUT)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"classes:   {len(result['classes'])}件")
    print(f"divisions: {len(result['divisions'])}件")
    print(f"出力: {OUTPUT}")


if __name__ == "__main__":
    main()
