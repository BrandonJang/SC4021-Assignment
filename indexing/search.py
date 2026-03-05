from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "death_penalty_comments"

def search(query, top_k=10):
    response = es.search(
        index=INDEX_NAME,
        query={
            "match": {
                "comment": query
            }
        },
        size=top_k
    )
    return response["hits"]["hits"]

if __name__ == "__main__":
    # The sample data contains "Death penalty deters crime" and "Some criminals deserve death penalty"
    query = "death penalty"
    print(f"Searching for: '{query}'\n")
    
    try:
        results = search(query)
        if not results:
            print("No results found. Checking if index has data...")
            count = es.count(index=INDEX_NAME)["count"]
            print(f"Total documents in index '{INDEX_NAME}': {count}")
        
        for hit in results:
            source = hit["_source"]
            print(f"Score: {hit['_score']:.4f}")
            print(f"Comment: {source['comment']}")
            print(f"Likes: {source['likes']}")
            print("-" * 20)
    except Exception as e:
        print(f"Error during search: {e}")