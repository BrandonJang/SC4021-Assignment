package com.example.demo.controller;

import org.apache.solr.client.solrj.response.QueryResponse;
import com.example.demo.model.SearchResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.SolrService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchController {

    private final SolrService solrService;

    public SearchController(SolrService solrService) {
        this.solrService = solrService;
    }

        @GetMapping("/search")
        public SearchResponse search(
                @RequestParam String keyword,
                @RequestParam(required = false) String sentiment,
                @RequestParam(required = false) String startDate,
                @RequestParam(required = false) String endDate,
                @RequestParam(required = false) String country,
                @RequestParam(required = false) String category,
                @RequestParam(required = false) Integer maxResults
        ) throws Exception {
            QueryResponse response = solrService.search(keyword, sentiment, startDate, endDate, country, category, maxResults);
            return new SearchResponse(response.getResults(), solrService.getWordFrequencies(response));
    }

    @GetMapping("/test")
    public String test() {
        System.out.println("Received test request");
        return "Backend connected!";
    }
}