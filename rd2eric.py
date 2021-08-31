import json
import xlsxwriter
import pandas as pd
import re
import numpy as np
import geopy


def add_code_to_types(eric_data, code, code_id, name):
    """ adds icd10 or orpha code to "bbmri_eric_disease_type",
        generates url from code, adds "ontology": orphanet or ICD-10

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    code : string
        icd10 or orpha code eg.: ORPHA:166 or G60.0
    code_id : string
        unique code id for disease code eg.: "ORPHA:166" or "urn:miriam:icd:G60.0"
    name : string
        name of disease from rd_connect
    """

    index = eric_data['eu_bbmri_eric_disease_types'].index.max()+1
    name=str(name)
    if len(name) > 255 and len(name.split(";")) > 0:
        name = name.split(";")[0]
    else:
        name = name[:250]

    if "urn" in code_id:
        ontology = "ICD-10"
        url = "https://identifiers.org/{0}".format(code_id.split(":")[-1])
    elif "ORPHA" in code_id:
        ontology = "orphanet"
        url = "http://identifiers.org/orphanet:{0}".format(code_id.split(":")[-1])
    elif "OMIM" in code_id:
        ontology = "omim"
        url = "https://www.omim.org/entry/{0}".format(code_id.split(":")[-1])

    eric_data['eu_bbmri_eric_disease_types'].at[index, "id"] = code_id
    eric_data['eu_bbmri_eric_disease_types'].at[index, "code"] = code
    eric_data['eu_bbmri_eric_disease_types'].at[index, "label"] = name
    eric_data['eu_bbmri_eric_disease_types'].at[index, "ontology"] = ontology
    eric_data['eu_bbmri_eric_disease_types'].at[index, "uri"] = url


def check_disease_type(eric_data, rd_data, enum, name, rows, count):
    """ checks param "diagnosis_available" for icd10 or orpha - codes.
        if codes can be extracted and not in bbmri_eric_disease_types:
        calls function: add_code_to_types

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    enum : int
        row number of current disease in rd_connect
    name : string
        name of disease from rd_connect
    rows : data frame
        data frame holding disease information of current biobank
    count : int
        counter of current (sub) collection. needed for access to "diagnosis_available"

    Returns
    -------
    list of strings
        list of codes
    """


    icd_code = rows.reset_index(drop=True).at[enum,'icd10']
    orpha_code = rows.reset_index(drop=True).at[enum,'orphacode']
    omim_code = rows.reset_index(drop=True).at[enum,'omim']
    synonyms = rows.reset_index(drop=True).at[enum,'synonym']
    code_frame = eric_data['eu_bbmri_eric_disease_types']['code'].values
    code_list = []
    code_list_orpha = []
    code_list_icd = []
    code_list_omim = []

    if pd.isnull(icd_code) and pd.isnull(orpha_code) and pd.isnull(omim_code) and pd.isnull(synonyms):
        return code_list

    if not pd.isnull(orpha_code):
        orpha_codes = ["ORPHA:" + orph for orph in re.findall(r'\d+', orpha_code)]
        # print("before list comp: \n", orpha_code)
        # print("\n after: \n ", orpha_codes)
        for code in orpha_codes:
            code = code.replace(" ", "")
            if code in code_frame:
                code_list.append(str(code))
            else:
                code_id = code
                add_code_to_types(eric_data, code, code_id, name)
                code_list.append(str(code))

        # make sure that codes occur only once
        code_list_orpha = sorted(list(set(code_list)))
        # eric_data['eu_bbmri_eric_collections'].at[count,'diagnosis_available'] = ",".join(code_list)

    if not pd.isnull(icd_code):
        icd_no_space = icd_code.replace(" ", "")
        letter_positions = [m.span() for m in re.finditer(r'[^A-Za-z]+', icd_no_space)]
        icd_codes = [icd_no_space[k[0]-1] + icd_no_space[k[0]:k[1]] for k in letter_positions]

        code_list = []
        rex = re.compile("^[A-Z]{1}[0-9]{2}[.][0-9]{1}$")
        for code in icd_codes:
            code = code.replace(" ", "")
            code_id = "urn:miriam:icd:"+str(code)
            if code in code_frame:
                code_list.append(code_id)
            else:
                if rex.match(code):
                    add_code_to_types(eric_data, code, code_id, name)
                    code_list.append(code_id)
        # make sure that codes occur only once
        code_list_icd = sorted(list(set(code_list)))

    if not pd.isnull(omim_code):
        # split codes at spaces
        code_list = []
        omim_codes = list(set(omim_code.split(";")))
        for code in omim_codes:
            code_id = "OMIM:" + code
            if str(code) in code_frame:
                code_list.append(str(code_id))
            else:
                add_code_to_types(eric_data, code, code_id, name)
                code_list.append(str(code_id))

                
        code_list_omim = sorted(list(set(code_list)))

    code_list = code_list_icd + code_list_orpha + code_list_omim
    eric_data['eu_bbmri_eric_collections'].at[count,'diagnosis_available'] = ",".join(code_list)
    return code_list

