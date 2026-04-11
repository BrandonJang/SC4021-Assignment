import json
import sys

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print("Error: The 'sentence-transformers' library is not installed.")
    print("Please install it by running: pip install sentence-transformers")
    sys.exit(1)

def main():
    print("Loading embedding model 'all-MiniLM-L6-v2' (this may take a moment to download on the first run)...")
    # This is a very popular, lightweight, and fast model for semantic search
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    input_file = 'dummy_data.json'
    output_file = 'dummy_data_with_vectors.json'
    
    print(f"Reading data from {input_file}...")
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {input_file} not found in the current directory.")
        return

    print(f"Generating embeddings for {len(data)} items...")
    for i, item in enumerate(data):
        # We embed the 'content' field since that contains the meat of the text.
        text_to_embed = item.get('content', '')
        if text_to_embed:
            # model.encode returns a numpy array; we convert to list to save it as JSON
            vector = model.encode(text_to_embed).tolist()
            item['comment_vector'] = vector
            
        print(f"Processed item {i + 1}/{len(data)} (ID: {item.get('id')})")
            
    print(f"Writing updated data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print("\nSuccess! Your data now includes a 'comment_vector' field.")
    print(f"You can now use '{output_file}' to index into Solr.")

if __name__ == '__main__':
    main()
