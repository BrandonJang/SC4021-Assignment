
import React from "react";
import ReactECharts from "echarts-for-react";
import WordCloud from "./WordCloud";

export default function ResultsSummary({ stats, wordCloud }) {
  // Pie chart data
  let positive = 0, neutral = 0, negative = 0;
  // For line chart: group by year
  let timeSeries = {};
  if (Array.isArray(stats)) {
    stats.forEach(item => {
      if (item.sentiment === "positive") positive++;
      else if (item.sentiment === "neutral") neutral++;
      else if (item.sentiment === "negative") negative++;

      let yearLabel = item.published_at ? new Date(item.published_at).getFullYear().toString() : "Unknown";
      if (!timeSeries[yearLabel]) {
        timeSeries[yearLabel] = { positive: 0, neutral: 0, negative: 0 };
      }
      if (item.sentiment === "positive") timeSeries[yearLabel].positive++;
      else if (item.sentiment === "neutral") timeSeries[yearLabel].neutral++;
      else if (item.sentiment === "negative") timeSeries[yearLabel].negative++;
    });
  } else {
    positive = stats.positive || 0;
    neutral = stats.neutral || 0;
    negative = stats.negative || 0;
  }

  // Prepare data for line chart
  const sortedDates = Object.keys(timeSeries).sort((a, b) => new Date(a) - new Date(b));
  const lineData = {
    dates: sortedDates,
    positive: sortedDates.map(date => timeSeries[date].positive),
    neutral: sortedDates.map(date => timeSeries[date].neutral),
    negative: sortedDates.map(date => timeSeries[date].negative),
  };

  const pieOption = {
    color: ["#22c55e", "#eab308", "#ef4444"],
    series: [
      {
        name: 'Sentiment',
        type: 'pie',
        radius: '60%',
        data: [
          { value: positive, name: 'Positive' },
          { value: neutral, name: 'Neutral' },
          { value: negative, name: 'Negative' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
          color: '#fff',
        },
      }
    ]
  };

  const lineOption = {
    color: ["#22c55e", "#eab308", "#ef4444"],
    tooltip: { trigger: 'axis' },
    legend: { data: ['Positive', 'Neutral', 'Negative'] },
    xAxis: {
      type: 'category',
      data: lineData.dates,
      axisLabel: { color: '#fff' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#fff' },
    },
    series: [
      {
        name: 'Positive',
        type: 'line',
        data: lineData.positive,
        smooth: true,
      },
      {
        name: 'Neutral',
        type: 'line',
        data: lineData.neutral,
        smooth: true,
      },
      {
        name: 'Negative',
        type: 'line',
        data: lineData.negative,
        smooth: true,
      },
    ]
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
      <div className="bg-gray-800/50 rounded-2xl p-6 h-80 border border-gray-700/50 backdrop-blur-sm shadow-xl">
        <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Sentiment Distribution</h3>
        <ReactECharts option={pieOption} style={{ height: '220px', width: '100%' }} />
      </div>
      
      <div className="bg-gray-800/50 rounded-2xl p-6 h-80 border border-gray-700/50 backdrop-blur-sm shadow-xl">
        <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Sentiment Trends</h3>
        <ReactECharts option={lineOption} style={{ height: '220px', width: '100%' }} />
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-6 h-80 border border-gray-700/50 backdrop-blur-sm shadow-xl flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Top Search Terms</h3>
        <div className="flex-1 overflow-hidden">
          <WordCloud data={wordCloud} />
        </div>
      </div>
    </div>
  );
}