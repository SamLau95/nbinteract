{%- extends 'basic.tpl' -%}
{% from 'mathjax.tpl' import mathjax %}

<!--
This file is blatently copied from the nbconvert's full.tpl since there's no
easy hook into the spot just before the body closes.
-->

{% block body %}
<body>
  <div tabindex="-1" id="notebook" class="border-box-sizing">
    <div class="container" id="notebook-container">
      {{ super() }}
    </div>
  </div>
  <!-- This line contains the JS to run the widget code -->
  <script src="https://unpkg.com/nbinteract"></script>
</body>
{%- endblock body %}


<!-- Add loading text to widget output -->
{%- block data_widget_view scoped %}
{% set div_id = uuid4() %}
{% set datatype_list = output.data | filter_data_type %}
{% set datatype = datatype_list[0]%}
<div class="output_subarea output_widget_view {{ extra_class }}">
  <div class="nbinteract-js-widget">
    Show Widget
  </div>
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

{% block footer %}
{{ super() }}
</html>
{% endblock footer %}
