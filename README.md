# 補助金審査アプリ

補助金申請の審査を支援するWebアプリケーション。申請情報の入力、メニュー候補の提示、要件チェック、経費計算、判定結果の出力を行います。

## 機能

- **申請情報入力**: 事業の基本情報を入力
- **メニュー候補サジェスト**: キーワードマッチングで該当メニューを提示
- **要件チェック**: 各メニューの要件適合性を確認
- **経費チェック**: 経費計算と補助金額の自動算出
- **判定結果出力**: 総合判定と所見をMarkdown形式で出力

## 技術スタック

- Next.js 14+ (App Router)
- TypeScript
- Material-UI v5
- React Hooks

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## プロジェクト構成

```
/app                # Next.js App Router
/components         # UIコンポーネント
  /forms           # フォームコンポーネント
  /review          # 審査関連コンポーネント
/lib               # ビジネスロジック
  /data            # データ定義
  /logic           # 判定・計算ロジック
/theme             # MUIテーマ設定
/types             # TypeScript型定義
```

## ライセンス

MIT
