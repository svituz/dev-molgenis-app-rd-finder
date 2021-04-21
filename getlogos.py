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
driver = webdriver.Firefox()
driver.get('http://catalogue.rd-connect.eu/web/guest/catalogue')

name = driver.find_element_by_xpath('//div[@id="img_id"]/img')
print(name)

img = driver.find_element_by_xpath('img_id=')
src = img.get_attribute('src')
urllib.urlretrieve(src, "captcha.png")


# with open('filename.png', 'wb') as file:
#     file.write(driver.find_element_by_xpath('/html/body/div[1]/div[5]/div[2]/table[1]/tbody/tr/td[1]/a/div').screenshot_as_png)