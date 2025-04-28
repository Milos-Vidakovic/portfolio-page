<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/projects">Projects</router-link>
      <router-link to="/skills">Skills</router-link>
      <router-link to="/contact">Contact</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
nav {
  background: #f5f5f5;
  padding: 1rem;
}
nav a {
  margin-right: 1rem;
  color: #333;
  text-decoration: none;
}
nav a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
