
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import os
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

# ---------------- CONFIG ----------------
API_KEY = "AIzaSyCSJbYyEr6vO97YQpCNEJrEXucckBgS6gk"
QUERY = "is the death penalty good or bad"
TARGET_COMMENTS = 20000
BATCH_SAVE = 1000  # save every 1000 comments
MAX_VIDEO_RESULTS = 50
RELEVANCE_LANGUAGE = "en"

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
        maxResults=MAX_VIDEO_RESULTS,
        relevanceLanguage=RELEVANCE_LANGUAGE
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

                comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                comments.append(comment)

            request = youtube.commentThreads().list_next(request, response)

    except HttpError:

        print(f"Skipping {video_id} — comments disabled.")

    return comments


# ---------------- MAIN CRAWLER ----------------
video_ids = get_videos(QUERY, max_videos=1000)

dataset = []

for i, vid in enumerate(video_ids):

    comments = get_all_comments(vid)

    for comment in comments:

        if not is_english(comment):
            continue

        label = label_comment(comment)

        if label:
            dataset.append([comment.replace("\n"," "), label])

    print(f"{i+1}/{len(video_ids)} videos processed | comments collected: {len(dataset)}")

    if len(dataset) >= TARGET_COMMENTS:
        print("Reached target!")
        break


# ---------------- REMOVE DUPLICATES ----------------
df = pd.DataFrame(dataset).drop_duplicates()


# ---------------- SAVE CSV ----------------
df.to_csv(
    "youtube_death_penalty_dataset.csv",
    index=False,
    header=False
)

print("Finished!")
print("Total labeled comments:", len(df))