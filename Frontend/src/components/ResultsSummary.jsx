  import ReactECharts from "echarts-for-react";
  import WorldMap from "./WorldMap";
  import countries_and_states_geolocation from "./countries_and_states_geolocation";
  import WordCloud from "./WordCloud";
  import { useEffect } from "react";

  export default function ResultsSummary({ stats, wordCloud, onRenderComplete }) {
    let positive = 0, neutral = 0, negative = 0;
    let timeSeries = {};
    const countryCounts = {};

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

      if (item.countries) {
          let countriesArr = [];
          if (Array.isArray(item.countries)) {
            countriesArr = item.countries;
          } else if (typeof item.countries === "string") {
            try {
              const parsed = JSON.parse(item.countries);
              if (Array.isArray(parsed)) {
                countriesArr = parsed;
              } else {
                countriesArr = [item.countries];
              }
            } catch {
              countriesArr = [item.countries];
            }
          }
        countriesArr.forEach(c => {
          if (!c) return;

          if (typeof c === "string" && c.includes(",")) {
            c.split(",").forEach(part => {
              const clean = part.trim();
              if (!clean) return;

              if (!countryCounts[clean]) countryCounts[clean] = 0;
              countryCounts[clean]++;
            });

          } else {
            const clean = c.trim();
            if (!clean) return;

            if (!countryCounts[clean]) countryCounts[clean] = 0;
            countryCounts[clean]++;
          }
        });
        }
      });
    } else {
      positive = stats.positive || 0;
      neutral = stats.neutral || 0;
      negative = stats.negative || 0;
    }

    const sortedDates = Object.keys(timeSeries).sort((a, b) => new Date(a) - new Date(b));
    const lineData = {
      dates: sortedDates,
      positive: sortedDates.map(date => timeSeries[date].positive),
      neutral: sortedDates.map(date => timeSeries[date].neutral),
      negative: sortedDates.map(date => timeSeries[date].negative),
    };

    const pieOption = {
      color: ["#22c55e", "#eab308", "#ef4444"],
      legend: { data: ['Positive', 'Neutral', 'Negative'] },
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
            show: true,
            position: 'inside',
            formatter: '{d}%',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14
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

  const countryMarkers = Object.entries(countryCounts).map(([name, count]) => {
      const cleanName = name
      .trim()
      .replace(/^"+|"+$/g, "")
      .toLowerCase();

      const geo = countries_and_states_geolocation.find(
        c => c.name.toLowerCase() === cleanName
      );

      if (!geo) return null;
      return { name, lat: geo.lat, lng: geo.lng, count };
    }).filter(Boolean);

    useEffect(() => {
      if (onRenderComplete) {
        requestAnimationFrame(() => onRenderComplete());
      }
    }, [stats]);

  return (
    <div className="space-y-8">
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
      
      <div className="flex justify-center items-center w-full h-5/12">
        <div className="w-1/1 h-80 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Geographical Distribution</h3>
          <div className="w-full h-full">
            <WorldMap countryMarkers={countryMarkers} />
          </div>
        </div>
      </div>
    </div>
  );
}