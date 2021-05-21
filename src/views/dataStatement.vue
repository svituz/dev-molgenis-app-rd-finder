<template>
  <!-- <div class="container mg-collection-report-card"> -->
    <div class="data-statement" >
        <div class="row-header">
          <b>Linking up rare disease research across the world</b>
        </div>
        <div class="background-hack">
          <div class="background-hack-l">
          </div>
          <div class="background-hack-r">
          </div>
          </div>
        <div class="header-data-prot" style="padding-left: 20px; padding-right:20px">
        <h4 class="dsp-header" style="margin-bottom:-10px; margin-top:20px;">
            Data Protection Statement
        </h4>
        <hr>
        </div>
        <div class="body-data-prot" style="padding:  20px 50px 20px 40px">
        <td v-html="text"></td>
        </div>
        <div class="row-footer2">
          <p class="footer-p">
            Linking up rare disease resarch across the world
          </p>
          <p class="footer-p footer-link" >
            <a :href="geturl">RD-Connect</a>
          </p>
          <p class="footer-p footer-link">
            <router-link :to="'/dataprotectionstatement'">Data Protection statement </router-link>
          </p>
        </div>
    </div>
</template>

<script>
// import { getUrl } from '../tables/BiobankExplorerContainer'

export default {
  name: 'DataProtectionStatement',
  data () {
    return {
      geturl: 'http://molgenis-rd-connect.silicolab.bibbox.org/menu/main/home',
      text: '<span style="font-size:18px;"><span style="font-size:17px;"> <p> By using the RD-Connect Registry and Biobank Finder, you are agreeing to be bound by our policy. </p> <br> <p> This website uses cookies to collect statistical data about your browsing actions and patterns. These do not identify you as an individual. It is possible to switch cookies off by setting your browser preferences. </p> <br> <p> Like many other websites, this website uses third parties to compile aggregate statistics such as the number of visitors and page views. Such statistics are used for to monitor the usage of the tool and project reporting as required under the EC project. No personally identifying data is included in this type of reporting. All of our activity falls within the bounds of the <a href="https://www.google.com/analytics/terms/"> Google Analytics Terms </a> of Service and Additianly we track answers on the invitation system for Registries and Biobanks. </p> <br> When you visit our website, information collected includes your IP address and information regarding what resource ID-Card, pages are accessed and when. This information is only processed in a way which does not identify anyone. We do not make, and do not allow third parties to make, any attempt to find out the identities of those visiting our website. If you fill the Request form, the personal information we collect might include your name and email address. </p> <br> This website is hosted, maintained and developed by under the RD-Connect project, based at <a href="https://rd-connect.eu/organisation/medical-university-of-graz/">Medical University of Graz</a>, Austria, <a href="https://rd-connect.eu/organisation/istituto-superiore-di-sanita-iss/">Istituto Superiore Sanità</a>, Italy and at the <a href="https://rd-connect.eu/organisation/fondazione-telethon/">Fondazione Telethon</a>, Italy. We will not share your personal data with third parties, unless required to by law. </p> <br> If you would like to discuss the RD-Connect Registry and Biobank Finders use of your personal data further, please contact <a href="mailto:catalogue@rd-connect.eu">catalogue@rd-connect.eu</a>. This statement was last updated – 23 May 2018.</span><strong><span style="font-size:14px;">&nbsp;&nbsp;</span>&nbsp;&nbsp;&nbsp;</strong></span><span style="font-size: 80%;"><span style="font-size: 90%;"><strong><span style="font-size: 80%;"> </span></strong></span></span>'
    }
  }
}

</script>

<style>
.data-statement {
    background-color: white;
    width: 1180px;
    height: 800px;
    margin-left: -30px;
    /* padding-left: -50px; */
}
.dsp-header {
    color: #a6cc74;
    /* margin-left: 0%; */
}
hr {
  border:none;
  border-top:1px dotted #000;
  margin-left: 0%;
  padding-left: -0px;
  height:1px;
}

.row-footer2 {
    background-color: #F4F4E1;
    position: relative;
    width: 1200px;
    height: 125px;
    padding-top: 15px;
    margin-left: 0;
    text-align: center;
    z-index: 99;
    padding-left: -50px;
    left: -15px;
}

.row-header {
    background-color: #F4F4E1;
    width: 1200px;
    position: relative;
    left: -15px;
    z-index: 100;
    padding-left: 20px;
}
</style>
