# 🎬 What's Up? - Workflow Documentation

## Complete Technical Documentation for the Autonomous Philosophical Media Blog Engine

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Data Files Deep Dive](#3-data-files-deep-dive)
4. [Core Python Scripts](#4-core-python-scripts)
5. [GitHub Actions Workflows](#5-github-actions-workflows)
6. [Daily Automation Flow](#6-daily-automation-flow)
7. [Sunday Weekly Recap Flow](#7-sunday-weekly-recap-flow)
8. [Backup System](#8-backup-system)
9. [Jekyll Build & Deployment](#9-jekyll-build--deployment)
10. [API Integrations](#10-api-integrations)
11. [Error Handling & Fallback Systems](#11-error-handling--fallback-systems)
12. [File Structure Reference](#12-file-structure-reference)
13. [Environment Variables](#13-environment-variables)
14. [Troubleshooting Guide](#14-troubleshooting-guide)

---

## 1. Project Overview

### What is "What's Up?"

**What's Up?** is a fully autonomous, AI-powered philosophical cinema blog that:

- **Automatically generates** 4 philosophical analysis posts per day (Monday-Saturday)
- **Creates** 1 weekly recap post on Sundays
- **Fetches** movie/series data from TMDB API
- **Generates** rich, philosophical content using Google Gemini AI
- **Processes** images to optimized WebP format
- **Deploys** automatically via Jekyll to GitHub Pages
- **Backs up** all data every 3 days via email

### Weekly Output

| Day | Posts | Type |
|-----|-------|------|
| Monday-Saturday | 4 posts/day | 2 movies + 2 series (or 4 movies if series depleted) |
| Sunday | 1 post | Weekly philosophical recap |
| **Total** | **25 posts/week** | Fully automated |

### Technology Stack

- **Static Site Generator**: Jekyll (Ruby-based)
- **Hosting**: GitHub Pages
- **Automation**: GitHub Actions
- **AI Content Generation**: Google Gemini 2.5 Flash
- **Movie Database**: TMDB API
- **Image Sources**: TMDB (daily) + Unsplash (weekly recaps)
- **Notifications**: Telegram Bot + SMTP Email
- **Language**: Python 3.11

---

## 2. System Architecture

### High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS TRIGGERS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Schedule:                                                                   │
│  • 0 3 * * *     → ~08:30 AM IST daily (Sun: weekly recap)                  │
│  • 0 12 * * 1-6  → ~05:30 PM IST Mon-Sat only                               │
│  • 0 6 */3 * *   → ~11:30 AM IST every 3 days (backup)                      │
│  • Push to main  → Jekyll build & deploy                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              main.py EXECUTION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│   │  1. VALIDATE    │ ───► │  2. SELECT      │ ───► │  3. FETCH       │     │
│   │  Environment    │      │  Items from CSV │      │  TMDB Data      │     │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘     │
│                                                              │               │
│                                                              ▼               │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│   │  6. SAVE        │ ◄─── │  5. GENERATE    │ ◄─── │  4. DOWNLOAD    │     │
│   │  Post & Update  │      │  Gemini Content │      │  & Process Imgs │     │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘     │
│           │                                                                  │
│           ▼                                                                  │
│   ┌─────────────────┐      ┌─────────────────┐                              │
│   │  7. REMOVE      │ ───► │  8. PRE-CHECK   │                              │
│   │  from CSV       │      │  Next Items     │                              │
│   └─────────────────┘      └─────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GIT COMMIT & PUSH                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Commits new posts, images, updated data files                            │
│  • Pushes to main branch                                                     │
│  • Triggers pages-deploy.yml workflow                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JEKYLL BUILD & DEPLOY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Builds static site with Jekyll                                            │
│  • Deploys to GitHub Pages                                                   │
│  • Site is live!                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Files Deep Dive

### 3.1 `data/movies.csv`

**Purpose**: Source list of movies to process (IMDb export format)

**Structure**:
```csv
Position,Const,Created,Modified,Description,Title,Original Title,URL,Title Type,IMDb Rating,Runtime (mins),Year,Genres,Num Votes,Release Date,Directors,Your Rating,Date Rated
```

**Key Columns Used**:
| Column | Purpose | Example |
|--------|---------|---------|
| `Const` | IMDb ID (unique identifier) | `tt2488496` |
| `Title` | Movie title | `Star Wars: Episode VII - The Force Awakens` |
| `Year` | Release year | `2015` |
| `Genres` | Genre list | `Action, Adventure, Sci-Fi` |
| `Directors` | Director name(s) | `J.J. Abrams` |
| `Runtime (mins)` | Duration | `138` |
| `URL` | IMDb URL | `https://www.imdb.com/title/tt2488496/` |

**Behavior**:
- Items are **randomly selected** (not sequential)
- After processing, item is **removed** from CSV to prevent re-selection
- Backup created at `movies.backup.csv` before each run

**Current Content**: 543 movies

---

### 3.2 `data/series.csv`

**Purpose**: Source list of TV series to process (IMDb export format)

**Structure**: Same as movies.csv

**Key Difference**: 
- When series.csv becomes empty, the system switches to **double movie mode** (processes 2 movies instead of 1 movie + 1 series)

**Current Content**: ~100 series

**Depletion Handling**:
```python
if available_series.empty:
    print("⚠️ No more series to process - selecting 2nd movie instead!")
    # Select a second movie instead of series
```

---

### 3.3 `data/metadata_db.json`

**Purpose**: Tracks all generated posts for weekly recaps and analytics

**Structure**:
```json
{
  "posts": [
    {
      "imdb_id": "tt3748528",
      "title": "Rogue One: A Star Wars Story",
      "moods": ["Existential", "Heroic", "Melancholy"],
      "url": "/posts/rogue-one-a-star-wars-story/",
      "date": "2026-02-02T09:20:48.983494"
    }
  ]
}
```

**Fields**:
| Field | Description |
|-------|-------------|
| `imdb_id` | IMDb identifier |
| `title` | Movie/series title |
| `moods` | 3 mood tags extracted from generated content |
| `url` | Jekyll post URL |
| `date` | ISO timestamp of generation |

**Retention**: Last 100 entries (older entries auto-purged)

---

### 3.4 `data/processing_queue.json`

**Purpose**: Stores pre-validated items for next run (image availability confirmed)

**Structure**:
```json
{
  "movie": {
    "Position": 468,
    "Const": "tt0071562",
    "Title": "The Godfather Part II",
    "Year": 1974,
    ...
  },
  "series": {
    "Const": "tt13622776",
    "Title": "Ahsoka",
    ...
  }
}
```

**How It Works**:
1. At end of each run, system selects **next** items
2. Checks if TMDB has high-quality images (≥1920px)
3. If images available → saves to queue
4. Next run uses queued items (already validated)
5. If no queue → selects fresh items

**Benefits**:
- Faster processing (no duplicate image checks)
- Early warning for missing images
- Telegram/email alerts sent in advance

---

### 3.5 `data/used_images.json`

**Purpose**: Tracks all TMDB image paths ever used to ensure uniqueness

**Structure**:
```json
{
  "used_paths": [
    "/6cCF0KMUO2QmrVsQFujkQduREXX.jpg",
    "/n0A724N4IS5C53wfxhGWCxnOkhu.jpg",
    ...
  ]
}
```

**How Uniqueness Works**:
1. When downloading images, load this file
2. Filter out already-used paths from TMDB backdrops
3. Select from remaining unused images
4. After saving, add new paths to this file

**Additional Filters**:
- **Landscape preference**: `aspect_ratio > 1.5` (avoids poster-style images)
- **Text-free preference**: `iso_639_1 is None` (avoids text overlays)
- **Quality sorting**: `vote_average * width` (highest quality first)

---

### 3.6 `data/history.log`

**Purpose**: Permanent log of all processed items

**Format**:
```
# What's Up? Processing History
# Format: IMDB_ID  # Title - Date
tt3748528  # Rogue One: A Star Wars Story - 2026-02-02 09:20
tt0944947  # Game of Thrones - 2026-02-02 09:21
recap_w6_2026  # Weekly Recap - Week 6 - 2026-02-09 08:30
```

**Uses**:
- Prevents re-processing of same items
- Source for weekly recap (extracts posts from current week)
- Audit trail

---

## 4. Core Python Scripts

### 4.1 `scripts/main.py` (2478 lines)

**The heart of the automation system.**

#### 4.1.1 Configuration Section (Lines 1-80)

```python
# API Keys (from environment variables)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
NOTIFICATION_EMAIL = os.getenv('NOTIFICATION_EMAIL')

# File Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
DATA_DIR = ROOT_DIR / 'data'
POSTS_DIR = ROOT_DIR / '_posts'
IMAGES_DIR = ROOT_DIR / 'assets' / 'img' / 'posts'

# Image Configuration
HERO_MAX_SIZE_KB = 500      # Hero image max size
HERO_TARGET_WIDTH = 1920    # Hero image width
BODY_MAX_SIZE_KB = 300      # Body image max size
BODY_TARGET_WIDTH = 1280    # Body image width
```

#### 4.1.2 Validation Functions (Lines 81-130)

**`validate_environment()`**:
- Checks required env vars: `GEMINI_API_KEY`, `TMDB_API_KEY`
- Warns about optional: `UNSPLASH_ACCESS_KEY`, Telegram, SMTP
- Exits with error if required vars missing

**`validate_csv_files()`**:
- Verifies `movies.csv` and `series.csv` exist
- Checks for required columns: `Const`, `Title`, `Year`
- Prints item count for each file

#### 4.1.3 CSV & History Management (Lines 131-250)

**`backup_csv_files()`**:
- Creates `.backup.csv` files before processing
- Prevents data loss if something goes wrong

**`remove_from_csv(imdb_id, media_type)`**:
- After processing, removes item from CSV
- Prevents re-selection in future runs

**`load_history()`**:
- Reads `history.log` file
- Returns set of processed IMDb IDs

**`save_to_history(imdb_id, title)`**:
- Appends new entry with timestamp
- Format: `tt1234567  # Title - 2026-02-15 10:30`

#### 4.1.4 Sunday Detection (Lines 251-290)

**`is_sunday()`**:
```python
def is_sunday():
    trigger = os.getenv('TRIGGER_SCHEDULE', '').strip()
    
    # Cron-based detection (authoritative on CI)
    if trigger == '0 14 * * 0':   # Sunday cron
        return True
    if trigger == '0 12 * * 1-6': # Mon-Sat cron
        return False
    
    # Fallback: day-of-week check
    return datetime.now().weekday() == 6
```

- Uses `TRIGGER_SCHEDULE` env var from GitHub Actions
- Falls back to system date for manual runs

#### 4.1.5 Item Selection (Lines 291-420)

**`select_items()`** - Core Selection Logic:

```
1. Load processing queue from previous run
   ├── Queue exists? → Use queued items (already validated)
   └── No queue? → Select new items

2. Load both CSV files
   ├── Filter out already-processed items (from history)
   └── Count available items

3. Random selection strategy
   ├── Pick 1 random movie
   ├── Pick 1 random series (or 2nd movie if series depleted)
   ├── Pick next movie for queue
   └── Pick next series for queue

4. Return: (movie, series, next_movie, next_series)
```

**Depletion Handling**:
```python
if available_series.empty:
    print("⚠️ SERIES CSV DEPLETED - Switching to double movie mode!")
    # Will process 2 movies instead of 1 movie + 1 series
```

#### 4.1.6 TMDB API Integration (Lines 421-600)

**`fetch_tmdb_data(imdb_id)`**:

```
Step 1: Find TMDB ID from IMDb ID
   └── GET /find/{imdb_id}?external_source=imdb_id

Step 2: Detect media type (movie or TV)
   ├── movie_results → media_type = 'movie'
   └── tv_results → media_type = 'tv'

Step 3: Fetch full details
   └── GET /{media_type}/{tmdb_id}?append_to_response=images,credits,watch/providers

Returns: (tmdb_data_dict, media_type)
```

**Data Retrieved**:
- Overview/plot summary
- Cast list
- Backdrop images (sorted by quality)
- Streaming providers

#### 4.1.7 Image Processing (Lines 601-900)

**`download_image(url, timeout=60)`**:
- Simple HTTP GET for image bytes
- Returns raw image data or None

**`process_and_save_image(image_data, output_path, max_size_kb, target_width)`**:

```
1. Open image with PIL
2. Convert to RGB (WebP compatibility)
3. Resize to target width (maintain aspect ratio)
4. Compress iteratively:
   └── Start quality=90, decrease by 5 until size ≤ max_kb
5. Last resort: reduce dimensions by 25%
6. Save as WebP
```

**`download_and_process_images(tmdb_data, imdb_id)`**:

```
1. Load used_images.json (prevent duplicates)
2. Filter backdrops:
   ├── Remove already-used paths
   ├── Prefer landscape (aspect_ratio > 1.5)
   └── Prefer text-free (no language overlays)
3. Sort by quality score
4. Download hero image (best quality, original size)
5. Download up to 3 body images (diverse selection)
6. Save all paths to used_images.json
7. Return list of (type, path) tuples
```

**Diversity Algorithm for Body Images**:
```python
def is_diverse(candidate_idx, selected_idxs, backdrops):
    # Check if file names too similar (same scene)
    # Check if dimensions/votes too similar (cropped versions)
    # Jump ahead 3+ indices between selections
```

#### 4.1.8 Unsplash Integration (Lines 901-1050)

**For Sunday Weekly Recaps Only**

**`fetch_unsplash_philosophical_image(week_posts)`**:

```
1. Generate search query with Gemini
   └── Based on week's themes (titles analyzed)
2. Load used_unsplash.json (prevent duplicates)
3. Search Unsplash API:
   └── GET /search/photos?query={query}&orientation=landscape
4. Filter out already-used images
5. Select random from top 10 results
6. Download image
7. Save ID to used_unsplash.json
8. Return (image_data, attribution_string)
```

**`generate_unsplash_search_query(week_posts)`**:
```
Prompt Gemini with week's titles
  → Generate 2-4 word search query
  → Focus: philosophical, cinematic, metaphorical
  → Examples: "solitary journey sunset", "existential contemplation"
```

#### 4.1.9 Telegram Integration (Lines 1051-1250)

**Manual Fallback System for Missing Images**

**`trigger_manual_fallback(imdb_id, title)`**:
- Sends Telegram message with upload instructions
- Sends email alert
- Captions to use: `HERO_{imdb_id}`, `IMG1_{imdb_id}`, etc.

**`check_telegram_for_uploads(imdb_id)`**:
- Polls Telegram API for photos
- Matches captions to expected tokens
- Downloads matching images
- Cleans up messages after processing

**`delete_all_telegram_messages()`**:
- Keeps Telegram chat clean
- Deletes all messages after images processed

#### 4.1.10 Gemini AI Content Generation (Lines 1251-1800)

**`generate_blog_post(imdb_data, tmdb_data, media_type, has_images, image_count)`**:

**Prompt Structure**:
```
1. METADATA SECTION
   - Title, Year, Type, Genres, Director, Runtime
   - IMDb URL for web search

2. TMDB DATA SECTION
   - Cast, Plot Overview

3. WEB SEARCH INSTRUCTION
   - Search for real critic reviews
   - Include both positive AND negative feedback
   - Be balanced, not a PR piece

4. IMAGE INSTRUCTIONS
   - Use [IMAGE_1], [IMAGE_2], [IMAGE_3] placeholders
   - Will be replaced with actual paths after generation

5. FORMATTING REQUIREMENTS
   - Rich markdown: **bold**, *italics*, ***bold italics***
   - Blockquotes with prompt styles:
     * {: .prompt-tip} - wisdom, insight
     * {: .prompt-info} - observations
     * {: .prompt-warning} - darker themes
     * {: .prompt-danger} - existential truths
   - Section headers (##)
   - Horizontal rules (---)
   - Lists (bullets and numbered)

6. STRUCTURE TEMPLATE
   - Opening quote
   - First paragraph (hook)
   - Section 1: Core philosophical theme + [IMAGE_1]
   - Section 2: What works vs. doesn't
   - Section 3: Deeper questions + [IMAGE_2], [IMAGE_3]
   - Closing thought

7. ORIGINALITY MANDATE
   - Banned phrases list
   - Fresh observations required
   - Varied philosophical frameworks

8. FRONTMATTER OUTPUT FORMAT
   ---
   title: "..."
   date: YYYY-MM-DD HH:MM:SS +0530
   categories: [...]
   tags: [mood1, mood2, mood3]
   image:
     path: /assets/img/posts/{imdb_id}_hero.webp
     alt: "..."
   description: "..."
   ---
```

**Generation Settings**:
```python
config=types.GenerateContentConfig(
    temperature=0.85,          # Creative but coherent
    max_output_tokens=8192,    # Long-form content
)
```

**Retry Logic**:
- 3 attempts max
- Exponential backoff on 503/429 errors
- Wait 10s → 20s → 40s between retries

#### 4.1.11 Weekly Recap Generation (Lines 1300-1650)

**`generate_weekly_recap_post(week_posts, hero_image_path, unsplash_attribution)`**:

**Prompt Highlights**:
```
- Input: List of week's posts (title, date, imdb_id)
- Output: 1500-2000 word philosophical synthesis
- Structure:
  * Opening quote + magnificent prose
  * Section 1: The Philosophical Thread
  * Section 2: Journey Through Cinema (ALL films)
  * Section 3: Deeper Waters - Human Condition
  * Section 4: The Synthesis
  * Closing questions + poetic reflection
- Must include 6-8 blockquotes throughout
- Must reference ALL films from the week
```

#### 4.1.12 Post-Processing Functions (Lines 1800-2100)

**`insert_images_into_content(content, imdb_id, body_images, title)`**:
```
Pass 1: Replace [IMAGE_1], [IMAGE_2], [IMAGE_3] placeholders
  └── With: ![Scene from {title}](path){: .rounded-10 w-75 .shadow}

Pass 2 (fallback): If Gemini wrote its own image markdown
  └── Find all ![alt](src) in body
  └── Replace non-local paths with correct local paths
```

**`sanitize_title_in_content(content)`**:
```
Remove markdown from title field in frontmatter:
  - ***text*** → text
  - **text** → text
  - *text* → text
  - `text` → text
```

**`update_metadata(imdb_id, title, moods, url)`**:
- Adds entry to metadata_db.json
- Keeps only last 100 entries
- Used for analytics and weekly recaps

**`extract_moods_from_content(content)`**:
- Parses `tags: [mood1, mood2, mood3]` from frontmatter
- Returns list of 3 mood tags

#### 4.1.13 Main Processing Functions (Lines 2100-2350)

**`process_sunday_special()`**:
```
1. Get week's posts from history.log
2. Require minimum 3 posts for meaningful recap
3. Fetch Unsplash philosophical image
4. Process and save hero image
5. Generate recap content with Gemini
6. Sanitize title
7. Save as: YYYY-MM-DD-weekly-recap-week-{N}.md
8. Add to history as: recap_w{N}_{year}
```

**`process_item(item_data, media_type_label)`**:
```
1. Check Telegram for manual uploads
2. Fetch TMDB data
3. Download images (TMDB or Telegram)
4. Generate content with Gemini
5. Insert image placeholders
6. Sanitize title
7. Save to _posts/
8. Update history.log
9. Update metadata_db.json
10. Remove from CSV
```

**`pre_check_next_items(next_movie, next_series)`**:
```
- Check if next items have high-quality TMDB images
- If missing → trigger_manual_fallback()
- Returns True if all have images
```

#### 4.1.14 Main Entry Point (Lines 2350-2478)

**`main()`** - Complete Flow:

```
┌─────────────────────────────────────────────────┐
│               START                              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           Is it Sunday?                          │
│  (Check TRIGGER_SCHEDULE or system date)         │
└─────────────────────────────────────────────────┘
           │                    │
        Yes│                    │No
           ▼                    ▼
┌────────────────────┐  ┌────────────────────────┐
│ process_sunday_    │  │ Normal Weekday Flow:   │
│ special()          │  │                        │
│                    │  │ 1. validate_environment│
│ - Get week's posts │  │ 2. validate_csv_files  │
│ - Fetch Unsplash   │  │ 3. backup_csv_files    │
│ - Generate recap   │  │ 4. select_items()      │
│ - Save post        │  │ 5. pre_check_next()    │
└────────────────────┘  │ 6. save_queued_items() │
                        │ 7. process_item(movie) │
                        │ 8. process_item(series)│
                        │ 9. Print summary       │
                        └────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│               EXIT                               │
│  (Changes committed by GitHub Actions)           │
└─────────────────────────────────────────────────┘
```

---

### 4.2 `scripts/backup.py` (327 lines)

**Automated backup system that emails compressed archives**

#### 4.2.1 Configuration

```python
BACKUP_DIRS = [
    '_posts',                        # Blog post markdown files
    'assets/img/posts',              # Post images (WebP)
    'data',                          # CSVs, metadata, history
    'Original',                      # Original CSV backups
]

MAX_ATTACHMENT_BYTES = 24 * 1024 * 1024  # 24MB (Gmail 25MB limit)
```

#### 4.2.2 Functions

**`validate_env()`**:
- Checks: `SMTP_EMAIL`, `SMTP_PASSWORD`, `NOTIFICATION_EMAIL`

**`collect_stats()`**:
- Scans all backup directories
- Counts files and total bytes per directory
- Returns stats dictionary

**`create_archive()`**:
```
1. Create timestamp: whatsup_backup_YYYY-MM-DD_HHMM.tar.gz
2. Open tar.gz with compression level 9 (maximum)
3. Add each backup directory
4. Return (archive_path, archive_size)
```

**`split_archive(archive_path, chunk_size)`**:
```
If archive > 24MB:
  1. Calculate number of chunks needed
  2. Split into: .part01, .part02, etc.
  3. Return list of chunk paths
```

**`build_email_body(stats, archive_size, num_parts)`**:
- Creates beautiful HTML email
- Shows backup summary table
- Includes restore instructions
- Notes if archive was split

**`send_backup_email(file_paths, stats, archive_size)`**:
```
For each file/chunk:
  1. Create MIMEMultipart message
  2. First email: full HTML body
  3. Subsequent emails: "Part X of Y" note
  4. Attach file as application/octet-stream
  5. Send via Gmail SMTP
```

**`cleanup()`**:
- Removes temporary .backup_temp directory

**`main()`**:
```
1. Validate environment
2. Scan directories (collect_stats)
3. Create compressed archive
4. Split if > 24MB
5. Send email(s)
6. Cleanup temp files
7. Print compression ratio
```

---

### 4.3 `scripts/requirements.txt`

```
google-genai>=0.3.0    # Gemini AI SDK
requests>=2.31.0       # HTTP requests
pandas>=2.0.0          # CSV processing
Pillow>=10.0.0         # Image processing
PyYAML>=6.0            # YAML parsing
python-dotenv>=1.0.0   # Environment variables (local dev)
```

---

## 5. GitHub Actions Workflows

### 5.1 `daily_post.yml` (210 lines)

**Purpose**: Automated content generation and publishing

#### Schedule

```yaml
on:
  schedule:
    - cron: '0 3 * * *'      # 08:30 AM IST daily (Sun: recap)
    - cron: '0 12 * * 1-6'   # 05:30 PM IST Mon-Sat only
  workflow_dispatch:          # Manual trigger
```

#### Concurrency Control

```yaml
concurrency:
  group: daily-post
  cancel-in-progress: false  # Don't cancel running jobs
```

#### Steps Breakdown

| Step | Name | Description |
|------|------|-------------|
| 1 | 📥 Checkout | Clone repo with PAT for push access |
| 2 | 🐍 Setup Python | Install Python 3.11 with pip cache |
| 3 | 📦 Install deps | `pip install -r scripts/requirements.txt` |
| 4 | ⏳ Random delay | Sleep 0-20 minutes (natural timing) |
| 5 | 📁 Create dirs | Ensure data/, _posts/, assets/img/posts/ exist |
| 6 | 📋 Verify CSVs | Check movies.csv and series.csv present |
| 7 | 🤖 Run main.py | Execute with all env vars |
| 8 | 📝 Git config | Set bot user email/name |
| 9 | 📤 Commit | Add all changes, commit with summary |
| 10 | 🚀 Push | Push to origin/main |
| 11 | 📊 Summary | Write job summary to Actions |

#### Environment Variables Passed

```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
  UNSPLASH_ACCESS_KEY: ${{ secrets.UNSPLASH_ACCESS_KEY }}
  TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
  TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
  SMTP_EMAIL: ${{ secrets.SMTP_EMAIL }}
  SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
  NOTIFICATION_EMAIL: ${{ secrets.NOTIFICATION_EMAIL }}
  TRIGGER_SCHEDULE: ${{ github.event.schedule }}
```

---

### 5.2 `backup.yml` (85 lines)

**Purpose**: Automated data backup every 3 days

#### Schedule

```yaml
on:
  schedule:
    - cron: '0 6 */3 * *'   # ~11:30 AM IST every 3 days
  workflow_dispatch:         # Manual trigger
```

#### Steps

| Step | Name | Description |
|------|------|-------------|
| 1 | 📥 Checkout | Clone repository |
| 2 | 🐍 Setup Python | Install Python 3.11 |
| 3 | 📁 Verify dirs | Check backup directories exist |
| 4 | 💾 Run backup | Execute backup.py |
| 5 | 📊 Summary | Write stats to Actions summary |

---

### 5.3 `pages-deploy.yml` (65 lines)

**Purpose**: Build Jekyll site and deploy to GitHub Pages

#### Trigger

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '.github/**'           # Except pages-deploy.yml
      - 'scripts/**'           # Python scripts
      - 'data/**'              # Data files
      - '*.md'                 # Markdown (except _posts)
      - '!_posts/**'           # Do trigger for _posts
  workflow_dispatch:
```

#### Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

#### Jobs

**Build Job**:
1. Checkout repository
2. Setup Ruby 3.3 with bundler cache
3. Configure GitHub Pages
4. Build: `bundle exec jekyll build`
5. Upload artifact

**Deploy Job**:
1. Depends on build job
2. Deploy to GitHub Pages
3. Sets environment URL

---

## 6. Daily Automation Flow

### Complete Sequence Diagram

```
Time: 08:30 AM IST (0 3 * * *)
      or 05:30 PM IST (0 12 * * 1-6)

GitHub Actions                    main.py                         External APIs
     │                               │                                  │
     │  Trigger workflow             │                                  │
     ├──────────────────────────────►│                                  │
     │                               │                                  │
     │  Random delay (0-20 min)      │                                  │
     │◄──────────────────────────────┤                                  │
     │                               │                                  │
     │  Run main.py                  │                                  │
     ├──────────────────────────────►│                                  │
     │                               │                                  │
     │                               │  Validate environment            │
     │                               ├─────────────────────────────────►│
     │                               │                                  │
     │                               │  Load CSV files                  │
     │                               ├─────────────────────────────────►│
     │                               │                                  │
     │                               │  Load processing queue           │
     │                               │◄─────────────────────────────────┤
     │                               │                                  │
     │                               │  (If no queue) Random selection  │
     │                               ├─────────────────────────────────►│
     │                               │                                  │
     │                               │ ┌───────────────────────────────┐│
     │                               │ │  FOR EACH ITEM (2 items)      ││
     │                               │ │                               ││
     │                               │ │  1. Check Telegram uploads    ││
     │                               │ │     └─► Telegram API          ││
     │                               │ │                               ││
     │                               │ │  2. Fetch TMDB data           ││
     │                               │ │     └─► TMDB API              ││
     │                               │ │                               ││
     │                               │ │  3. Download images           ││
     │                               │ │     └─► TMDB Image CDN        ││
     │                               │ │                               ││
     │                               │ │  4. Process to WebP           ││
     │                               │ │     └─► PIL/Pillow            ││
     │                               │ │                               ││
     │                               │ │  5. Generate content          ││
     │                               │ │     └─► Gemini API            ││
     │                               │ │                               ││
     │                               │ │  6. Save .md post             ││
     │                               │ │  7. Update history.log        ││
     │                               │ │  8. Update metadata_db.json   ││
     │                               │ │  9. Remove from CSV           ││
     │                               │ └───────────────────────────────┘│
     │                               │                                  │
     │                               │  Pre-check next items            │
     │                               ├─────────────────────────────────►│
     │                               │                                  │
     │                               │  Save to processing_queue.json   │
     │                               │◄─────────────────────────────────┤
     │                               │                                  │
     │  Exit main.py                 │                                  │
     │◄──────────────────────────────┤                                  │
     │                               │                                  │
     │  Git add -A                   │                                  │
     │  Git commit                   │                                  │
     │  Git push                     │                                  │
     │                               │                                  │
     │  Triggers pages-deploy.yml    │                                  │
     ├──────────────────────────────────────────────────────────────────►
     │                               │                                  │
     │  Jekyll build                 │                                  │
     │  Deploy to GitHub Pages       │                                  │
     │                               │                                  │
     ▼                               ▼                                  ▼
```

---

## 7. Sunday Weekly Recap Flow

### Detailed Process

```
Sunday 08:30 AM IST (0 3 * * * + weekday == 6)

┌─────────────────────────────────────────────────┐
│  1. DETECT SUNDAY                                │
│     is_sunday() returns True                     │
│     (TRIGGER_SCHEDULE or datetime.weekday())    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  2. GET WEEK'S POSTS                             │
│     get_week_posts_from_history()               │
│     - Parse history.log                          │
│     - Filter: Monday 00:00 → Sunday 23:59        │
│     - Exclude: recap entries                     │
│     - Minimum: 3 posts required                  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  3. GENERATE SEARCH QUERY                        │
│     generate_unsplash_search_query(week_posts)  │
│     - Gemini analyzes titles                     │
│     - Outputs 2-4 word philosophical query       │
│     - Example: "existential contemplation"       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  4. FETCH UNSPLASH IMAGE                         │
│     fetch_unsplash_philosophical_image()        │
│     - Search: /search/photos?orientation=land   │
│     - Filter: not in used_unsplash.json         │
│     - Select: random from top 10                 │
│     - Download: regular size (1080px)            │
│     - Save: ID to used_unsplash.json            │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  5. PROCESS HERO IMAGE                           │
│     process_and_save_image()                    │
│     - Convert to RGB                             │
│     - Resize to 1920px width                     │
│     - Compress to ≤500KB WebP                    │
│     - Save: week{N}_{year}_recap_hero.webp      │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  6. GENERATE RECAP CONTENT                       │
│     generate_weekly_recap_post()                │
│     - Gemini prompt with all film titles         │
│     - 1500-2000 words philosophical synthesis    │
│     - Weaves ALL films into one narrative        │
│     - 6-8 blockquotes from philosophers          │
│     - Unsplash attribution in frontmatter        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  7. SAVE POST                                    │
│     - Filename: YYYY-MM-DD-weekly-recap-week-N  │
│     - Sanitize title (remove markdown)           │
│     - Write to _posts/                           │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  8. UPDATE HISTORY                               │
│     save_to_history()                           │
│     - Entry: recap_w{N}_{year}                  │
│     - Prevents duplicate recap generation        │
└─────────────────────────────────────────────────┘
```

---

## 8. Backup System

### Backup Flow

```
Every 3 Days at 06:00 UTC (~11:30 AM IST)

┌─────────────────────────────────────────────────┐
│  backup.py                                       │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Validate SMTP credentials                    │
│                                                  │
│  2. Scan directories:                            │
│     ├── _posts/          (blog posts)           │
│     ├── assets/img/posts (images)               │
│     ├── data/            (CSVs, metadata)       │
│     └── Original/        (CSV backups)          │
│                                                  │
│  3. Create archive:                              │
│     └── whatsup_backup_YYYY-MM-DD_HHMM.tar.gz   │
│     └── Compression: gzip level 9 (maximum)     │
│                                                  │
│  4. Check size:                                  │
│     ├── < 24MB → Single file                    │
│     └── > 24MB → Split into .part01, .part02... │
│                                                  │
│  5. Send email(s):                               │
│     ├── Beautiful HTML summary                  │
│     ├── Directory statistics table              │
│     ├── Restore instructions                    │
│     └── Archive attachment(s)                   │
│                                                  │
│  6. Cleanup temporary files                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Email Contents

```
Subject: 💾 What's Up? Backup — Feb 15, 2026

Body:
┌─────────────────────────────────────────────────┐
│  📊 Backup Summary                               │
├─────────────────────────────────────────────────┤
│  Directory        │ Files │ Size                │
│  _posts/          │ 150   │ 2.5 MB              │
│  assets/img/posts │ 600   │ 180 MB              │
│  data/            │ 6     │ 1.2 MB              │
│  Original/        │ 4     │ 0.5 MB              │
│  ─────────────────────────────────────────────  │
│  Total            │ 760   │ 184.2 MB            │
├─────────────────────────────────────────────────┤
│  📦 Archive: 45.3 MB (gzip level 9)             │
│  Compression ratio: 75.4% smaller               │
├─────────────────────────────────────────────────┤
│  🔄 Restore Instructions:                        │
│  1. Download .tar.gz attachment                 │
│  2. tar -xzf whatsup_backup_*.tar.gz           │
│  3. Copy folders to project root                │
└─────────────────────────────────────────────────┘

Attachment: whatsup_backup_2026-02-15_0600.tar.gz
```

---

## 9. Jekyll Build & Deployment

### Trigger Conditions

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '.github/**'      # Workflow changes (except this file)
      - 'scripts/**'      # Python scripts
      - 'data/**'         # Data files
      - '*.md'            # Root markdown files
      - '!_posts/**'      # EXCEPT _posts changes trigger build
```

### Build Process

```
1. Checkout repository (fetch-depth: 0)
2. Setup Ruby 3.3 with bundler cache
3. Configure GitHub Pages
4. Build Jekyll site:
   bundle exec jekyll build --baseurl "{base_path}"
   JEKYLL_ENV=production
5. Upload artifact to GitHub Actions
```

### Deployment Process

```
1. Wait for build job to complete
2. Download artifact
3. Deploy to GitHub Pages
4. Output page URL
```

### Concurrency

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

---

## 10. API Integrations

### 10.1 TMDB API

**Base URL**: `https://api.themoviedb.org/3`

**Endpoints Used**:

| Endpoint | Purpose |
|----------|---------|
| `/find/{imdb_id}` | Convert IMDb ID to TMDB ID |
| `/movie/{id}` | Get movie details |
| `/tv/{id}` | Get TV show details |

**Query Parameters**:
```
api_key={TMDB_API_KEY}
external_source=imdb_id
append_to_response=images,credits,watch/providers
```

**Image CDN**:
```
https://image.tmdb.org/t/p/original/{file_path}   # Hero (full res)
https://image.tmdb.org/t/p/w1280/{file_path}      # Body (1280px)
```

---

### 10.2 Google Gemini API

**SDK**: `google-genai` Python package

**Model**: `gemini-2.5-flash`

**Usage**:
```python
client = genai.Client(api_key=GEMINI_API_KEY)
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt,
    config=types.GenerateContentConfig(
        temperature=0.85,
        max_output_tokens=8192,
    )
)
```

**Features Used**:
- Blog post generation (800-1200 words)
- Weekly recap synthesis (1500-2000 words)
- Unsplash search query generation (2-4 words)
- Image prompt generation (for recap hero images)

---

### 10.3 Unsplash API

**Base URL**: `https://api.unsplash.com`

**Endpoint**: `/search/photos`

**Parameters**:
```
query={philosophical_query}
per_page=30
orientation=landscape
content_filter=high
```

**Authentication**:
```
Headers: Authorization: Client-ID {UNSPLASH_ACCESS_KEY}
```

**Response Used**:
- `results[n].id` - Image ID (for deduplication)
- `results[n].urls.regular` - 1080px image URL
- `results[n].user.name` - Photographer name
- `results[n].user.links.html` - Attribution URL

---

### 10.4 Telegram Bot API

**Base URL**: `https://api.telegram.org/bot{token}`

**Endpoints**:

| Endpoint | Purpose |
|----------|---------|
| `/sendMessage` | Send alerts/requests |
| `/getUpdates` | Poll for uploaded photos |
| `/getFile` | Get file download path |
| `/deleteMessage` | Clean up messages |

**File Download**:
```
https://api.telegram.org/file/bot{token}/{file_path}
```

---

### 10.5 Gmail SMTP

**Server**: `smtp.gmail.com:587`

**Authentication**: App Password (not regular password)

**Usage**:
```python
with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    server.sendmail(from_addr, to_addr, msg.as_string())
```

---

## 11. Error Handling & Fallback Systems

### 11.1 API Error Handling

**Gemini API**:
```python
max_retries = 3
retry_delay = 10  # seconds

for attempt in range(max_retries):
    try:
        response = client.models.generate_content(...)
        return response.text
    except Exception as e:
        if '503' or '429' in str(e):
            time.sleep(retry_delay)
            retry_delay *= 2  # Exponential backoff
```

**TMDB API**:
```python
try:
    response = requests.get(url, params, timeout=30)
    response.raise_for_status()
except requests.RequestException:
    return None, None  # Graceful degradation
```

### 11.2 Missing TMDB Data Fallback

When TMDB has no data:
```python
if not tmdb_data:
    # Gemini will use web search
    web_search_instruction = """
    🌐 CRITICAL: WEB SEARCH REQUIRED
    Search for: real critic reviews, audience reactions, 
    common criticisms, controversial aspects
    """
```

### 11.3 Missing Images Fallback

**Telegram Manual Upload System**:

1. Pre-check identifies missing images
2. Sends Telegram + Email alerts:
   ```
   🎬 Manual Upload Required
   Title: {title}
   IMDb ID: {imdb_id}
   
   Upload with captions:
   - HERO_{imdb_id}
   - IMG1_{imdb_id}
   - IMG2_{imdb_id}
   - IMG3_{imdb_id}
   ```
3. Next run checks for uploads before TMDB

### 11.4 Series Depletion Fallback

When series.csv is empty:
```python
if available_series.empty:
    # Switch to double movie mode
    # Select 2 movies instead of 1 movie + 1 series
```

### 11.5 Image Deduplication

When all images for an item have been used:
```python
if not available_backdrops:
    print("All images have been used before!")
    available_backdrops = backdrops  # Reset to full list
```

---

## 12. File Structure Reference

```
WHATSUP/
├── .github/
│   └── workflows/
│       ├── daily_post.yml      # Content automation
│       ├── backup.yml          # Data backup
│       └── pages-deploy.yml    # Jekyll deployment
│
├── scripts/
│   ├── main.py                 # Core automation (2478 lines)
│   ├── backup.py               # Backup system (327 lines)
│   └── requirements.txt        # Python dependencies
│
├── data/
│   ├── movies.csv              # Source: movies to process
│   ├── series.csv              # Source: series to process
│   ├── history.log             # Processed items log
│   ├── metadata_db.json        # Post metadata for recaps
│   ├── processing_queue.json   # Pre-validated next items
│   ├── used_images.json        # TMDB image deduplication
│   └── used_unsplash.json      # Unsplash image deduplication
│
├── _posts/                     # Generated blog posts (markdown)
│   ├── 2026-02-02-rogue-one.md
│   ├── 2026-02-02-game-of-thrones.md
│   └── ...
│
├── assets/
│   └── img/
│       └── posts/              # Processed images (WebP)
│           ├── tt3748528_hero.webp
│           ├── tt3748528_1.webp
│           └── ...
│
├── _config.yml                 # Jekyll configuration
├── Gemfile                     # Ruby dependencies
├── index.html                  # Site homepage
└── README.md                   # Project readme
```

---

## 13. Environment Variables

### Required (Automation Fails Without These)

| Variable | Purpose | Source |
|----------|---------|--------|
| `GEMINI_API_KEY` | Google Gemini AI | Google AI Studio |
| `TMDB_API_KEY` | Movie database | TMDB Account |

### Optional (Features Disabled Without These)

| Variable | Purpose | Source |
|----------|---------|--------|
| `UNSPLASH_ACCESS_KEY` | Sunday recap images | Unsplash Developer |
| `TELEGRAM_BOT_TOKEN` | Manual upload fallback | BotFather |
| `TELEGRAM_CHAT_ID` | Target chat for alerts | Bot chat |
| `SMTP_EMAIL` | Email sender address | Gmail |
| `SMTP_PASSWORD` | Email app password | Gmail App Passwords |
| `NOTIFICATION_EMAIL` | Recipient for alerts | Any email |

### GitHub Actions Specific

| Variable | Purpose |
|----------|---------|
| `GH_PAT` | Personal Access Token for push |
| `TRIGGER_SCHEDULE` | Cron expression that triggered run |

---

## 14. Troubleshooting Guide

### Common Issues

#### 1. "No items available to process"
**Cause**: Both CSV files are empty or all items processed
**Solution**: 
- Add new items to movies.csv/series.csv
- Check history.log for processed items

#### 2. "Gemini API error: 503/429"
**Cause**: API overloaded or rate limit
**Solution**: 
- Automatic retry with exponential backoff
- Wait and rerun manually if persists

#### 3. "No high-quality images found"
**Cause**: TMDB has no landscape backdrops ≥1920px
**Solution**:
- System sends Telegram/email alert
- Upload manually with caption `HERO_{imdb_id}`

#### 4. "Missing required environment variables"
**Cause**: GitHub Secrets not configured
**Solution**:
- Go to Repository Settings → Secrets → Actions
- Add missing secrets

#### 5. "Push rejected - no changes"
**Cause**: No new content generated
**Solution**:
- Check workflow logs for errors
- Verify CSV files have unprocessed items

#### 6. "Weekly recap: Only X posts this week"
**Cause**: Fewer than 3 posts generated this week
**Solution**:
- Recap requires minimum 3 posts
- Will skip if threshold not met

### Log Locations

- **GitHub Actions**: Repository → Actions → Select workflow
- **history.log**: Record of all processed items
- **metadata_db.json**: Structured post metadata

### Manual Intervention Commands

**Run locally** (for testing):
```bash
cd scripts
python main.py
```

**Skip random delay** (for testing):
```bash
python main.py --skip-delay
```

**Trigger workflow manually**:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

---

## Summary

**What's Up?** is a sophisticated, fully automated blog engine that:

1. **Reads** movie/series data from IMDb CSV exports
2. **Fetches** metadata and images from TMDB API
3. **Generates** philosophical content with Gemini AI
4. **Processes** images to optimized WebP format
5. **Publishes** 25 posts per week automatically
6. **Creates** weekly philosophical recaps on Sundays
7. **Backs up** all data via email every 3 days
8. **Deploys** to GitHub Pages via Jekyll

The system is designed to be **fully autonomous** with multiple fallback mechanisms for edge cases, making it a reliable content generation pipeline.

---

*Documentation generated: February 15, 2026*
*Total lines analyzed: ~3,500+ across all files*
