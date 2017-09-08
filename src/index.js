import 'font-awesome/css/font-awesome.css';
import { WidgetManager } from './manager';

import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services';

const BASE_URL = prompt('Notebook BASEURL', 'http://localhost:8889');
const WS_URL =
  'ws:' +
  BASE_URL.split(':')
    .slice(1)
    .join(':');

const WIDGET_MSG = 'application/vnd.jupyter.widget-view+json';

document.addEventListener('DOMContentLoaded', event => {
  // Connect to the notebook webserver.
  const serverSettings = ServerConnection.makeSettings({
    baseUrl: BASE_URL,
    wsUrl: WS_URL,
  });

  Kernel.getSpecs(serverSettings)
    .then(kernelSpecs => {
      return Kernel.startNew({
        name: kernelSpecs.default,
        serverSettings,
      });
    })
    .then(kernel => {
      const $code = $('.code_cell .input_area');

      // Create the widget area and widget manager
      const $widgetAreas = $('.output_widget_view');
      const manager = new WidgetManager(kernel, $widgetAreas);

      // Run backend code to create the widgets.  You could also create the
      // widgets in the frontend, like the other widget examples demonstrate.

      const codeLines = $code.map((index, cell) => cell.textContent).get();

      codeLines.forEach((code, i) => {
        // This might break because of out-of-order code execution...
        const execution = kernel.requestExecute({ code });

        execution.onIOPub = msg => {
          // If we have a display message, display the widget.
          console.log(i, msg);
          if (KernelMessage.isDisplayDataMsg(msg)) {
            let widgetData = msg.content.data[WIDGET_MSG];
            if (widgetData !== undefined && widgetData.version_major === 2) {
              let model = manager.get_model(widgetData.model_id);
              if (model !== undefined) {
                model.then(model => {
                  manager.display_model(msg, model);
                });
              }
            }
          }
        };
      });
    });
});
