<template>
  <div class="card external-resource-card">
    <div class="card-header external-resource-card-header">
      <div class="row">
        <div class="col-md-5">
          <h5>
            <a
              :href="resource.homepage"
              target="_blank"
              v-if="resource.type == 'BiobankDataset'"
              class="fa fa-table mr-1"
              style="color:green"
              aria-hidden="true"
              aria-labelledby="biobank-name"/>
            <a
              :href="resource.homepage"
              target="_blank"
              v-if="resource.type == 'PatientRegistryDataset'"
              class="fa fa-table mr-1"
              style="color:blue"
              aria-hidden="true"
              aria-labelledby="biobank-name"/>
            <span id="resource-name">{{ resource.name }}</span>
          </h5>
        </div>
        <div class="col-md-7">
          <p>
            <small class="mr-2">
              <span class="font-weight-bold">Ressource Type:</span>
            </small>
            <small v-if="resource.type == 'BiobankDataset'">Biobank</small>
            <small v-if="resource.type == 'PatientRegistryDataset'">Registry</small>
          </p>
        </div>
        <!-- <div v-else class="col-md-12 text-center">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style>
.collapsed > .when-visible {
  display: none;
}

:not(.collapsed) > .when-hidden {
  display: none;
}

.external-resource-card {
  margin-bottom: 1em;
}

.external-resource-card-header {
  background-color: #f5f5f5;
}

.external-resource-card-header:hover {
  cursor: pointer;
  background-color: #e4e4e4;
}
</style>

<script>
export default {
  name: 'external-resource-card',
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  computed: {},
  data () {
    return {
    }
  }
}
</script>
