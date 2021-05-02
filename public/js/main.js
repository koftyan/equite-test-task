const reqForm = document.getElementById('reqForm');
reqForm.onsubmit = async function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    exchange: formData.get('exchange'),
    'symbols[]': formData.get('symbols[]').split(','),
    'dates[]': formData.get('dates[]').split(','),
  };
  console.log(serialize(data));
  const query = serialize(data);

  const url = `http://localhost:3000/price?${query}`;
  let res;
  try {
    res = await (await fetch(url)).json();
    console.log(res);
    if (res.statusCode && res.statusCode !== 200)
      throw new Error(res.message[0]);
    const lines = prepareData(res);
    console.log(lines);
    draw(lines);
  } catch (e) {
    alert(e);
  }
};
const draw = (data) => {
  var chart = new CanvasJS.Chart('viz', {
    title: {
      text: 'Prices',
    },
    legend: {
      cursor: 'pointer',
      verticalAlign: 'top',
      horizontalAlign: 'center',
      dockInsidePlotArea: true,
      itemclick: toogleDataSeries,
    },
    axisX: {
      title: 'Date',
      valueFormatString: 'YYYY-MM-DD',
    },
    axisY2: {
      logarithmic: true, //change it to false
      title: 'Price (Log)',
      titleFontColor: '#6D78AD',
      lineColor: '#6D78AD',
      gridThickness: 0,
      lineThickness: 1,
    },
    data: data,
  });
  chart.render();
  function toogleDataSeries(e) {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    chart.render();
  }
};
const prepareData = (res) => {
  const lines = [];
  for (const symbol in res) {
    if (res[symbol] === 'Invalid symbol')
      alert(`Invalid symbol ${symbol} for given exchange!`);
    const data = res[symbol];
    const dataPoints = [];
    for (const date in data) {
      const point = {};
      point.x = new Date(date);
      point.y = data[date];
      dataPoints.push(point);
    }
    lines.push({
      type: 'line',
      axisYType: 'secondary',
      name: symbol,
      showInLegend: true,
      markerSize: 0,
      dataPoints: dataPoints,
    });
  }
  return lines;
};
const serialize = function (obj, prefix) {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + '[' + p + ']' : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === 'object'
          ? serialize(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v),
      );
    }
  }
  return str.join('&');
};