def get_material_type(eric_data, rd_materials):
    """[summary]

    Parameters
    ----------
    eric_data : [type]
        [description]
    rd_materials : [type]
        [description]

    Returns
    -------
    [type]
        [description]
    """
    
    eric_types = eric_data["eu_bbmri_eric_material_types"]["id"].values
    rd_material_upper = rd_materials.values[0].upper()
    rd_material_underline = rd_material_upper.replace(" ", "_")
    found_materials = []

    for type_ in eric_types:
        if type_ in rd_material_upper:
            found_materials.append(type_)
        if type_ in rd_material_underline:
            found_materials.append(type_)
        if "TISSUES" in rd_material_upper:
            found_materials.append("TISSUE_PARAFFIN_EMBEDDED")


    if len(found_materials) > 0:
        found = ",".join(list(set(found_materials)))
        print("Found bbmri material type: {0} for rd_connect input: {1}".format(found, rd_material_upper))
        return found
    else: 
        print("Set bbmri material type: [OTHER] for rd_connect input: {0}".format(rd_material_upper))
        return "OTHER"

def add_collections_info(eric_data, rd_data, sub_collections=True):
    """ adds disease information into bbmri_collection entity

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    sub_collections : bool, optional
        generates parent collection (biobank/registry info) and subcollections (diseases) if True, else only
        collections are generated for diseases,
        by default True
    """

    # print(eric_data["eu_bbmri_eric_biobanks"])

    biobank_ids = eric_data["eu_bbmri_eric_biobanks"]['id']
    #orga_ids = biobank_id.str.split(pat=":")    #int(orga_id[-1])
    ids = []
    collection_class = ""

    count = 0
    for biobank_id in biobank_ids:
        m = rd_data['rd_diseases']['OrganizationID'] == int(biobank_id.split(':')[-1])
        basic_info_mask = rd_data['rd_basic_info']['OrganizationID'] == int(biobank_id.split(':')[-1])

        contact_row = eric_data['eu_bbmri_eric_persons'].loc[eric_data['eu_bbmri_eric_persons']['biobanks'] == biobank_id]['id']
        if len(contact_row) > 0 and not pd.isnull(contact_row.values[0]):
            contact_id = contact_row.values[0]
        rows = rd_data['rd_diseases'][m]
        #a = pd.concat([a,list(biobank_id + ':collection:' +rows['name'])])

        rd_org_id = rd_data['rd_basic_info']['OrganizationID'] == int(biobank_id.split(':')[-1])
        rd_bb_mask = rd_data['rd_bb_core']['OrganizationID'] == int(biobank_id.split(':')[-1])
        rd_disease_area_mask = rd_data['rd_DiseaseAreasICD10']['OrganizationID'] == int(biobank_id.split(':')[-1])

        rd_materials = rd_data["rd_bb_core"]["Additional_Biomaterial_available"][rd_bb_mask]
        org_type = rd_data["rd_basic_info"]["type"][rd_org_id].values[0]

        if sub_collections:
            collection_class = "_pa"
            parent_id = str(biobank_id) + ':collection{0}'.format(collection_class)
            eric_data['eu_bbmri_eric_collections'].at[count,'id'] = parent_id
            eric_data['eu_bbmri_eric_collections'].at[count,'contact'] = contact_id
            eric_data['eu_bbmri_eric_collections'].at[count,'ressource_types'] = org_type.upper()
            index = rd_data["rd_DiseaseAreasICD10"][rd_org_id].index

            if sum(rd_disease_area_mask) > 0:
                disease_areas = rd_data["rd_DiseaseAreasICD10"][rd_disease_area_mask].reset_index().loc[0, "Boolean4090":"Pregnancy__childbirth_and_the_puerperium__O00-O99_"].values
                other = rd_data["rd_DiseaseAreasICD10"][rd_disease_area_mask].reset_index().loc[0, "others"]
                disease_display = rd_data["rd_DiseaseAreasICD10"][rd_disease_area_mask].reset_index().loc[0, "_fieldsDisplay"]

                eric_data['eu_bbmri_eric_collections'].at[count,'Boolean4090':"Pregnancy__childbirth_and_the_puerperium__O00_O99_"] = disease_areas
                eric_data['eu_bbmri_eric_collections'].at[count,'disease_area_other'] = other
                eric_data['eu_bbmri_eric_collections'].at[count,"disease_area_display"] = disease_display

            collection_class = "_ch"
            count += 1

        if len(rd_materials) > 0 and not pd.isnull(rd_materials.values[0]):
            material_types = get_material_type(eric_data, rd_materials)

        
        total_size = 0
        codes = []
        for enum,name in enumerate(rows['name'].values):
            ids.append(str(biobank_id) + ':collection:' +str(name))
            eric_data['eu_bbmri_eric_collections'].at[count,'id'] = str(biobank_id) + ':collection{0}:'.format(collection_class) + str(enum+1)
            #split_id = str(str(biobank_id) + ':collection:' +str(r)).str.split(pat=":")
            eric_data['eu_bbmri_eric_collections'].at[count,'country']  = biobank_id.split(':')[2]
            eric_data['eu_bbmri_eric_collections'].at[count,'biobank']  = str(biobank_id)
            eric_data['eu_bbmri_eric_collections'].at[count,'name']  = str(name)

            mag = int(np.log10(np.max([1, rows.reset_index(drop=True).at[enum,'number']])))
            size = rows.reset_index(drop=True).at[enum,'number']
            total_size += size

            # eric_data['eu_bbmri_eric_collections'].at[count,'order_of_magnitude'] = mag
            eric_data['eu_bbmri_eric_collections'].at[count,'order_of_magnitude_donors'] = mag

            # eric_data['eu_bbmri_eric_collections'].at[count,'size'] = size
            eric_data['eu_bbmri_eric_collections'].at[count,'number_of_donors'] = size

            eric_data['eu_bbmri_eric_collections'].at[count,'type'] = 'RD'
            eric_data['eu_bbmri_eric_collections'].at[count,'contact_priority'] = 5
            eric_data['eu_bbmri_eric_collections'].at[count,'description'] = rows.reset_index(drop=True).at[enum,'synonym']
            eric_data['eu_bbmri_eric_collections'].at[count,'gene'] = rows.reset_index(drop=True).at[enum,'gene']
            eric_data['eu_bbmri_eric_collections'].at[count,'timestamp'] = pd.to_datetime(rd_data['rd_basic_info']['lastactivities'][basic_info_mask].values[0])

            code_list = check_disease_type(eric_data, rd_data, enum, name, rows, count)

            if code_list and len(code_list) > 0:
                codes.append(code_list)

            rd_org_id = rd_data['rd_basic_info']['OrganizationID'] == int(biobank_id.split(':')[-1])
            if "biobank" in rd_data["rd_basic_info"]["type"][rd_org_id].values[0]:
                data_cat = "BIOLOGICAL_SAMPLES,OTHER"
                eric_data['eu_bbmri_eric_collections'].at[count,'data_categories'] = data_cat

                if pd.isnull(rd_materials.values[0]):
                    material_types = "NAV"
                    eric_data['eu_bbmri_eric_collections'].at[count,'materials'] = "NAV"

                else:
                    eric_data['eu_bbmri_eric_collections'].at[count,'materials'] = material_types


            elif "registry" in rd_data["rd_basic_info"]["type"][rd_org_id].values[0]:
                data_cat = "MEDICAL_RECORDS,OTHER"
                eric_data['eu_bbmri_eric_collections'].at[count,'data_categories'] = data_cat
                material_types = "NAP"
                eric_data['eu_bbmri_eric_collections'].at[count,'materials'] = "NAP"
            else:
                data_cat = "OTHER"
                eric_data['eu_bbmri_eric_collections'].at[count,'data_categories'] = data_cat

            if sub_collections:
                eric_data['eu_bbmri_eric_collections'].at[count,'parent_collection'] = parent_id

            count +=1

        if sub_collections:
            parent_mask = eric_data['eu_bbmri_eric_collections']["id"] == parent_id
            bb_name = rd_data['rd_basic_info'][basic_info_mask]["name"].values[0]
            total_mag = int(np.log10(np.max([1, total_size])))
            codes = [item for sublist in codes for item in sublist]

            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'country']  = biobank_id.split(':')[2]
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'biobank']  = str(biobank_id)
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'name']  = str(bb_name)
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'type'] = "RD"
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'contact_priority'] = 5
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'data_categories'] = data_cat
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'number_of_donors'] = total_size
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'order_of_magnitude_donors'] = total_mag
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'materials'] = material_types
            eric_data['eu_bbmri_eric_collections'].at[parent_mask, 'diagnosis_available'] = ",".join(set(codes))

