<template>
  <div class="col-md-5">
    <div class="card info">
      <div class="card-body">
        <div class="card-text">
          <template  v-if="info.biobank">
            <div class="row" height="80px">
              <div v-if="getCountryUrl(info.biobank.country)">
                <div>
                  <img id='country_flag' :src="getCountryUrl(info.biobank.country_code)" contain height="40px" />
                </div>
              </div>
                <!-- <a :href="link" target="_blank" rel="noopener noreferrer" >
                  <span style="position: aboslute;margin-top:0%;margin-left: 20px"> {{link=getUrls(info.biobank.website)[0]}} </span>
                  <span style="position: aboslute;margin-top:4%;margin-left: 20px"> {{link=getUrls(info.biobank.website)[0]}} </span>
                </a> -->
                <a v-for="link in getUrls(info.biobank.website)" :key="`${link}`" :href="link" target="_blank" rel="noopener noreferrer" >
                  <span style=" position: absolute; margin-top:0%;margin-left: 20px"> {{link}} </span>
                </a>
            </div>

<!--             <div v-if="getCountryUrl(info.biobank.country)">
              <img id='country_flag' :src="getCountryUrl(info.biobank.country_code)" contain height="40px" />
              <div v-for="link in getUrls(info.biobank.website)" :key="`${link}`"> -->
<!--                 <a  v-for="link in getUrls(info.biobank.website)" :key="`${link}`" :href="link" target="_blank" rel="noopener noreferrer" >
                  <span style=" position: relative; margin-top:7%;margin-left: 20px"> {{link}} </span>
                </a> -->
            <!-- </div> -->
            <!-- </div> -->
            <!-- <div v-for="link in getUrls(info.biobank.website)" :key="`${link}`">
              <a :href="link" target="_blank" rel="noopener noreferrer">
                <span> {{link}} </span>
              </a>
            </div> -->
            <!-- </div> -->

            <div style="position: absolute; margin-top:7%;">
            <b style="margin-left: -1.0rem;" >Host Institution</b>
            <ul class="right-content-list">
              <li>
                <div>
                  {{ info.biobank.juridical_person }}
                </div>
                <div>
                  {{ this.checkStreetName(info.biobank.street) }}
                </div>
                <div>
                  {{ info.biobank.zip_code }} {{info.biobank.city}}
                </div>
                <div>
                  {{ info.biobank.country }}
                </div>
              </li>
              <li>
                <!-- <div v-if="info.biobank.report">
                  <span class="fa fa-fw fa-address-card mr-2" aria-hidden="true"></span>
                  <router-link :to="info.biobank.report">
                    <span>View {{ info.biobank.name }}</span>
                  </router-link>
                </div> -->
              </li>
              <!-- <template v-if="info.contact">
            <div style="position: absolute; margin-top:20%;">
            <h4 class="header">Personnel</h4>
            <ul class="right-content-list">
              <template v-if="info.head">
                <li>
                  <span class="font-weight-bold mr-1">Head/PI:</span>
                  <span>{{ info.head }}</span>
                </li>
              </template>
              <li v-if="info.contact.name">
                <span class="font-weight-bold mr-1">Main Contact:</span>
                <span>{{ info.contact.name }}</span>
              </li>
              <li v-if="info.contact.email">
                <span class="fa fa-fw fa-paper-plane mr-2" aria-hidden="true"></span>
                <a :href="'mailto:' + info.contact.email">
                  <span> {{info.contact.email}}</span>
                </a>
              </li>
            </ul>
            </div>
          </template> -->
            </ul>
          </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectionReportInfoCard',
  props: {
    info: {
      type: Object,
      required: true
    }
  },
  methods: {
    getUrls (url) {
      if (!url) {
        return ''
      }
      var urls = url.split(',')
      return urls
    },
    getCountryUrl (countryCode) {
      if (countryCode === 'ZZ') {
        return undefined
      }
      const code = countryCode.toLowerCase()
      var url = 'http://www.geonames.org/flags/x/' + code + '.gif'
      return url
    },

    checkStreetName (street) {
      if (street === 'nan - nan') {
        return 'not specified'
      }
      return street.split('-')[0]
    }
  }
}
</script>

<style scoped>
.biobank-id {
  word-break: break-all;
}

.right-content-list {
  list-style-type: none;
  font-size: 15px;
  /* font-weight: bold; */
  margin-left: -3.5rem;
}
.right-content-list:not(:last-child) {
  margin-bottom: 1.5rem;
}

.right-content-list li {
  margin-bottom: 0.5rem;
}

.info-list {
  margin-bottom: 1rem;
}

.cert-badge:not(:last-child) {
  margin-right: 1rem;
}
.content-info-box {
  border-color: white;
}
.header {
  color: #a6cc74
}
.info {
  background-color: white;
  border: none;
}
</style>
