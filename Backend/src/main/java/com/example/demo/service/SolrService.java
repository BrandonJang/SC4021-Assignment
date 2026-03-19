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
        String solrUrl = "http://localhost:8983/solr/youtube_comments";
        this.solrClient = new HttpSolrClient.Builder(solrUrl).build();
    }

        public QueryResponse search(String keyword, String sentiment, String date, String country, Integer maxResults) throws Exception {
        SolrQuery query = new SolrQuery();

            query.set("defType", "edismax");
            query.set("q", "comment:" + keyword + "");
            query.set("qf", "comment^2");
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
            return solrClient.query(query);
    }
}