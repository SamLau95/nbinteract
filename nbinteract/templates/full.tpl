{%- extends 'partial.tpl' -%}
{% from 'mathjax.tpl' import mathjax %}

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


<!-- Add loading button to widget output -->
{%- block data_widget_view scoped %}
<div class="output_subarea output_widget_view {{ extra_class }}">
  <!-- Keep class in sync with util.js -->
  <button class="js-nbinteract-widget">
    Show Widget
  </button>
</div>
{%- endblock data_widget_view -%}

{%- block header -%}
<!DOCTYPE html>
<html>
<head>
{%- block html_head -%}
<meta charset="utf-8" />
<title>{{resources['metadata']['name']}}</title>

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

<!-- Custom stylesheet, it must be in the same directory as the html file -->
<link rel="stylesheet" href="custom.css">

<!-- Loading mathjax macro -->
{{ mathjax() }}
{%- endblock html_head -%}
</head>
{%- endblock header -%}
