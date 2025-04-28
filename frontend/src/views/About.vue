<template>
  <section id="about">
    <!-- Bild aus public/ -->
    <img src="/profile.jpg" alt="Milos Vidakovic" />

    <ul>
      <li>
        <strong>Education:</strong>
        B.Sc. Business Information Technology, BFH
      </li>
      <li>
        <strong>Interests:</strong>
        Artificial Intelligence, Web Development
      </li>
      <li>
        <strong>Experience:</strong>
        Python, R, SQL, HTML/CSS/JavaScript basics
      </li>
      <li>
        <strong>Hobbies:</strong>
        Motorcycling (Suzuki GSX-R 600)
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: "About",
};
</script>

<style scoped>
#about {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #eee;
}

#about img {
  display: block;
  margin: 0 auto 1.5rem;
  width: 150px;
  border-radius: 50%;
}

#about ul {
  list-style: disc inside;
  line-height: 1.6;
}

#about strong {
  color: #fff;
}
</style>
