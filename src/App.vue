<template>
  <div @click="$root.$emit('bv::hide::popover')">
    <div class="container" style="width:1140px; min-width:1140px">
      <b-alert v-if="errorMessage" show variant="danger" dismissible>{{errorMessage}}</b-alert>
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
.mg-page-content {
  padding-top: 0 !important;
}
.app {
  background-color: white;
}
.container {
  background-color: white;
}
</style>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters({ errorMessage: 'getErrorMessage' })
  },
  methods: {
    ...mapActions([
      'GetNegotiatorType',
      'GetNegotiatorEntities'
    ])
  },
  mounted () {
    this.GetNegotiatorType()
    this.GetNegotiatorEntities()
  },
  name: 'biobank-explorer'
}
</script>
