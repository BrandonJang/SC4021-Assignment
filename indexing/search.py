from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "death_penalty_comments"

def search(query, start_date=None, end_date=None, top_k=10):
    """
    Search for comments with optional date range filtering.
    Dates should be in 'YYYY-MM-DD' format.
    """
    
    # Base query structure using bool
    search_query = {
        "bool": {
            "must": [
                {
                    "match": {
                        "comment": query
                    }
                }
            ],
            "filter": []
        }
    }
    
    # Add date range filter if provided
    if start_date or end_date:
        date_filter = {
            "range": {
                "published_at": {}
            }
        }
        if start_date:
            date_filter["range"]["published_at"]["gte"] = start_date
        if end_date:
            date_filter["range"]["published_at"]["lte"] = end_date
        
        search_query["bool"]["filter"].append(date_filter)

    response = es.search(
        index=INDEX_NAME,
        query=search_query,
        size=top_k
    )
    return response["hits"]["hits"]

if __name__ == "__main__":
    # Test 1: Keyword search only (Existing functionality)
    query_text = "death penalty"
    print(f"--- Standard Search: '{query_text}' ---")
    results = search(query_text)
    for hit in results[:3]:
        print(f"[{hit['_source']['published_at']}] Score: {hit['_score']:.2f} | {hit['_source']['comment']}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Timeline Search (Search within 2023-2024)
    start = "2023-01-01"
    end = "2024-12-31"
    print(f"--- Timeline Search: '{query_text}' between {start} and {end} ---")
    
    try:
        results = search(query_text, start_date=start, end_date=end)
        if not results:
            print("No results found in this time window.")
        
        for hit in results:
            source = hit["_source"]
            print(f"[{source['published_at']}] Score: {hit['_score']:.2f} | {source['comment']}")
            
    except Exception as e:
        print(f"Error during search: {e}")