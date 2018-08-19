{#
This template doesn't load the nbinteract JS since it assumes that the
embedding page loads and sets up nbinteract.

This page produces basically the same output as

    jupyter nbconvert --to html --template basic

But replaces widgets with buttons to start nbinteract.
#}

{#
Extending basic.tpl unfortunately doesn't allow us to modify cell classes, so
we extend the lower-level display_priority.tpl instead.
 #}
{%- extends 'display_priority.tpl' -%}

{# Keep class in sync with util.js #}
{% set nbinteract_class = 'js-nbinteract-widget' %}

{% set nbinteract_button_text = 'Loading widgets...' %}

{#
Keep classes in sync with nbinteract_css.tpl.

The HIDDEN marker is for backwards-compatibility; nbi:hide_in is preferred now
#}
{% set nbinteract_markers = [
  {'marker': 'nbi:left', 'cls': 'nbinteract-left'},
  {'marker': 'nbi:right', 'cls': 'nbinteract-right'},
  {'marker': 'nbi:hide_in', 'cls': 'nbinteract-hide_in'},
  {'marker': 'nbi:hide_out', 'cls': 'nbinteract-hide_out'},
  {'marker': 'HIDDEN',  'cls':'nbinteract-hide_in'},
] %}
{% set nbinteract_default_cell_cls = 'nbinteract-row' %}

{# Add button at top to run all widgets #}
{% block body %}

{% if button_at_top %}
  <div class="cell text_cell">
    <button class="{{ nbinteract_class }}">
      Loading widgets...
    </button>
  </div>
{% endif %}

{{ super() }}
{% endblock body %}

{# Add loading button to widget output #}
{%- block data_widget_view scoped %}
  <div class="output_subarea output_widget_view {{ extra_class }}">
    <button class="{{ nbinteract_class }}">
      {{ nbinteract_button_text }}
    </button>
  </div>
{%- endblock data_widget_view -%}

{# Mark cells for left and right columns #}
{% block codecell %}

  {% set cell_classes = nbinteract_markers | selectattr("marker", "in", cell.source) | join(' ', attribute='cls') %}

  <div class="{{ cell_classes | default(nbinteract_default_cell_cls) }}
      cell border-box-sizing code_cell rendered">
    {{ super() }}
  </div>
{%- endblock codecell %}

{# Don't display prompts #}
{% block in_prompt -%}
{%- endblock in_prompt %}

{% block empty_in_prompt -%}
{%- endblock empty_in_prompt %}

{% block output_area_prompt %}
{%- endblock output_area_prompt %}

{# Don't output widget state #}
{% block footer %}
{% endblock footer %}

{# ######################################################################### #}
{# Unmodified blocks from basic.tpl                                          #}
{# ######################################################################### #}

{% block input_group -%}
<div class="input">
{{ super() }}
</div>
{% endblock input_group %}

{% block output_group %}
<div class="output_wrapper">
<div class="output">
{{ super() }}
</div>
</div>
{% endblock output_group %}

{#
  output_prompt doesn't do anything in HTML,
  because there is a prompt div in each output area (see output block)
#}
{% block output_prompt %}
{% endblock output_prompt %}

{% block input %}
<div class="inner_cell">
    <div class="input_area">
{{ cell.source | highlight_code(metadata=cell.metadata) }}
    </div>
</div>
{%- endblock input %}

{% block output %}
<div class="output_area">
{% if resources.global_content_filter.include_output_prompt %}
    {{ self.output_area_prompt() }}
{% endif %}
{{ super() }}
</div>
{% endblock output %}

{% block markdowncell scoped %}
<div class="cell border-box-sizing text_cell rendered">
{%- if resources.global_content_filter.include_input_prompt-%}
    {{ self.empty_in_prompt() }}
{%- endif -%}
<div class="inner_cell">
<div class="text_cell_render border-box-sizing rendered_html">
{{ cell.source  | markdown2html | strip_files_prefix }}
</div>
</div>
</div>
{%- endblock markdowncell %}

{% block unknowncell scoped %}
unknown type  {{ cell.type }}
{% endblock unknowncell %}

{% block execute_result -%}
{%- set extra_class="output_execute_result" -%}
{% block data_priority scoped %}
{{ super() }}
{% endblock data_priority %}
{%- set extra_class="" -%}
{%- endblock execute_result %}

{% block stream_stdout -%}
<div class="output_subarea output_stream output_stdout output_text">
<pre>
{{- output.text | ansi2html -}}
</pre>
</div>
{%- endblock stream_stdout %}

{% block stream_stderr -%}
<div class="output_subarea output_stream output_stderr output_text">
<pre>
{{- output.text | ansi2html -}}
</pre>
</div>
{%- endblock stream_stderr %}

{% block data_svg scoped -%}
<div class="output_svg output_subarea {{ extra_class }}">
{%- if output.svg_filename %}
<img src="{{ output.svg_filename | posix_path }}"
{%- else %}
{{ output.data['image/svg+xml'] }}
{%- endif %}
</div>
{%- endblock data_svg %}

{% block data_html scoped -%}
<div class="output_html rendered_html output_subarea {{ extra_class }}">
{{ output.data['text/html'] }}
</div>
{%- endblock data_html %}

{% block data_markdown scoped -%}
<div class="output_markdown rendered_html output_subarea {{ extra_class }}">
{{ output.data['text/markdown'] | markdown2html }}
</div>
{%- endblock data_markdown %}

{% block data_png scoped %}
<div class="output_png output_subarea {{ extra_class }}">
{%- if 'image/png' in output.metadata.get('filenames', {}) %}
<img src="{{ output.metadata.filenames['image/png'] | posix_path }}"
{%- else %}
<img src="data:image/png;base64,{{ output.data['image/png'] }}"
{%- endif %}
{%- set width=output | get_metadata('width', 'image/png') -%}
{%- if width is not none %}
width={{ width }}
{%- endif %}
{%- set height=output | get_metadata('height', 'image/png') -%}
{%- if height is not none %}
height={{ height }}
{%- endif %}
{%- if output | get_metadata('unconfined', 'image/png') %}
class="unconfined"
{%- endif %}
>
</div>
{%- endblock data_png %}

{% block data_jpg scoped %}
<div class="output_jpeg output_subarea {{ extra_class }}">
{%- if 'image/jpeg' in output.metadata.get('filenames', {}) %}
<img src="{{ output.metadata.filenames['image/jpeg'] | posix_path }}"
{%- else %}
<img src="data:image/jpeg;base64,{{ output.data['image/jpeg'] }}"
{%- endif %}
{%- set width=output | get_metadata('width', 'image/jpeg') -%}
{%- if width is not none %}
width={{ width }}
{%- endif %}
{%- set height=output | get_metadata('height', 'image/jpeg') -%}
{%- if height is not none %}
height={{ height }}
{%- endif %}
{%- if output | get_metadata('unconfined', 'image/jpeg') %}
class="unconfined"
{%- endif %}
>
</div>
{%- endblock data_jpg %}

{% block data_latex scoped %}
<div class="output_latex output_subarea {{ extra_class }}">
{{ output.data['text/latex'] }}
</div>
{%- endblock data_latex %}

{% block error -%}
<div class="output_subarea output_text output_error">
<pre>
{{- super() -}}
</pre>
</div>
{%- endblock error %}

{%- block traceback_line %}
{{ line | ansi2html }}
{%- endblock traceback_line %}

{%- block data_text scoped %}
<div class="output_text output_subarea {{ extra_class }}">
<pre>
{{- output.data['text/plain'] | ansi2html -}}
</pre>
</div>
{%- endblock -%}

{%- block data_javascript scoped %}
{% set div_id = uuid4() %}
<div id="{{ div_id }}"></div>
<div class="output_subarea output_javascript {{ extra_class }}">
<script type="text/javascript">
var element = $('#{{ div_id }}');
{{ output.data['application/javascript'] }}
</script>
</div>
{%- endblock -%}