def get_country_code(eric_data, rd_data):
    """gets country code (ISO norm) eg.: AUSTRIA -> AUT ; UNITED STATS -> US etc
        missing / unknown: "ZZ"

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)

    Returns
    -------
    data frame
        data frame countaining country codes of all countries. if no country specified: "ZZ"
    """
    bb_country = rd_data["rd_address"]["country"]

    codes = list(eric_data["eu_bbmri_eric_countries"]["name"].values)

    code_frame = bb_country

    for k, country in enumerate(bb_country):
        if country in codes:
            code_frame.iloc[k] = eric_data["eu_bbmri_eric_countries"]["id"][eric_data["eu_bbmri_eric_countries"]["name"] == country].values[0]
        else:
            code_frame.iloc[k] = "ZZ"

    return code_frame

def generate_bb_id(eric_data, bb_id):
    """generates new biobank id using the following format: "rd_connect:ID:[COUNTRY_CODE]:[RD_CONNECT_ID]"
        eg.: "rd_connect:ID:US:11111"

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    bb_id : int
        biobank id from rd_connect

    Returns
    -------
    data frame
        data frame that holds biobank id for bbmri_eric in format: "rd_connect:ID:[COUNTRY_CODE]:[RD_CONNECT_ID]"
        eg.: "rd_connect:ID:US:11111"
    """

    id_list = ["rd_connect:ID:{0}:{1}".format(eric_data["eu_bbmri_eric_biobanks"]["country"].iloc[i],k) for i, k in enumerate(bb_id)]
    id_frame = pd.DataFrame(id_list)
    # print(id_list[300:])

    return id_frame

