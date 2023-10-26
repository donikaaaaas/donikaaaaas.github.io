var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
    <div style="width: 100%; height: 100%;">
      <button id="openButton">Open Chart</button>
      <div id="chartContainer" style="display: none;">
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      </div>
    </div>
  `;

  class CustomPieSample extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));

      this._root = this._shadowRoot.getElementById("root");
      this._chartContainer = this._shadowRoot.getElementById("chartContainer");
      this._openButton = this._shadowRoot.getElementById("openButton");

      this._myDataSource = null; // Initialize _myDataSource
      this._chartOpened = false;

      this._openButton.addEventListener("click", () => {
        if (!this._chartOpened) {
          this._chartOpened = true;
          this._chartContainer.style.display = "block";
          this.renderChart();
        }
      });
    }

    onCustomWidgetResize(width, height) {
      this.renderChart();
    }

    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      this.renderChart();
    }

    async renderChart() {
      if (!this._chartOpened) {
        return;
      }

      await getScriptPromisify(
        "https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js"
      );

      if (!this._myDataSource || this._myDataSource.state !== "success") {
        return;
      }

      const dimension = this._myDataSource.metadata.feeds.dimensions.values[0];
      const measure = this._myDataSource.metadata.feeds.measures.values[0];
      const data = this._myDataSource.data.map((data) => {
        return {
          name: data[dimension].label,
          value: data[measure].raw,
        };
      });

      const myChart = echarts.init(this._root, "light"); // Specify 'light' theme
      const option = {
        backgroundColor: "#ffffff",
        title: {
          text: "Modified Customized Pie 4P",
          subtext: "DS",
          left: "center",
          top: 20,
          textStyle: {
            color: "#000000",
          },
        },
        tooltip: {
          trigger: "item",
        },
        series: [
          {
            name: "Access from",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      myChart.setOption(option);
    }
  }

  customElements.define("com-sap-sample-echarts-custom_pie_chart", CustomPieSample);
})();
