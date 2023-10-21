from io import StringIO
import requests
import time
import pandas as pd

start_str = "1994-01-01"
start = int(time.mktime(time.strptime(start_str, "%Y-%m-%d")))
print(start)
end = int(time.time())
ticker = "^IRX"

url = f"https://query1.finance.yahoo.com/v7/finance/download/{ticker}?period1={start}&period2={end}&interval=1d&events=history&includeAdjustedClose=true"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    df = pd.read_csv(StringIO(response.text))
    print('CSV data loaded successfully into a DataFrame.')
    print(df)
else:
    print("Error:", response.status_code)
    print(response.text)