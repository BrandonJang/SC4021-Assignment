from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

# ---------------- CONFIG ----------------
API_KEY = "AIzaSyCSJbYyEr6vO97YQpCNEJrEXucckBgS6gk"
QUERY = "Is the death penalty good or bad"
TARGET_COMMENTS = 20000

youtube = build("youtube", "v3", developerKey=API_KEY)

# ---------------- LABELING ----------------
positive_keywords = [
    "support", "agree", "good", "necessary",
    "deserve", "justice", "deterrent",
    "protect society", "should exist"
]

negative_keywords = [
    "against", "wrong", "inhumane", "cruel",
    "abolish", "barbaric", "murder",
    "should not exist"
]

def label_comment(text):
    text = text.lower()

    for word in positive_keywords:
        if word in text:
            return "positive"

    for word in negative_keywords:
        if word in text:
            return "negative"

    return None

# ---------------- LANGUAGE FILTER ----------------
def is_english(text):
    try:
        return detect(text) == "en"
    except:
        return False

# ---------------- GET VIDEOS ----------------
def get_videos(query, max_videos=500):
    video_ids = []

    request = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=50,
        relevanceLanguage="en"
    )

    while request and len(video_ids) < max_videos:
        response = request.execute()

        for item in response["items"]:
            video_ids.append(item["id"]["videoId"])

        request = youtube.search().list_next(request, response)

    return video_ids

# ---------------- GET COMMENTS ----------------
def get_all_comments(video_id):

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
                    "comment": snippet["textDisplay"],
                    "likes": snippet["likeCount"],
                    "published_at": snippet["publishedAt"],
                    "video_link": f"https://www.youtube.com/watch?v={video_id}"
                })

            request = youtube.commentThreads().list_next(request, response)

    except HttpError:
        print(f"Skipping {video_id} — comments disabled.")

    return comments

# ---------------- MAIN ----------------
video_ids = get_videos(QUERY, max_videos=1000)

dataset = []

for i, vid in enumerate(video_ids):

    comments = get_all_comments(vid)

    for c in comments:
        text = c["comment"].replace("\n", " ").strip()

        if not is_english(text):
            continue

        label = label_comment(text)

        if label:
            dataset.append([
                text,
                c["video_link"],
                c["likes"],
                c["published_at"],
                label
            ])

    print(f"{i+1}/{len(video_ids)} videos processed | collected: {len(dataset)}")

    if len(dataset) >= TARGET_COMMENTS:
        print("Reached target!")
        break

# ---------------- SAVE ----------------
df = pd.DataFrame(dataset, columns=[
    "comment", "video_link", "likes", "published_at", "sentiment"
])

df = df.drop_duplicates(subset=["comment"])

df.to_csv("youtube_death_penalty_dataset.csv", index=False)

print("Done!")
print("Total comments:", len(df))