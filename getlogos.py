# # Import
# import time
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options# Define Browser Options
# chrome_options = Options()
# chrome_options.add_argument("--headless") # Hides the browser window# Reference the local Chromedriver instance
# chrome_path = r'/usr/bin/google-chrome'  #r'/usr/lib/chromium-browser/chromedriver'
# driver = webdriver.Chrome(executable_path=chrome_path, options=chrome_options)# Run the Webdriver, save page an quit browser
# driver.get("http://catalogue.rd-connect.eu/web/guest/catalogue")
# # rdcon = 'http://catalogue.rd-connect.eu/web/guest/catalogue'
# # Scroll page to load whole content
# # last_height = driver.execute_script("return document.body.scrollHeight")
# # while True:
# #     # Scroll down to the bottom.
# #     driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
# #     # Wait to load the page
# #     time.sleep(2)
# #     # Calculate new scroll height and compare with last height.
# #     new_height = driver.execute_script("return document.body.scrollHeight")
# #     if new_height == last_height:
# #         break
# #     last_height = new_heighthtmltext = driver.page_source
# # # driver.quit()
# print(last_height)


# # # Parse
# # import BeautifulSoup
# # soup = BeautifulSoup(htmltext, "lxml")# Extract links to profiles from TWDS Authors
# # authors = []
# # for link in soup.find_all("a",
# #                           class_="link link--darker link--darken u-accentColor--textDarken u-baseColor--link u-fontSize14 u-flex1"):
# #     authors.append(link.get('href'))


#tar -C /usr/local/bin/ -xvf geckodriver-v0.24.0-linux64.tar.gz

# export PATH=$PATH:/usr/local/bin/geckodriver

from selenium import webdriver
import urllib
import requests
import re
import json
import os
import time


def get_links():
    # driver = webdriver.Firefox(executable_path="/home/user/Downloads/geckodriver-v0.29.1-linux32/geckodriver")
    # driver.get('http://catalogue.rd-connect.eu/web/guest/catalogue')

    # example logo link
    # http://catalogue.rd-connect.eu/image/layout_set_logo?img_id=203988
    #

    # name = driver.find_element_by_xpath(("//*[contains(text(),'img_id')]"))
    url = 'http://catalogue.rd-connect.eu/web/guest/catalogue'
    # find occurance of img_id links:
    text = requests.get(url).text
    print(text)
    organisation_mask = re.compile(r"{Name:\".*?}")
    found = organisation_mask.findall(text)

    with open('organisations.json', 'w') as f:
        json.dump(found, f)


    # img = driver.find_element_by_xpath('img_id=')
    # src = img.get_attribute('src')
    # urllib.urlretrieve(src, "captcha.png")


    # with open('filename.png', 'wb') as file:
    #     file.write(driver.find_element_by_xpath('/html/body/div[1]/div[5]/div[2]/table[1]/tbody/tr/td[1]/a/div').screenshot_as_png)

def get_files():
    print("read")
    with open("organisations.json") as f:
        organisations = json.load(f)
        
    link_mask = re.compile(r"OrganizationImageLink:\".*?\"")
    name_mask = re.compile(r"Name:\".*?\"")

    os.chdir("logos")
    k=1
    for org in organisations:
        img_url = link_mask.findall(org)[0].split("\"")[1]
        name = name_mask.findall(org)[0]
        # print("{0} : {1}".format(name_mask.findall(org)[0], img_url))
        link = "http://catalogue.rd-connect.eu" + img_url
        file_name = link.split("=")
        if len(file_name) > 1:
            file_name = file_name[-1]
        else:
            file_name = file_name[0].split("/")[-1][:-4]

        print("{0} / {1} -- {2}".format(k, len(organisations), name))
        print(file_name)
        with urllib.request.urlopen(link) as response:
            info = response.info()
            file_type = info.get_content_type().split("/")[-1]
            file_ext = "." + file_type
        

        file_name = file_name+file_ext
        print("Get: ", file_name)
        urllib.request.urlretrieve(link, file_name)

        time.sleep(0.2)
        k+=1
if __name__ == "__main__" :
    # get_links()
    get_files()
