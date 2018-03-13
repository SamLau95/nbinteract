"""
Preprocessors for nbconvert.

This file currently only exports a subclass of nbconvert.ExecutePreprocessor
that corrently generates widgets for ipywidgets.interact() calls.

https://github.com/SamLau95/nbinteract/issues/60
"""

__all__ = ['NbiExecutePreprocessor']

from queue import Empty
from nbconvert.preprocessors.execute import ExecutePreprocessor
from nbformat.v4 import output_from_msg


class NbiExecutePreprocessor(ExecutePreprocessor):
    """
    Executes all cells in a notebook, leaving widget JSON intact for
    ipywidgets.interact() calls.

    When ipywidgets.interact() is called, it first executes IPython.display()
    on its widgets to generate widget output. However, it then calls
    IPython.clear_output() on its cell in order to correctly get rid of the
    previous function output. While this works in a notebook environment
    because the ipywidgets nbextension will preserve the widget as an HTML
    element, when running the ExecutePreprocessor this clears the widget
    output and leaves only the result of the function call in the cell.

    This class only overrides the run_cell() method from the
    ExecutePreprocessor to ignore 'clear_output' messages from the kernel.
    Although this in theory will break cells that clear their own output, this
    occurs infrequently in practice.
    """

    def run_cell(self, cell, cell_index=0):
        msg_id = self.kc.execute(cell.source)
        self.log.debug("Executing cell:\n%s", cell.source)
        exec_reply = self._wait_for_reply(msg_id, cell)

        outs = cell.outputs = []

        while True:
            try:
                # We've already waited for execute_reply, so all output
                # should already be waiting. However, on slow networks, like
                # in certain CI systems, waiting < 1 second might miss messages.
                # So long as the kernel sends a status:idle message when it
                # finishes, we won't actually have to wait this long, anyway.
                msg = self.kc.iopub_channel.get_msg(timeout=self.iopub_timeout)
            except Empty:
                self.log.warn("Timeout waiting for IOPub output")
                if self.raise_on_iopub_timeout:
                    raise RuntimeError("Timeout waiting for IOPub output")
                else:
                    break
            if msg['parent_header'].get('msg_id') != msg_id:
                # not an output from our execution
                continue

            msg_type = msg['msg_type']
            self.log.debug("output: %s", msg_type)
            content = msg['content']

            # set the prompt number for the input and the output
            if 'execution_count' in content:
                cell['execution_count'] = content['execution_count']

            if msg_type == 'status':
                if content['execution_state'] == 'idle':
                    break
                else:
                    continue
            elif msg_type == 'execute_input':
                continue
            elif msg_type == 'clear_output':
                # These lines of code are the only ones changed from the
                # original implementation. Instead of actually clearing the
                # cell output which also clears the widget when interact() is
                # called, we continue.
                continue
            elif msg_type.startswith('comm'):
                continue

            display_id = None
            if msg_type in {
                'execute_result', 'display_data', 'update_display_data'
            }:
                self.log.debug("    msg: %s", msg['content'])
                display_id = msg['content'].get('transient',
                                                {}).get('display_id', None)
                if display_id:
                    self._update_display_id(display_id, msg)
                if msg_type == 'update_display_data':
                    # update_display_data doesn't get recorded
                    continue

            try:
                out = output_from_msg(msg)
            except ValueError:
                self.log.error("unhandled iopub msg: " + msg_type)
                continue
            if display_id:
                # record output index in:
                #   _display_id_map[display_id][cell_idx]
                cell_map = self._display_id_map.setdefault(display_id, {})
                output_idx_list = cell_map.setdefault(cell_index, [])
                output_idx_list.append(len(outs))

            outs.append(out)

        return exec_reply, outs