def add_organization_info(eric_data, rd_data):
    """adds mandatory biobank info: id, name, juridical_person, country, partner_charter_signed, contact_priority

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    """

    # add MANDATORY information:
    bb_partner_cs = [False] # number of patients?
    contact_priority = [5] # positive integer

    bb_id = rd_data["rd_basic_info"]["OrganizationID"]
    bb_name = rd_data["rd_basic_info"]["name"]
    juridical = rd_data["rd_address"]["nameofhostinstitution"]
     
    eric_data["eu_bbmri_eric_biobanks"]["country"] = get_country_code(eric_data, rd_data)
    eric_data["eu_bbmri_eric_biobanks"]["id"] = generate_bb_id(eric_data, bb_id) 
    eric_data["eu_bbmri_eric_biobanks"]["name"] = bb_name
    eric_data["eu_bbmri_eric_biobanks"]["juridical_person"] = juridical

    eric_data["eu_bbmri_eric_biobanks"]["juridical_person"][pd.isnull(juridical)] = "not specified"

    eric_data["eu_bbmri_eric_biobanks"]["partner_charter_signed"] = pd.DataFrame(bb_partner_cs*len(eric_data["eu_bbmri_eric_biobanks"]))
    eric_data["eu_bbmri_eric_biobanks"]["contact_priority"] = pd.DataFrame(contact_priority*len(eric_data["eu_bbmri_eric_biobanks"]))


