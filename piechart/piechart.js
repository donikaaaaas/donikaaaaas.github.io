var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  const parseMetadata = metadata => {
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
    const dimensions = []
    for (const key in dimensionsMap) {
      const dimension = dimensionsMap[key]
      dimensions.push({ key, ...dimension })
    }
    const measures = []
    for (const key in measuresMap) {
      const measure = measuresMap[key]
      measures.push({ key, ...measure })
    }
    return { dimensions, measures, dimensionsMap, measuresMap }
  }

  const parseDataBinding = (dataBinding) => {
    const { data, metadata } = dataBinding
    const { dimensions, measures } = parseMetadata(metadata)

    const dataAxis = dimensions.map(dimension => dimension.key);
    const data = measures.map(measure => measure.key);

    return { data, dataAxis };
  }

  const getOption = (dataBinding) => {
    const { data, dataAxis } = parseDataBinding(dataBinding);

    const option = {
      title: {
        text: 'Feature Sample: Pie Chart',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: dataAxis,
      },
      series: [
        {
          name: 'Category',
          type: 'pie',
          radius: '50%',
          center: ['50%', '60%'],
          data: data.map((value, index) => ({
            value: value,
            name: dataAxis[index],
          })),
          emphasis: {
            scale: true,
            focus: 'series',
          },
          label: {
            show: true,
            formatter: '{b} ({d}%)',
          },
        },
      ],
    };

    return { option, data, dataAxis };
  }

  const template = document.createElement('template')
  template.innerHTML = `
    <style>
    </style>
    <div id="root" style="width: 100%; height: 100%;">
      <!-- Replace this div with the pie chart -->
      <div id="pie-chart" style="width: 100%; height: 100%;"></div>
    </div>
  `

  class Main extends HTMLElement {
    constructor() {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')

      this._props = {}

      this.render()
    }

    onCustomWidgetResize(width, height) {
      this.render()
    }

    onCustomWidgetAfterUpdate(changedProps) {
      this.render()
    }

    async render() {
      if (!window.echarts) {
        await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')
      }

      if (this._myChart) {
        echarts.dispose(this._myChart)
      }
      if (!this.myDataBinding || this.myDataBinding.state !== 'success') { return }

      const myChart = this._myChart = echarts.init(this._root.querySelector('#pie-chart')); // Select the pie chart div
      const { option } = getOption(this.myDataBinding)
      myChart.setOption(option)
    }
  }

  customElements.define('com-sap-sample-echarts-pie-chart', Main)
})();
