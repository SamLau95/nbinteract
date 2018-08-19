{# Renders CSS for nbinteract-specific layouting. Only included in full.tpl. #}
{# Keep classes in sync with plain.tpl #}
{%- macro nbinteract_css() -%}
    <style>
        .cell.nbinteract-left {
            width: 50%;
            float: left;
        }

        .cell.nbinteract-right {
            width: 50%;
            float: right;
        }

        .cell.nbinteract-hide_in > .input {
            display: none;
        }

        .cell.nbinteract-hide_out > .output_wrapper {
            display: none;
        }

        .cell:after {
          content: "";
          display: table;
          clear: both;
        }

        div.output_subarea {
            max-width: initial;
        }

        .jp-OutputPrompt {
            display: none;
        }
    </style>
{%- endmacro %}
