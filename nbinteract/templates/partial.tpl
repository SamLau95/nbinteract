{#
Outputs an HTML partial for embedding in other pages. Like the plain.tpl
template but also loads the nbinteract library.
#}

{%- extends 'plain.tpl' -%}

{% block body %}
{{ super() }}

{% block nbinteract_script %}
<!-- Loads nbinteract package -->
<script src="https://unpkg.com/nbinteract-core" async></script>
<script>
  (function setupNbinteract() {
    // If NbInteract hasn't loaded, wait one second and try again
    if (window.NbInteract === undefined) {
      setTimeout(setupNbinteract, 1000)
      return
    }

    var interact = new window.NbInteract({
      spec: '{{ spec }}',
      baseUrl: '{{ base_url }}',
      provider: '{{ provider }}',
    })
    interact.prepare()

    window.interact = interact
  })()
</script>
{%- endblock nbinteract_script %}

{%- endblock body %}
