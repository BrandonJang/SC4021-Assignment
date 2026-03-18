package com.example.demo.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.springframework.stereotype.Service;

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

    /**
     * Returns true when the keyword looks like a comparative / informational query
     * (e.g. "how does X differ across countries", "compare A and B").
     */
    private boolean isComparativeQuery(String keyword) {
        if (keyword == null) return false;
        String lower = keyword.toLowerCase();
        return lower.contains("differ") ||
               lower.contains("difference") ||
               lower.contains("compare") ||
               lower.contains("comparison") ||
               lower.contains("across") ||
               lower.contains("countries") ||
               lower.contains("versus") ||
               lower.contains(" vs ");
    }

    public QueryResponse search(String keyword, String sentiment, String date, String country, Integer maxResults) throws Exception {
        SolrQuery query = new SolrQuery();

        boolean comparative = isComparativeQuery(keyword);

        query.set("defType", "edismax");
        query.set("q", "comment:" + keyword);
        query.setRows(maxResults != null ? maxResults : 100);

        if (comparative) {
            // Stronger field & phrase boosting for analytical content
            query.set("qf", "comment^3");
            // Phrase boost: reward exact phrase matches heavily
            query.set("pf", "comment^10");
            query.set("ps", "5");   // phrase slop – allow up to 5 words apart
            // Boost longer comments (more explanatory content)
            query.set("bf", "log(sum(comment_length,1))");
            // Down-rank very short posts (< ~30 chars) with a negative boost
            query.set("bq", "_query_:\"{!frange l=30}comment_length\"^-2");
        } else {
            // Standard ranking
            query.set("qf", "comment^2");
        }

        if (sentiment != null && !sentiment.equalsIgnoreCase("All Sentiments")) {
            query.addFilterQuery("sentiment:" + sentiment.toLowerCase());
        }

        if (date != null && !date.isEmpty()) {
            query.addFilterQuery("published_at:[" + date + "T00:00:00Z TO *]");
        }

        if (country != null && !country.isEmpty() && !country.equalsIgnoreCase("All Countries")) {
            query.addFilterQuery("countries:" + country.toLowerCase());
        }

        System.out.println("Comparative query detected: " + comparative);
        System.out.println("Executing Solr query: " + query);
        System.out.println("Query parameters: " + query.getQuery());
        System.out.println(solrClient.query(query));
        return solrClient.query(query);
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