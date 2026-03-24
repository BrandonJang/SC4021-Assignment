import pandas as pd
import requests
import json
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import math

def main():
    print("Loading embedding model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Loading zero-shot classifier 'facebook/bart-large-mnli' (This may take a minute to download)...")
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    candidate_labels = ["Economics", "Ethics", "Religion", "Social Justice", "Politics", "General/Agreed"]
    
    # We found your actual dataset here:
    csv_file = 'Data_preprocessing/youtube_comments_with_countries_and_states.csv'
    solr_url = 'http://localhost:8983/solr/youtube_comments/update?commit=true'
    headers = {'Content-type': 'application/json'}
    
    print(f"\nReading {csv_file}...")
    try:
        df = pd.read_csv(csv_file)
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return

    # In case there's no dedicated 'id', Solr needs one. We'll use the pandas index.
    # Also ensuring we handle NaNs cleanly
    df = df.fillna("")

    batch_size = 500
    documents = []
    
    total_rows = len(df)
    print(f"Found {total_rows} rows. Generating vectors and uploading in batches of {batch_size}...\n")
    
    for index, row in df.iterrows():
        # The Java backend specifically searches against the 'comment' field
        comment_text = str(row.get('comment', '')).strip()
        
        doc = row.to_dict()
        doc['id'] = str(index) # Ensure a unique ID exists for Solr
        
        # If there is a comment, embed it and categorize it
        if comment_text:
            doc['comment_vector'] = model.encode(comment_text).tolist()
            
            try:
                # Text classifiers have token limits, safeguard by truncating
                short_text = comment_text[:1000]
                result = classifier(short_text, candidate_labels)
                doc['category'] = result['labels'][0]  # Take the highest scoring category
            except Exception as e:
                doc['category'] = "Unknown"
        else:
            doc['category'] = "Unknown"
            
        documents.append(doc)
        
        # Upload when we hit the batch size
        if len(documents) >= batch_size:
            print(f"Uploading batch {math.ceil(index/batch_size)} to Solr...")
            resp = requests.post(solr_url, json=documents, headers=headers)
            if resp.status_code != 200:
                print(f"Error uploading batch: {resp.text}")
            documents = []
            
    # Upload the remaining documents
    if documents:
        print(f"Uploading final batch to Solr...")
        resp = requests.post(solr_url, json=documents, headers=headers)
        if resp.status_code != 200:
                print(f"Error uploading batch: {resp.text}")
                
    print("\nIndexing complete! Your actual data is now in Solr with vector embeddings.")

if __name__ == '__main__':
    main()
