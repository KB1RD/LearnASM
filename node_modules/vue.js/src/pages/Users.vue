<template>
  <div id="users">
    <div class="row" role="action">
      <div class="small-2 small-offset-10 columns">
        <button class="button radius round" 
            @click="loadUsers()">load</button>
      </div>
    </div>  
    <div class="row" role="data">
      <table class="hover">
        <thead>
          <tr>
            <th width="50">ID</th>
            <th width="150">Name</th>
            <th width="150">User Name</th>
            <th width="150">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return { users: [] };
  },
  methods: {
    async loadUsers() {
      console.log('start loading users...');// eslint-disable-line
      const response = await axios.get('https://jsonplaceholder.typicode.com/users/');
      this.users = response.data;
    },
  },
};
</script>

<style lang="scss" scoped>
#users {

}
</style>
