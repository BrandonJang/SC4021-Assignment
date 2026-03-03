
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import os
from langdetect import detect, DetectorFactory
DetectorFactory.seed = 0  # make langdetect deterministic

# ------------------------- CONFIG -------------------------
API_KEY = "AIzaSyCSJbYyEr6vO97YQpCNEJrEXucckBgS6gk"
QUERY = "is the death penalty good or bad"
TARGET_COMMENTS = 10000
BATCH_SAVE = 1000  # save every 1000 comments
RELEVANCE_LANGUAGE = "en"  # prioritize English videos
MAX_VIDEO_RESULTS = 50  # max per search API call

# ---------------------- INITIALIZE YOUTUBE ----------------------
youtube = build("youtube", "v3", developerKey=API_KEY)

# ---------------------- HELPER FUNCTIONS ----------------------
def get_videos(query, max_videos=500):
    """Fetch video IDs for the search query."""
    video_ids = []
    request = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=MAX_VIDEO_RESULTS,
        relevanceLanguage=RELEVANCE_LANGUAGE,
        order="relevance"
    )
    while request and len(video_ids) < max_videos:
        response = request.execute()
        for item in response["items"]:
            video_ids.append(item["id"]["videoId"])
        request = youtube.search().list_next(request, response)
    return video_ids

def get_all_comments(video_id):
    """Fetch all top-level comments from a video."""
    comments = []
    try:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            textFormat="plainText",
            order="time"
        )
        while request:
            response = request.execute()
            for item in response["items"]:
                snippet = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "video_id": video_id,
                    "comment": snippet["textDisplay"],
                    "likes": snippet["likeCount"],
                    "published_at": snippet["publishedAt"]
                })
            request = youtube.commentThreads().list_next(request, response)
    except HttpError:
        print(f"Skipping {video_id} — comments disabled or unavailable.")
        return []
    return comments

def is_english(text):
    """Return True if the text is English."""
    try:
        return detect(text) == 'en'
    except:
        return False

# ---------------------- MAIN CRAWLER ----------------------
all_comments = []
video_ids = get_videos(QUERY, max_videos=1000)  # fetch up to 1000 videos

for i, vid in enumerate(video_ids):
    comments = get_all_comments(vid)
    # filter English comments
    comments = [c for c in comments if is_english(c["comment"])]
    all_comments.extend(comments)
    
    # periodic save
    if len(all_comments) >= BATCH_SAVE and len(all_comments) % BATCH_SAVE < 100:
        pd.DataFrame(all_comments).drop_duplicates(subset=["comment"]).to_csv(
            "youtube_comments_temp.csv", index=False
        )
        print(f"Saved temporary dataset: {len(all_comments)} comments so far.")

    print(f"{i+1}/{len(video_ids)} videos processed, total comments: {len(all_comments)}")
    
    if len(all_comments) >= TARGET_COMMENTS:
        print("Reached target number of comments!")
        break

# ---------------------- FINAL SAVE ----------------------
df = pd.DataFrame(all_comments).drop_duplicates(subset=["comment"])
df.to_csv("youtube_death_penalty_comments.csv", index=False)
print(f"Done! Total comments collected: {len(df)}")