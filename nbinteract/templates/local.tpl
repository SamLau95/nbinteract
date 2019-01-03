{#
Like the full.tpl template but loads a local copy of the nbinteract library
instead of using unpkg.com. Used for development purposes only alongside the
webpack-dev-server.
#}

{%- extends 'full.tpl' -%}

{% block nbinteract_script %}
<!-- Loads nbinteract package -->
<script src="http://localhost:8080/index.bundle.js"></script>
<script>
  var interact = new NbInteract({
    nbUrl: 'http://localhost:8889/',
  })
  interact.prepare()
</script>
{%- endblock nbinteract_script %}
