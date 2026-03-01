package com.example.demo.service;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.springframework.stereotype.Service;

@Service
public class SolrService {

    private final SolrClient solrClient;

    public SolrService() {
        // Use your actual core name here
        String solrUrl = "http://localhost:8983/solr/document";
        this.solrClient = new HttpSolrClient.Builder(solrUrl).build();
    }

    public QueryResponse search(String keyword, String source, String sentiment) throws Exception {
        SolrQuery query = new SolrQuery();

        query.set("defType", "edismax");
        query.set("q", keyword);
        query.set("qf", "title^2 content");

        if (!"All Sources".equals(source)) {
            query.addFilterQuery("source:" + source.toLowerCase());
        }

        if (!"All Sentiments".equals(sentiment)) {
            query.addFilterQuery("sentiment:" + sentiment.toLowerCase());
        }
        System.out.println("Executing Solr query: " + query);
        System.out.println("Query parameters: " + query.getQuery());
        System.out.println(solrClient.query(query));
        return solrClient.query(query);
    }
}