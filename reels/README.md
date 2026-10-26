# Reels

`reel.py` turns a JSON spec into a 1080×1920 No Pasa Nada reel (see the docstring for commands).
`specs/` holds the stories, `jobs/` the download/render requests for GitHub Actions.

## Rendering from a URL (GitHub Actions)

Push a job file to `reels/jobs/<name>.json` on any branch:

```json
{"sources": {"clip_a": "https://www.youtube.com/watch?v=..."},
 "spec": "specs/lula-gana.json"}
```

The `reel` workflow downloads each source, commits `reels/out/<key>.info.json` (title, channel)
and `reels/out/<key>.sheet.jpg` (a frame every 2s) back to the branch, and, if `spec` is set,
renders `reels/out/<spec>.mp4` plus a style-frame sheet. Omit `spec` to fetch and preview first.

### YouTube cookies (required)

YouTube answers GitHub's datacenter IPs with "Sign in to confirm you're not a bot", so the
runner needs a signed-in session:

1. In a browser signed in to YouTube (use a secondary Google account, not your main one),
   export cookies for youtube.com in Netscape format, e.g. with the "Get cookies.txt LOCALLY"
   extension, or `yt-dlp --cookies-from-browser chrome --cookies cookies.txt --skip-download <any url>`.
2. GitHub → repo Settings → Secrets and variables → Actions → New repository secret,
   name `YT_COOKIES`, paste the whole file.

Cookies expire after a while; when downloads start failing with the bot message again, re-export.
