{#
Like the full.tpl template but loads a local copy of the nbinteract library
instead of using unpkg.com. Used for development purposes only.
#}

{%- extends 'full.tpl' -%}

{% block nbinteract_script %}
<!-- Loads nbinteract package -->
<script src="../built/index.bundle.js"></script>
{%- endblock nbinteract_script %}
