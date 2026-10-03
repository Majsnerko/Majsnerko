name: Update Spotify Card

on:
  schedule:
    - cron: "*/5 * * * *"

  workflow_dispatch:

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate Spotify card
        run: node scripts/generate-spotify.js

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add assets/spotify.svg

          if git diff --cached --quiet; then
            echo "No changes."
            exit 0
          fi

          git commit -m "Update Spotify card"
          git push
