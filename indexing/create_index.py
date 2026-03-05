from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")
INDEX_NAME = "death_penalty_comments"

mapping = {
    "mappings": {
        "properties": {
            "comment": {"type": "text"},
            "likes": {"type": "integer"},
            "published_at": {"type": "date"},
            "video_id": {"type": "keyword"}
        }
    }
}

def create_index():
    try:
        # Check if index exists - using the newer syntax
        if not es.indices.exists(index=INDEX_NAME):
            # Using keyword arguments for mapping fields
            es.indices.create(
                index=INDEX_NAME,
                mappings=mapping["mappings"]
            )
            print(f"Index created: {INDEX_NAME}")
        else:
            print(f"Index '{INDEX_NAME}' already exists.")
    except Exception as e:
        print(f"Error creating index: {e}")

if __name__ == "__main__":
    create_index()