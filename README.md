# SC4021-Assignment

## Project Overview
This project develops an search engine for exploring public perspectives on the death penalty using YouTube comments as the primary data source. It combines Apache Solr with hybrid search, fuzzy matching, and advanced filtering for effective information retrieval. A hierarchical sentiment analysis pipeline enhanced with hybrid features and stacked ensemble models improves classification performance. The system is deployed as a full-stack web application with interactive visualizations for deeper insight.

## Youtube Link - https://www.youtube.com/watch?v=IyyyV28RZY8

## System Architecture

The application follows a microservices-inspired architecture to separate concerns and optimize performance:

```mermaid
graph TD
    A[Frontend: React/Vite] -->|REST API| B[Backend: Spring Boot]
    B -->|Search/Filter| C[Search Engine: Apache Solr]
    B -->|Generate Embeddings| D[Embedding API: Python/Flask]
    D -->|Sentence Transformers| E[Embedding Model]
    F[Data Pipeline: Python] -->|Preprocessing & Vectorization| C
```

## Running the Application
### 1. Solr Setup
Ensure Apache Solr is running on your machine.
- Start Solr: `bin/solr start`
- Create the required core: `bin/solr create -c youtube_comments`
- Run the following command to insert the schema.
```powershell
curl.exe http://localhost:8983/solr/youtube_comments/schema `
  -X POST `
  -H "Content-type:application/json" `
  --data-binary "@yt_comments_schema.json"
```

### 2. Embedding API (Python)
This service must be running for both indexing and searching to work correctly.
```bash
# From the root directory
source .venv/bin/activate
pip install flask sentence-transformers
python embedding_api.py
```
*Note: The service runs on `http://localhost:5000`.*

### 3. Backend (Java/Spring Boot)
The backend manages the communication between the frontend and Solr, and interfaces with the embedding service.
```bash
cd Backend
./mvnw spring-boot:run
```
*Note: The backend runs on `http://localhost:8081`.*

### 4. Frontend (React/Vite)
The user interface for searching and visualizing results.
```bash
cd Frontend
npm install
npm run dev
```
*Note: The frontend runs on `http://localhost:5173`.*

## Data Pipeline & Indexing

To populate the system with data, run the indexing script which handles text cleaning, vector embedding generation, and classification:

```bash
python index_actual_data.py
```
*Note: Ensure Solr and the Embedding API are running before starting the indexing process.*
