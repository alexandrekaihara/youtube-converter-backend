import requests
from bs4 import BeautifulSoup

# Define the endpoint URL
url = "https://www.google.com/search"

# Set query parameters
params = {"q": "noticias dolar"}

# Set headers to mimic a browser
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

# Make the request
response = requests.get(url, params=params, headers=headers)

# Check if the request was successful
results = []
if response.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all search result containers
    for result in soup.find_all('div', class_='tF2Cxc'):  # Google's search result container
        title = result.find('h3')  # Find the title
        link = result.find('a', href=True)  # Find the link
        
        if title and link:
            results.append({
                "text": title.text,
                "link": link['href']
            })
    
    # Print extracted results
    for idx, result in enumerate(results, start=1):
        print(f"Result {idx}:")
        print(f"Text: {result['text']}")
        print(f"Link: {result['link']}")
        print("-" * 40)
else:
    print("Failed to fetch the page. Status code:", response.status_code)


responseSpecific = requests.get(results[2]['link'])
if responseSpecific.status_code == 200:
    # Parse the HTML content
    soup = BeautifulSoup(responseSpecific.text, 'html.parser')
    
    # Extract all text
    page_text = soup.get_text(separator='\n', strip=True)
    
    print(page_text)
else:
    print(f"Failed to retrieve page. Status code: {responseSpecific.status_code}")



def get_links_from_webpage(url):
    try:
        # Send a GET request to the URL
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad status codes
        # Parse the webpage content
        soup = BeautifulSoup(response.text, 'html.parser')
        # Initialize the list to store link dictionaries
        links = []
        # Extract all <a> tags
        for a_tag in soup.find_all('a', href=True):
            title = a_tag.text.strip() or "No Title"
            href = a_tag['href']   
            # Append the dictionary to the list
            links.append({'title': title, 'URL': href})
        return links
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the webpage: {e}")
        return []
    
links = get_links_from_webpage(results[2]['link'])
titles = [link['title'] for link in links]