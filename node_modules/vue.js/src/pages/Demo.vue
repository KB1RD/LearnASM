<template>
  <div>
    <h2>DEMO</h2>
    <button @click="openModal()" class="button round">Open Modal</button>
    <modal ref="modal">
      <h3>Header</h3>
      <p>This is a Modal Dialog</p>
    </modal>
    <progress-bar ref="progressBar" v-bind:progress="progress"></progress-bar>
    <slider></slider>

    <table class="hover">
      <thead>
        <tr>
          <th width="50">Effects</th>
          <th width="50">Example</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rotating Plance</td>
          <td><spinner type="sk-rotating-plane"></spinner></td>
        </tr>
        <tr>
          <td>Double Bounce</td>
          <td><spinner type="sk-double-bounce"></spinner></td>
        </tr>
        <tr>
          <td>Wave</td><td><spinner type="sk-wave"></spinner></td>
        </tr>
        <tr><td>Wandering Cubes</td><td><spinner type="sk-wandering-cubes"></spinner></td></tr>
        <tr><td>Pulse</td><td><spinner type="sk-pulse"></spinner></td></tr>
        <tr><td>Chasing Dots</td><td><spinner type="sk-chasing-dots"></spinner></td></tr>
        <tr><td>Three Bounce</td><td><spinner type="sk-three-Bounce"></spinner></td></tr>
        <tr><td>Circle</td><td><spinner type="sk-circle"></spinner></td></tr>
        <tr><td>Cube Grid</td><td><spinner type="sk-cube-grid"></spinner></td></tr>
        <tr><td>Fading Circle</td><td><spinner type="sk-fading-circle"></spinner></td></tr>
        <tr><td>Folding Cube</td><td><spinner type="sk-folding-cube"></spinner></td></tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Modal from '@components/Modal';
import ProgressBar from '@components/ProgressBar';
import Slider from '@components/Slider';
import Spinner from '@components/Spinner';

export default {
  name: 'demo',
  components: { ProgressBar, Modal, Slider, Spinner },
  data() {
    return {
      progress: 0,
    };
  },
  methods: {
    openModal() {
      this.$refs.modal.open();
    },
    increase() {
      const interval = setInterval(() => {
        this.progress += 1;
        if (this.progress >= 100) {
          clearInterval(interval);
        }
      }, 1000);
    },
  },
  mounted() {
    this.increase();
  },
};
</script>
