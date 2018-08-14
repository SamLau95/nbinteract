{#
This template doesn't load the nbinteract JS since it assumes that the
embedding page loads and sets up nbinteract.

This page produces basically the same output as...

jupyter nbconvert --to html --template basic

...but replaces widgets with buttons to start nbinteract.
#}

{%- extends 'basic.tpl' -%}

{# Keep class in sync with util.js #}
{% set nbinteract_class = 'js-nbinteract-widget' %}

{% set nbinteract_button_text = 'Loading widgets...' %}

{# Add loading button to widget output #}
{%- block data_widget_view scoped %}
<div class="output_subarea output_widget_view {{ extra_class }}">
  <button class="{{ nbinteract_class }}">
    {{ nbinteract_button_text }}
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

{% if button_at_top %}
  <div class="cell text_cell">
    <button class="{{ nbinteract_class }}">
      Loading widgets...
    </button>
  </div>
{% endif %}

{{ super() }}
{% endblock body %}
