{%- extends 'partial.tpl' -%}
{% from 'mathjax.tpl' import mathjax %}
{% from 'nbinteract_css.tpl' import nbinteract_css %}

{#
This file is blatently copied from the nbconvert's full.tpl since there's no
easy hook into the spot just before the body closes.
#}

{% block body %}
<body>
  <div tabindex="-1" id="notebook" class="border-box-sizing">
    <div class="container">
      {{ super() }}
    </div>
  </div>
</body>
{%- endblock body %}

{%- block header -%}
<!DOCTYPE html>
<html>
<head>
{%- block html_head -%}
<meta charset="utf-8" />

{% set nb_title = nb.metadata.get('title', '') or resources['metadata']['name'] %}
<title>{{nb_title}}</title>

{% for css in resources.inlining.css -%}
    <style type="text/css">
    {{ css }}
    </style>
{% endfor %}

<style type="text/css">
/* Overrides of notebook CSS for static HTML export */
body {
  overflow: visible;
  padding: 8px;
}

div#notebook {
  overflow: visible;
  border-top: none;
}

{%- if resources.global_content_filter.no_prompt-%}
div#notebook-container{
  padding: 6ex 12ex 8ex 12ex;
}
{%- endif -%}

@media print {
  div.cell {
    display: block;
    page-break-inside: avoid;
  }
  div.output_wrapper {
    display: block;
    page-break-inside: avoid;
  }
  div.output {
    display: block;
    page-break-inside: avoid;
  }
}
</style>

<!-- Loading mathjax macro -->
{{ mathjax() }}

{{ nbinteract_css() }}
{%- endblock html_head -%}
</head>
{%- endblock header -%}
