import pandas as pd
import requests
import json
from sentence_transformers import SentenceTransformer
import math

def main():
    print("Loading embedding model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # We found your actual dataset here:
    csv_file = 'Data_preprocessing/youtube_comments_with_countries.csv'
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
        
        # If there is a comment, embed it
        if comment_text:
            doc['comment_vector'] = model.encode(comment_text).tolist()
            
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
