package com.example.demo.model;

import java.util.Map;
import org.apache.solr.common.SolrDocumentList;

public class SearchResponse {
    private SolrDocumentList results;
    private Map<String, Integer> wordCloud;
    private int queryTime;
    private String spellcheckSuggestion;

    public SearchResponse(SolrDocumentList results, Map<String, Integer> wordCloud, int queryTime, String spellcheckSuggestion) {
        this.results = results;
        this.wordCloud = wordCloud;
        this.queryTime = queryTime;
        this.spellcheckSuggestion = spellcheckSuggestion;
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

    public String getSpellcheckSuggestion() {
        return spellcheckSuggestion;
    }

    public void setSpellcheckSuggestion(String spellcheckSuggestion) {
        this.spellcheckSuggestion = spellcheckSuggestion;
    }
}
