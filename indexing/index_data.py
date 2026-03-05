import pandas as pd
from elasticsearch import Elasticsearch, helpers
import os

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "death_penalty_comments"

# Use absolute paths or paths relative to the assignment root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "youtube_death_penalty_comments.csv")
SAMPLE_DATA_PATH = os.path.join(BASE_DIR, "data", "sample_data.csv")

def index_data():
    if os.path.exists(DATA_PATH):
        path = DATA_PATH
    elif os.path.exists(SAMPLE_DATA_PATH):
        print(f"Warning: {DATA_PATH} not found. Falling back to {SAMPLE_DATA_PATH}")
        path = SAMPLE_DATA_PATH
    else:
        print(f"Error: Could not find data file at {DATA_PATH} or {SAMPLE_DATA_PATH}")
        return

    print(f"Loading data from {path}...")
    df = pd.read_csv(path)
    
    # Prepare actions for bulk indexing
    actions = [
        {
            "_index": INDEX_NAME,
            "_id": row["video_id"],  # Use video_id as unique document ID to prevent duplicates
            "_source": {
                "comment": row["comment"],
                "likes": row["likes"],
                "published_at": row["published_at"],
                "video_id": row["video_id"]
            }
        }
        for _, row in df.iterrows()
    ]
    
    # Bulk index
    success, _ = helpers.bulk(es, actions)
    print(f"Successfully indexed {success} documents.")

if __name__ == "__main__":
    index_data()