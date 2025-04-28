<template>
  <section id="projects">
    <article v-for="p in projects" :key="p.id">
      <h3>{{ p.title }}</h3>
      <p>{{ p.description }}</p>
      <a :href="p.link" target="_blank">Demo / GitHub</a>
    </article>
  </section>
</template>

<script>
export default {
  name: "Projects",
  data() {
    return {
      projects: [], // später hier deine Projekte ergänzen
    };
  },
};
</script>
