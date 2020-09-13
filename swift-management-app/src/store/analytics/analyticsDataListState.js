const chartColors = ['#7367F0', '#28C76F', '#EA5455', '#FF9F43', '#1E1E1E']

export default {
  currentOrders: {
    series: [{
      name: 'Orders',
      data: [28, 40, 36, 52, 38, 60, 55]
    }],
    analyticsData: {
      count: 23
    }
  },
  topItems: [{
      id: 1,
      name: 'Hawaian',
      ratio: 50,
      growthPerc: '5'
    },
    {
      id: 3,
      name: 'Quattro',
      ratio: 8,
      growthPerc: '-2'
    },
    {
      id: 2,
      name: 'Regina',
      ratio: 19,
      growthPerc: '1'
    },
    {
      id: 4,
      name: 'BBQ Chicken',
      ratio: 27,
      growthPerc: '-5'
    },
  ],
  CustomerCount: {
    series: [{
        name: 'Check-in',
        data: [31, 40, 28, 51, 42, 109, 100]
      }, {
        name: 'Check-out',
        data: [-11, -32, -45, -32, -34, -52, -41]
      },
      {
        name: 'Available',
        data: [20, 28, 11, 21, 20, 50, 20]
      }
    ],
    chartOptions: {
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      colors: chartColors,
      xaxis: {
        type: 'datetime',
        categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00",
          "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00",
          "2018-09-19T06:30:00"
        ],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },

      }
    }
  },
}