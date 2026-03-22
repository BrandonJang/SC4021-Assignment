package com.example.demo.model;

import java.util.Map;
import org.apache.solr.common.SolrDocumentList;

public class SearchResponse {
    private SolrDocumentList results;
    private Map<String, Integer> wordCloud;
    private int queryTime;

    public SearchResponse(SolrDocumentList results, Map<String, Integer> wordCloud, int queryTime) {
        this.results = results;
        this.wordCloud = wordCloud;
        this.queryTime = queryTime;
    }

    public SolrDocumentList getResults() {
        return results;
    }

    public void setResults(SolrDocumentList results) {
        this.results = results;
    }

    public Map<String, Integer> getWordCloud() {
        return wordCloud;
    }

    public void setWordCloud(Map<String, Integer> wordCloud) {
        this.wordCloud = wordCloud;
    }

    public int getQueryTime() {
        return queryTime;
    }

    public void setQueryTime(int queryTime) {
        this.queryTime = queryTime;
    }
}
