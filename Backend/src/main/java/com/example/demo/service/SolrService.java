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

    private String expandSynonyms(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return keyword;
        
        Map<String, String[]> synonymMap = new HashMap<>();        
        // Setup a few common argument synonyms for the dataset
        synonymMap.put("death penalty", new String[]{"execution", "capital punishment"});
        synonymMap.put("capital punishment", new String[]{"execution", "death penalty"});
        synonymMap.put("execution", new String[]{"death penalty", "capital punishment", "executed"});
        synonymMap.put("money", new String[]{"economy", "financial", "taxes", "cost", "expensive"});
        synonymMap.put("economy", new String[]{"money", "financial", "taxes", "cost"});
        synonymMap.put("religion", new String[]{"god", "bible", "faith", "christian", "islam"});
        synonymMap.put("race", new String[]{"racial", "racism", "black", "minority", "discrimination"});
        synonymMap.put("racism", new String[]{"racial", "race", "black", "minority", "discrimination"});
        
        String expanded = keyword;
        String lowerKeyword = keyword.toLowerCase();
        
        for (Map.Entry<String, String[]> entry : synonymMap.entrySet()) {
            if (lowerKeyword.contains(entry.getKey())) {
                expanded += " " + String.join(" ", entry.getValue());
            }
        }
        return expanded;
    }

    public QueryResponse search(String keyword, String sentiment, String startDate, String endDate, String country, String category, Integer maxResults) throws Exception {
        SolrQuery query = new SolrQuery();

        List<Double> queryVector = getEmbedding(keyword);

        // --- Search Resiliency: Synonym Expansion ---
        String expandedKeyword = expandSynonyms(keyword);

        // --- Search Resiliency: Typo Tolerance (Fuzzy Matching) ---
        // We append ~1 for words > 3 chars, and ~2 for words > 6 chars to handle typos natively in BM25
        String fuzzyKeyword = Arrays.stream(expandedKeyword.split("\\s+"))
                .map(w -> {
                    String clean = w.replaceAll("[^a-zA-Z0-9]", "");
                    if (clean.length() > 6) return clean + "~2";
                    if (clean.length() > 3) return clean + "~1";
                    return clean.isEmpty() ? w : clean;
                })
                .collect(Collectors.joining(" "));
        
        // Combine raw keyword (for exact phrases/quotes) + fuzzy expanded terms
        String robustKeyword = keyword + " " + fuzzyKeyword;

        if (queryVector != null && !queryVector.isEmpty()) {
            // Hybrid Approach: Keyword matches combined with Semantic similarity
            query.set("q", "{!bool should=$kw_query should=$knn_query}");
            query.set("kw_query", "{!edismax qf='comment^2' v=$kw_val}");
            query.set("kw_val", robustKeyword);
            query.set("knn_query", "{!knn f=comment_vector topK=100}" + queryVector.toString());
        } else {
            // Fallback purely to eDisMax keyword search
            query.set("defType", "edismax");
            query.set("q", "comment:(" + robustKeyword + ")");
            query.set("qf", "comment^2");
        }

        query.setRows(maxResults != null ? maxResults : 100);

        if (sentiment != null && !sentiment.equalsIgnoreCase("All Sentiments")) {
            query.addFilterQuery("sentiment:" + sentiment.toLowerCase());
        }

        if ((startDate != null && !startDate.isEmpty()) || (endDate != null && !endDate.isEmpty())) {
            String start = (startDate != null && !startDate.isEmpty()) ? startDate + "T00:00:00Z" : "*";
            String end = (endDate != null && !endDate.isEmpty()) ? endDate + "T23:59:59Z" : "*";
            query.addFilterQuery("published_at:[" + start + " TO " + end + "]");
        }

        if (country != null && !country.isEmpty() && !country.equalsIgnoreCase("All Countries")) {
            query.addFilterQuery("countries:" + country.toLowerCase());
        }

        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All Categories")) {
            // we use exact phrase matching for category since it contains spaces
            query.addFilterQuery("category:\"" + category + "\"");
        }

        System.out.println("Executing Solr Hybrid Query: " + solrClient.query(query, org.apache.solr.client.solrj.SolrRequest.METHOD.POST));
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

    public int extractQTime(QueryResponse response) {
        Object qTimeObj = response.getResponseHeader().get("QTime");
        return (qTimeObj instanceof Integer) ? (Integer) qTimeObj : 0;
    }
}