<template>
  <!-- <div class="container mg-collection-report-card"> -->
    <div class="data-statement">
        <div>
          <b>Linking up rare disease research across the world</b>
        </div>
        <div class="background-hack">
          <div class="background-hack-l">
          </div>
          <div class="background-hack-r">
          </div>
          </div>
        <div class="header-data-prot" style="padding-left: 20px">
        <h4 class="dsp-header" style="margin-bottom:-10px; margin-top:20px;">
            Data Protection Statement
        </h4>
        <hr>
        </div>
        <div class="body-data-prot" style="padding-left: 40px">
        <td v-html="text"></td>
        </div>
    </div>
</template>

<script>

export default {
  name: 'DataProtectionStatement',
  data () {
    return {
      text: '<span style="font-size:18px;"><span style="font-size:17px;"> <p> By using the RD-Connect Registry and Biobank Finder, you are agreeing to be bound by our policy. </p> <br> <p> This website uses cookies to collect statistical data about your browsing actions and patterns. These do not identify you as an individual. It is possible to switch cookies off by setting your browser preferences. </p> <br> <p> Like many other websites, this website uses third parties to compile aggregate statistics such as the number of visitors and page views. Such statistics are used for to monitor the usage of the tool and project reporting as required under the EC project. No personally identifying data is included in this type of reporting. All of our activity falls within the bounds of the <a href="https://www.google.com/analytics/terms/"> Google Analytics Terms </a> of Service and Additianly we track answers on the invitation system for Registries and Biobanks. </p> <br> When you visit our website, information collected includes your IP address and information regarding what resource ID-Card, pages are accessed and when. This information is only processed in a way which does not identify anyone. We do not make, and do not allow third parties to make, any attempt to find out the identities of those visiting our website. If you fill the Request form, the personal information we collect might include your name and email address. </p> <br> This website is hosted, maintained and developed by under the RD-Connect project, based at <a href="https://rd-connect.eu/organisation/medical-university-of-graz/">Medical University of Graz</a>, Austria, <a href="https://rd-connect.eu/organisation/istituto-superiore-di-sanita-iss/">Istituto Superiore Sanità</a>, Italy and at the <a href="https://rd-connect.eu/organisation/fondazione-telethon/">Fondazione Telethon</a>, Italy. We will not share your personal data with third parties, unless required to by law. </p> <br> If you would like to discuss the RD-Connect Registry and Biobank Finders use of your personal data further, please contact <a href="mailto:catalogue@rd-connect.eu">catalogue@rd-connect.eu</a>. This statement was last updated – 23 May 2018.</span><strong><span style="font-size:14px;">&nbsp;&nbsp;</span>&nbsp;&nbsp;&nbsp;</strong></span><span style="font-size: 80%;"><span style="font-size: 90%;"><strong><span style="font-size: 80%;"> </span></strong></span></span>'
    }
  }
}

</script>

<style>
.data-statement {
    background-color: white;
    width: 1140px;
    padding: 0px;
    height: 800px;
}
.dsp-header {
    color: #a6cc74
}
hr {
  border:none;
  border-top:1px dotted #000;
  margin-left: 0%;
  padding-left: 20px;
  height:1px;
}
</style>
