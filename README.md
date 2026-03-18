# ISE Lab OPAC

研究室の蔵書をISBNで登録し、検索できるWebアプリ。

## セットアップ

```bash
pnpm install
cp .env.example .env.local
# .env.local に環境変数を設定
pnpm dev
```

## 利用データ

- NDC分類ラベル (`src/data/ndc-labels.json`): 日本図書館協会 NDC-LD（日本十進分類法 新訂9版）、CC-BY — <https://www.jla.or.jp/committees/bunrui/ndc-data/>
