{#
Gitbook templates don't load the nbinteract JS since they use
gitbook-plugin-nbinteract instead.

This makes the gitbook template the simplest one.
#}

{%- extends 'basic.tpl' -%}

{# Keep class in sync with util.js #}
{% set nbinteract_class = 'js-nbinteract-widget' %}

{# Add loading button to widget output #}
{%- block data_widget_view scoped %}
<div class="output_subarea output_widget_view {{ extra_class }}">
  <button class="{{ nbinteract_class }}">
    Show Widget
  </button>
</div>
{%- endblock data_widget_view -%}

{# Don't display prompts #}
{% block in_prompt -%}
{%- endblock in_prompt %}

{% block empty_in_prompt -%}
{%- endblock empty_in_prompt %}

{% block output_area_prompt %}
{%- endblock output_area_prompt %}

{# Hide cells with # HIDDEN #}
{% block input %}
<div class="inner_cell"
  {% if '# HIDDEN' in cell.source %}style="display:none;"{% endif %}
>
    <div class="input_area">
{{ cell.source | highlight_code(metadata=cell.metadata) }}
</div>
</div>
{%- endblock input %}

{# Don't output widget state #}
{% block footer %}
{% endblock footer %}

{# Add button at top to run all widgets #}
{% block body %}

{# Keep class in sync with util.js #}
<div class="cell border-box-sizing text_cell rendered">
  <button class="{{ nbinteract_class }}">
    Show Widgets
  </button>
</div>

{{ super() }}
{% endblock body %}
