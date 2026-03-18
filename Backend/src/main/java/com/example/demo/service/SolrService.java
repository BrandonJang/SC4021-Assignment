package com.example.demo.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SolrService {

    private final SolrClient solrClient;

    public SolrService() {
        // Use your actual core name here
        String solrUrl = "http://localhost:8983/solr/youtube_comments";
        this.solrClient = new HttpSolrClient.Builder(solrUrl).build();
    }

    // public QueryResponse search(String keyword, String source, String sentiment) throws Exception {
    //     SolrQuery query = new SolrQuery();

    //     query.set("defType", "edismax");
    //     query.set("q", keyword);
    //     query.set("qf", "title^2 content");

    //     if (!"All Sources".equals(source)) {
    //         query.addFilterQuery("source:" + source.toLowerCase());
    //     }

    //     if (!"All Sentiments".equals(sentiment)) {
    //         query.addFilterQuery("sentiment:" + sentiment.toLowerCase());
    //     }
    //     System.out.println("Executing Solr query: " + query);
    //     System.out.println("Query parameters: " + query.getQuery());
    //     System.out.println(solrClient.query(query));
    //     return solrClient.query(query);
    // }

    private List<Double> getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) return null;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "http://localhost:5000/embed";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Escape quotes inside text to ensure valid JSON payload
            String safeText = text.replace("\"", "\\\"");
            String requestJson = "{\"text\":\"" + safeText + "\"}";
            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return (List<Double>) response.getBody().get("vector");
        } catch (Exception e) {
            System.err.println("Failed to connect to Python embedding service: " + e.getMessage());
            return null; // Fallback to keyword search if API is down
        }
    }

    public QueryResponse search(String keyword, String sentiment, String date, String country, Integer maxResults) throws Exception {
        SolrQuery query = new SolrQuery();

        List<Double> queryVector = getEmbedding(keyword);

        if (queryVector != null && !queryVector.isEmpty()) {
            // Hybrid Approach: Keyword matches combined with Semantic similarity
            query.set("q", "{!bool should=$kw_query should=$knn_query}");
            query.set("kw_query", "{!edismax qf='comment^2' v=$kw_val}");
            query.set("kw_val", keyword);
            query.set("knn_query", "{!knn f=comment_vector topK=100}" + queryVector.toString());
        } else {
            // Fallback purely to eDisMax keyword search
            query.set("defType", "edismax");
            query.set("q", "comment:" + keyword);
            query.set("qf", "comment^2");
        }

        query.setRows(maxResults != null ? maxResults : 100);

        if (sentiment != null && !sentiment.equalsIgnoreCase("All Sentiments")) {
            query.addFilterQuery("sentiment:" + sentiment.toLowerCase());
        }

        if (date != null && !date.isEmpty()) {
            query.addFilterQuery("published_at:[" + date + "T00:00:00Z TO *]");
        }

        if (country != null && !country.isEmpty() && !country.equalsIgnoreCase("All Countries")) {
            query.addFilterQuery("countries:" + country.toLowerCase());
        }

        System.out.println("Executing Solr Hybrid Query: " + query);
        // Use POST instead of GET to prevent HTTP 414 "URI Too Long" errors from large vector arrays
        return solrClient.query(query, org.apache.solr.client.solrj.SolrRequest.METHOD.POST);
    }

    public Map<String, Integer> getWordFrequencies(QueryResponse response) {
        Map<String, Integer> frequencies = new HashMap<>();
        Set<String> stopWords = new HashSet<>(Arrays.asList(
            "the", "and", "a", "to", "of", "in", "is", "it", "that", "on", "for", "with", "as", "was", "are", "be", "this", "by", "at", "or", "from", "an", "have", "not", "but", "what", "all", "were", "we", "when", "your", "can", "if", "their", "which", "about", "more", "my", "out", "so", "up", "into", "no", "how", "has", "do", "will"
        ));

        for (SolrDocument doc : response.getResults()) {
            Object commentObj = doc.getFieldValue("comment");
            if (commentObj != null) {
                List<String> comments = new ArrayList<>();
                if (commentObj instanceof String) {
                    comments.add((String) commentObj);
                } else if (commentObj instanceof Collection) {
                    for (Object o : (Collection<?>) commentObj) {
                        if (o instanceof String) {
                            comments.add((String) o);
                        }
                    }
                }

                for (String comment : comments) {
                    String[] words = comment.toLowerCase().replaceAll("[^a-zA-Z ]", "").split("\\s+");
                    for (String word : words) {
                        if (word.length() > 2 && !stopWords.contains(word)) {
                            frequencies.put(word, frequencies.getOrDefault(word, 0) + 1);
                        }
                    }
                }
            }
        }

        return frequencies.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(50)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }
}