def add_geo_info(eric_data, rd_data, geo_file="biobank_location_info.xlsx", try_geolocator=False):
    """ adds longitude/latitude using provided file or geolocation service

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    geo_file : str, optional
        filename of file with geo information, by default "biobank_location_info.xlsx"
    try_geolocator : bool, optional
        wether or not to use geolocator service, by default False
    """

    try:
        geo_info = pd.read_excel(geo_file, sheet_name=None, engine="openpyxl")
        geo_df = geo_info["Sheet1"]
        for biobank in eric_data["eu_bbmri_eric_biobanks"]["id"]:
            longitude = geo_df[geo_df["id"] == biobank]["longitude"].values
            latitude = geo_df[geo_df["id"] == biobank]["latitude"].values

            eric_data["eu_bbmri_eric_biobanks"]["longitude"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = longitude
            eric_data["eu_bbmri_eric_biobanks"]["latitude"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = latitude

        return

    except FileNotFoundError:

        if not try_geolocator:
            print("[Error] \n")
            print("File [{0}] not found \n Use correct geo location file \n or set variable:  \"try_geolocator\" =True to use geolocation service".format(geo_file))
            print("Skipping Location info")
            return

        geolocator = geopy.geocoders.Nominatim(user_agent="get_loc_script")
        for biobank in eric_data["eu_bbmri_eric_biobanks"]["id"]:
            street = rd_data["rd_address"]["street1"][rd_data["rd_address"]["OrganizationID"] == int(biobank.split(":")[-1])].values

            if len(street) > 0:
                location = geolocator.geocode(street[0])

                if location:
                    longitude = location.longitude
                    latitude = location.latitude
                    eric_data["eu_bbmri_eric_biobanks"]["longitude"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = longitude
                    eric_data["eu_bbmri_eric_biobanks"]["latitude"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = latitude

def additional_organization_info(eric_data, rd_data):
    """ adds additional biobank info: description. acronym, person_id, organization-type ("registry" or "biobank")
        calls function "add_geo_info do add longitude/latitude

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    """

    url_data = pd.read_excel("url_file.xlsx", sheet_name=None, engine="openpyxl")
    # add additional information:
    for biobank in eric_data["eu_bbmri_eric_biobanks"]["id"]:
        rd_id = int(biobank.split(":")[-1])
        description = rd_data["rd_core"]["Description"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
        acronym = rd_data["rd_core"]["acronym"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
        rd_name = rd_data["rd_basic_info"]["name"][rd_data["rd_basic_info"]["OrganizationID"] == rd_id].values[0]
        street_name_one = rd_data["rd_address"]["street1"][rd_data["rd_address"]["OrganizationID"] == rd_id].values[0]
        street_name_two = rd_data["rd_address"]["street2"][rd_data["rd_address"]["OrganizationID"] == rd_id].values[0]
        city = rd_data["rd_address"]["city"][rd_data["rd_address"]["OrganizationID"] == rd_id].values[0]

        if street_name_one or street_name_two:
            street = str(street_name_one) + " - " + str(street_name_two)
            eric_data["eu_bbmri_eric_biobanks"]["street"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = street

        zip_code = rd_data["rd_address"]["zip"][rd_data["rd_address"]["OrganizationID"] == rd_id].values[0]
        if zip_code:
            eric_data["eu_bbmri_eric_biobanks"]["zip_code"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = zip_code
        
        if city:
            eric_data["eu_bbmri_eric_biobanks"]["city"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = city


        # add urls and remove spaces
        urls = rd_data["rd_url"]["url"][rd_data["rd_url"]["OrganizationID"] == rd_id].values
        eric_data["eu_bbmri_eric_biobanks"]["url"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = ",".join(urls).replace(" ", "")

        # get organization type "Biobank" or "Registry"
        organization_type = rd_data["rd_basic_info"]["type"][rd_data["rd_basic_info"]["OrganizationID"] == rd_id].values
        eric_data["eu_bbmri_eric_biobanks"]["ressource_types"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = organization_type[0].upper()

        # add more general info as shown in tab "Overview" for Registries
        if organization_type[0] == 'registry':
            acronym = rd_data["rd_core"]["acronym"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            description = rd_data["rd_core"]["Description"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            type_of_host = rd_data["rd_core"]["Type_of_host_institution"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            source_of_funding = rd_data["rd_core"]["Source_of_funding"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            target_population = rd_data["rd_core"]["Target_population_of_the_registry"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            year_of_establishment = rd_data["rd_core"]["year_of_establishment"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            ontologies_used = rd_data["rd_core"]["Ontologies"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            imaging_available = rd_data["rd_core"]["Imaging_available"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            also_listed = rd_data["rd_core"]["The_registry_biobanks_is_listed_in_other_inventories_networks"][rd_data["rd_core"]["OrganizationID"] == rd_id].values

            host_is = rd_data["rd_core"]["Host_institution_is_a"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            other_inventories = rd_data["rd_core"]["The_registry_biobanks_is_listed_in_other_inventories_networks"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            associated_data = rd_data["rd_core"]["Associated_data_available"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            additional_associated = rd_data["rd_core"]["Additional_Associated_data_available"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            additional_ontologies = rd_data["rd_core"]["Additional_Ontologies"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            text = rd_data["rd_core"]["Text5085"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            biomat_available_in_biobanks = rd_data["rd_core"]["Biomaterial_Available_in_biobanks"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            additional_networks = rd_data["rd_core"]["Additional_networks_inventories"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            additional_imaging_available = rd_data["rd_core"]["Additional_Imaging_available"][rd_data["rd_core"]["OrganizationID"] == rd_id].values[0]

            fields_display = rd_data["rd_core"]["_fieldsDisplay"][rd_data["rd_core"]["OrganizationID"] == rd_id].values

            eric_data["eu_bbmri_eric_biobanks"]["other_inventories"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = other_inventories
            eric_data["eu_bbmri_eric_biobanks"]["biomaterials_available_in_biobanks"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = biomat_available_in_biobanks


        # add infos of biobanks
        else:
            description = rd_data["rd_bb_core"]["Description"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            acronym = rd_data["rd_bb_core"]["acronym"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            type_of_host = rd_data["rd_bb_core"]["Type_of_host_institution"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            imaging_available = rd_data["rd_bb_core"]["Imaging_available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            ontologies_used = rd_data["rd_bb_core"]["Ontologies"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            target_population = rd_data["rd_bb_core"]["Target_population_of_the_registry"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            text = rd_data["rd_bb_core"]["Text5085"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            also_listed = rd_data["rd_bb_core"]["The_registry_biobanks_is_listed_in_other_inventories_networks"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            year_of_establishment = rd_data["rd_bb_core"]["year_of_establishment"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values

            associated_data = rd_data["rd_bb_core"]["Associated_data_available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_imaging_available = rd_data["rd_bb_core"]["Additional_Imaging_available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_associated = rd_data["rd_bb_core"]["Additional_Associated_data_available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            host_is = rd_data["rd_bb_core"]["Host_institution_is_a"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_networks = rd_data["rd_bb_core"]["Additional_networks_inventories"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_ontologies = rd_data["rd_bb_core"]["Additional_Ontologies"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            fields_display = rd_data["rd_bb_core"]["_fieldsDisplay"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values

            additional_bio = rd_data["rd_bb_core"]["Additional_Biomaterial_available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_origin = rd_data["rd_bb_core"]["Additional_Origin_of_collection"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            how_many = rd_data["rd_bb_core"]["How_many_RD_are_in_the_registry_biobank"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            use_of_collection = rd_data["rd_bb_core"]["Use_of_collection"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            origin_colletion = rd_data["rd_bb_core"]["Origin_of_collection"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_biomat_prep = rd_data["rd_bb_core"]["Additional_Biomaterial_prepared"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            biomat_available = rd_data["rd_bb_core"]["Biomaterial_Available"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            percent = rd_data["rd_bb_core"]["Percentage_of_rare_diseases_in_your_registry_biobank"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            biomat_prep = rd_data["rd_bb_core"]["Biomaterial_prepared"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values
            additional_use_of_collection = rd_data["rd_bb_core"]["Additional_Use_of_collection"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values

            eric_data["eu_bbmri_eric_biobanks"]["additional_biomaterial_available"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_bio
            eric_data["eu_bbmri_eric_biobanks"]["additional_origin_of_collection"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_origin
            eric_data["eu_bbmri_eric_biobanks"]["how_many_rd_are_in_the_registry_biobank"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = how_many
            eric_data["eu_bbmri_eric_biobanks"]["use_of_collection"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = use_of_collection
            eric_data["eu_bbmri_eric_biobanks"]["origin_of_collection"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = origin_colletion
            eric_data["eu_bbmri_eric_biobanks"]["additional_biomaterial_prepared"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_biomat_prep
            eric_data["eu_bbmri_eric_biobanks"]["biomaterial_available"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = biomat_available
            eric_data["eu_bbmri_eric_biobanks"]["percentage_of_rare_diseases_in_your_registry_biobank"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = percent
            eric_data["eu_bbmri_eric_biobanks"]["biomaterial_prepared"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = biomat_prep
            eric_data["eu_bbmri_eric_biobanks"]["additional_use_of_collection"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_use_of_collection



        logo_link = url_data["Sheet1"][url_data["Sheet1"]["Name"] == rd_name]["Url"].values
        if len(logo_link) > 0:
            logo_link = logo_link[0]
        else:
            if organization_type[0] == 'biobank':
                logo_link = "https://raw.githubusercontent.com/bibbox/dev-molgenis-app-rd-finder/dev/logos/Biobank.png"
            else:
                logo_link = "https://raw.githubusercontent.com/bibbox/dev-molgenis-app-rd-finder/dev/logos/Registry.png"


        # print(biobank)
        if biobank in eric_data["eu_bbmri_eric_persons"]["biobanks"].values:
            person_id = eric_data["eu_bbmri_eric_persons"]["id"][eric_data["eu_bbmri_eric_persons"]["biobanks"] == biobank].values
            # print(person_id)
            eric_data["eu_bbmri_eric_biobanks"]["contact"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = person_id

        # if pd.isnull(description) and biobank in rd_data["rd_bb_core"]["OrganizationID"].values:
        #     description = rd_data["rd_bb_core"]["Description"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values

        # if pd.isnull(acronym) and biobank in rd_data["rd_bb_core"]["OrganizationID"].values:
        #     acronym = rd_data["rd_core"]["acronym"][rd_data["rd_core"]["OrganizationID"] == rd_id].values
            

        eric_data["eu_bbmri_eric_biobanks"]["description"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = description
        eric_data["eu_bbmri_eric_biobanks"]["acronym"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = acronym
        eric_data["eu_bbmri_eric_biobanks"]["logo"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = "img1e"
        eric_data["eu_bbmri_eric_biobanks"]["logo_link"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = logo_link
        eric_data["eu_bbmri_eric_biobanks"]["type_of_host"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = type_of_host
        eric_data["eu_bbmri_eric_biobanks"]["source_of_funding"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = source_of_funding
        eric_data["eu_bbmri_eric_biobanks"]["target_population"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = target_population
        eric_data["eu_bbmri_eric_biobanks"]["year_of_establishment"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = year_of_establishment
        eric_data["eu_bbmri_eric_biobanks"]["ontologies_used"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = ontologies_used
        eric_data["eu_bbmri_eric_biobanks"]["imaging_available"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = imaging_available
        eric_data["eu_bbmri_eric_biobanks"]["also_listed"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = also_listed

        eric_data["eu_bbmri_eric_biobanks"]["associated_data"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = associated_data
        eric_data["eu_bbmri_eric_biobanks"]["host_is"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = host_is
        eric_data["eu_bbmri_eric_biobanks"]["additional_associated"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_associated
        eric_data["eu_bbmri_eric_biobanks"]["additional_ontologies"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_ontologies
        eric_data["eu_bbmri_eric_biobanks"]["text5085"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = text
        eric_data["eu_bbmri_eric_biobanks"]["additional_networks_inventories"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_networks
        eric_data["eu_bbmri_eric_biobanks"]["additional_imaging_available"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = additional_imaging_available
        eric_data["eu_bbmri_eric_biobanks"]["fields_display"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = fields_display

    add_geo_info(eric_data, rd_data)

def generate_contact_id(eric_data):
    """generates data frame that holds new IDs:
    format: rd_connect:contactID:[COUNTRY_CODE]_[COUNTER]

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)

    Returns
    -------
    data frame
        person ids
    """

    id_list = ["rd_connect:contactID:{0}_{1}".format(x.split(":")[2], k) for k, x in enumerate(eric_data["eu_bbmri_eric_persons"]["biobanks"])]
    id_frame = pd.DataFrame(id_list)

    return id_frame


def add_persons(eric_data, rd_data):
    """adds person information from rd_connect to data frame

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    rd_data : dict
        dictionary that holds rd_connect information (with EMX package/entity/attribute names)
    """
    eric_data["eu_bbmri_eric_persons"]["first_name"] = rd_data["rd_contacts"]["firstname"]
    eric_data["eu_bbmri_eric_persons"]["last_name"] = rd_data["rd_contacts"]["lastname"]
    eric_data["eu_bbmri_eric_persons"]["email"] = rd_data["rd_contacts"]["email"]
    eric_data["eu_bbmri_eric_persons"]["phone"] = rd_data["rd_contacts"]["phone"]
    
    bb_id = rd_data["rd_contacts"]["OrganizationID"]
    eric_data["eu_bbmri_eric_persons"]["biobanks"] = generate_bb_id(eric_data, bb_id) 
    eric_data["eu_bbmri_eric_persons"]["country"] = [org_id_long.split(":")[-2] for org_id_long in eric_data["eu_bbmri_eric_persons"]["biobanks"]]

    eric_data["eu_bbmri_eric_persons"]["id"] = generate_contact_id(eric_data)


def write_excel(eric_data, output_name,index_flag = False):
    """writes dictionary of pandas dataframes to excel file

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    output_name : string
        file name for output file
    index_flag : boolian
        True False for setting the index
    """
    with pd.ExcelWriter(output_name,engine='xlsxwriter') as writer:
        for sheet_name in eric_data.keys():
            df1 = eric_data[sheet_name]
            df1.to_excel(writer, sheet_name=sheet_name,index=index_flag)

def rename_packages(eric_data, package_name):
    """rename package name (standart: bbmri_eric_eu)

    Parameters
    ----------
    eric_data : dict
        dictionary that holds bbmri_eric file (with EMX package/entity/attribute names)
    package_name : string
        new package name for output file. "bbmri_eric_eu" gets replaced by "package_name"

    Returns
    -------
    dict
        same dictionary as eric_data but with changed package name where needed
    """
    old_keys = list(eric_data.keys())
    new_keys = [key.replace("eu_bbmri_eric", package_name) for key in old_keys]
    new_dict = dict(zip(new_keys, eric_data.values()))
    new_dict["entities"] = new_dict["entities"].replace(["eu_bbmri_eric"], [package_name])
    new_dict["packages"]["name"] = package_name
    new_dict["packages"]["label"] = package_name
    new_dict["packages"]["description"] = package_name

    new_dict["attributes"]["entity"] = [val.replace("eu_bbmri_eric", package_name) for val in new_dict["attributes"]["entity"].values]
    new_dict["entities"]["extends"] = [val.replace("eu_bbmri_eric", package_name) if not pd.isnull(val) else "" for val in new_dict["entities"]["extends"].values]
    new_dict["attributes"]["refEntity"] = [val.replace("eu_bbmri_eric", package_name) if not pd.isnull(val) else "" for val in new_dict["attributes"]["refEntity"].values]

    return new_dict

def add_correct_countries(eric_data, rd_data):

    i = 2
    for biobank in eric_data["eu_bbmri_eric_biobanks"]["id"]:
        rd_id = int(biobank.split(":")[-1])
        country = rd_data["rd_core"]["countryCode"][rd_data["rd_core"]["OrganizationID"] == rd_id].values[0]
        if pd.isnull(country):
            country = rd_data["rd_bb_core"]["countryCode"][rd_data["rd_bb_core"]["OrganizationID"] == rd_id].values[0]
            if pd.isnull(country):
                country = "Unknown"

        country_code = eric_data["eu_bbmri_eric_countries"]["id"][eric_data["eu_bbmri_eric_countries"]["name"] == country].values[0]
        i+=1
        # print(i, country_code)
        eric_data["eu_bbmri_eric_biobanks"]["country"].at[eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank] = country_code
    
def build_starmodel(eric_data_star):
    selected_entities = ['eu_bbmri_eric_facts','eu_bbmri_eric_biobanks','eu_bbmri_eric_collections','eu_bbmri_eric_ressource_types','eu_bbmri_eric_body_parts','eu_bbmri_eric_countries','eu_bbmri_eric_data_types', 'eu_bbmri_eric_disease_types','eu_bbmri_eric_material_types']
    #selected_entities = ['ontology_terms','body_parts', 'data_types', 'biobanks', 'collections', 'country', 'disease_types', 'material_types', 'ressource_types']
    # data types -> data_categories
    star_eric_data = { your_key: eric_data_star[your_key] for your_key in selected_entities}

    star_eric_data_v2 = star_eric_data.copy()

    count = 0
    for biobank in star_eric_data["eu_bbmri_eric_biobanks"]["id"]:
        # print(biobank)
        collectiondata_for_biobank= star_eric_data["eu_bbmri_eric_collections"][star_eric_data["eu_bbmri_eric_collections"]["biobank"] == biobank]
        biobankdata_for_biobank= star_eric_data["eu_bbmri_eric_biobanks"][star_eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank]

        for index, collectiondata_row in collectiondata_for_biobank.iterrows():
            if collectiondata_row['id'][-3:] == '_pa':
                continue
            # print(biobankdata_for_biobank['country'].values[0])
            star_eric_data["eu_bbmri_eric_facts"].at[count,'PK'] = count
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_biobanks'] = biobankdata_for_biobank['id'].values[0]
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_ressource_types'] = biobankdata_for_biobank["ressource_types"].values[0]
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_countries'] = biobankdata_for_biobank['country'].values[0]
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_collections'] = collectiondata_row['id']
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_number_of_donors'] = collectiondata_row['number_of_donors']

            nr_materials = collectiondata_row['materials'].split(",")
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_material_types'] = nr_materials[0]
            nr_data_categories = collectiondata_row['data_categories'].split(",")
            star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_data_types'] = nr_data_categories[0]
            if not pd.isnull(collectiondata_row['diagnosis_available']):
                #print(collectiondata_row['diagnosis_available'])
                nr_disease_types = str(collectiondata_row['diagnosis_available']).split(",")
                star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_disease_types'] = nr_disease_types[0]
            else:
                nr_disease_types = ['']

            if len(nr_materials) > 1:
                for material in nr_materials[1:]:
                    count += 1
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'PK'] = count
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_biobanks'] = biobankdata_for_biobank['id'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_ressource_types'] = biobankdata_for_biobank["ressource_types"].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_countries'] = biobankdata_for_biobank['country'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_collections'] = collectiondata_row['id']
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_material_types'] = material
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_data_types'] = nr_data_categories[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_disease_types'] = nr_disease_types[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_number_of_donors'] = collectiondata_row['number_of_donors']


            if len(nr_data_categories) > 1:
                for data_categories in nr_data_categories[1:]:
                    count += 1
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'PK'] = count
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_biobanks'] = biobankdata_for_biobank['id'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_ressource_types'] = biobankdata_for_biobank["ressource_types"].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_countries'] = biobankdata_for_biobank['country'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_collections'] = collectiondata_row['id']
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_data_types'] = data_categories
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_material_types'] = nr_materials[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_disease_types'] = nr_disease_types[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_number_of_donors'] = collectiondata_row['number_of_donors']

            if len(nr_disease_types) > 1:
                for disease_type in nr_disease_types[1:]:
                    count += 1
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'PK'] = count
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_biobanks'] = biobankdata_for_biobank['id'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_ressource_types'] = biobankdata_for_biobank["ressource_types"].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_countries'] = biobankdata_for_biobank['country'].values[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_collections'] = collectiondata_row['id']
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_data_types'] = nr_data_categories[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_material_types'] = nr_materials[0]
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_disease_types'] = disease_type
                    star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_number_of_donors'] = collectiondata_row['number_of_donors']

            count += 1

    # df = star_eric_data["eu_bbmri_eric_facts"].drop_duplicates(subset = ['eu_bbmri_eric_disease_types','eu_bbmri_eric_material_types','eu_bbmri_eric_data_types','eu_bbmri_eric_ressource_types','eu_bbmri_eric_countries'])    

    star_eric_data["eu_bbmri_eric_facts"]["eu_bbmri_eric_disease_types"][star_eric_data["eu_bbmri_eric_facts"]["eu_bbmri_eric_disease_types"] == ''] = "missing"
    star_eric_data["eu_bbmri_eric_facts"]["eu_bbmri_eric_disease_types"][pd.isnull(star_eric_data["eu_bbmri_eric_facts"]["eu_bbmri_eric_disease_types"])] = "missing"

    piv = pd.pivot_table(star_eric_data['eu_bbmri_eric_facts'],
                            index=['eu_bbmri_eric_countries',
                                'eu_bbmri_eric_material_types',
                                'eu_bbmri_eric_ressource_types',
                                'eu_bbmri_eric_data_types',
                                'eu_bbmri_eric_disease_types'],
                            values=['eu_bbmri_eric_biobanks','eu_bbmri_eric_collections','eu_bbmri_eric_number_of_donors'],
                            aggfunc={'eu_bbmri_eric_biobanks':pd.Series.nunique, 'eu_bbmri_eric_collections':pd.Series.nunique, 'eu_bbmri_eric_number_of_donors':np.sum})

            # PIVOT:
            # piv = pd.pivot_table(star_eric_data['eu_bbmri_eric_facts'], index=['eu_bbmri_eric_countries','eu_bbmri_eric_ressource_types', 'eu_bbmri_eric_data_types'], values=['eu_bbmri_eric_disease_types'], aggfunc=pd.Series.nunique)

            # piv = pd.pivot_table(star_eric_data['eu_bbmri_eric_facts'], index=['eu_bbmri_eric_countries', 'eu_bbmri_eric_material_types','eu_bbmri_eric_ressource_types', 'eu_bbmri_eric_data_types', 'eu_bbmri_eric_disease_types'], values=['eu_bbmri_eric_biobanks','eu_bbmri_eric_collections'], aggfunc=len)

            # star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_data_types'] = collectiondata_for_biobank['data_categories'].values[0]
            # star_eric_data["eu_bbmri_eric_facts"].at[count,'eu_bbmri_eric_disease_types'] = collectiondata_for_biobank['diagnosis_available'].values[0]
            #body_part_examined


        # nr_collections = star_eric_data["eu_bbmri_eric_collections"]["biobank"] == biobank
        # nr_datatypes = nr_collections["data_types"]
        # # nr_bodyparts = nr_collections["body_parts_examined"]
        # nr_materials =nr_collections["materials"]   #material_types
        # nr_biobanks = star_eric_data["eu_bbmri_eric_biobanks"]["id"] == biobank
        # nr_recource = nr_biobanks["ressource_types"]
        # biobank_count = len(nr_collections) + len(nr_datatypes) #TODO

    star_eric_counts = pd.DataFrame(piv.to_records())
    # star_eric_counts.set_index(list(np.arange(len(star_eric_counts))))
    star_eric_counts.index.name = 'PK'

    star_eric_data_v2["eu_bbmri_eric_facts"] = star_eric_counts

    # with pd.ExcelWriter("star_model_counts.xlsx",engine='xlsxwriter') as writer:
    #     star_eric_data_v2.to_excel(writer,index=True)
    #     writer.save()
    write_excel(star_eric_data_v2, "star_model_counts.xlsx", index_flag = True)

    return star_eric_data


if __name__ == "__main__":
    sub_collections = True

    eric_name = "empty_eric_ext.xlsx"
    eric_name_star = "empty_eric_ext_star.xlsx"
    rd_name = "rd_connect.xlsx"
    output_name = "rd_connect_catalogue.xlsx"
    output_name_starmodel = "starmodel_rd_connect_catalogue.xlsx"
    package_name = "rd_connect"

    # if sub_collections:
    #     output_name = "rd_connect_catalogue.xlsx"
    #     package_name = "rd_connect"

    # rd_data : EMX file format with data from RD Connect json
    rd_data = pd.read_excel(rd_name, sheet_name=None, engine="openpyxl")
    # eric_data: empty eric (empty bbmri format sheets) , gets filled with RD data
    eric_data = pd.read_excel(eric_name, sheet_name=None, engine="openpyxl")
    eric_data_star = pd.read_excel(eric_name_star, sheet_name=None, engine="openpyxl")



    # add_organization_info(eric_data, rd_data)
    # add_persons(eric_data, rd_data)
    # add_collections_info(eric_data, rd_data, sub_collections)
    # additional_organization_info(eric_data, rd_data)

    add_organization_info(eric_data_star, rd_data)
    add_persons(eric_data_star, rd_data)
    add_collections_info(eric_data_star, rd_data, sub_collections)
    additional_organization_info(eric_data_star, rd_data)

    data_starmodel = build_starmodel(eric_data_star)


    # change package name

    eric_data = rename_packages(eric_data, package_name)
    #write_excel(eric_data, output_name)
    write_excel(data_starmodel, output_name_starmodel)

