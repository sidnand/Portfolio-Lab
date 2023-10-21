from io import StringIO
import json
import js
import numpy as np
import time
import datetime
import os
import pandas as pd

from pyodide.ffi import create_proxy
from portfolioperformance import *

PATH_SPSECTOR = "./data/new/processed/spsector.csv"
PATH_INDUSTRY = "./data/new/processed/industry.csv"
PATH_INTERNATIONAL = "./data/new/processed/international_factor.csv"
PATH_Mkt_SMB_HML = "./data/new/processed/ff_4_factor.csv"
PATH_FF1 = "./data/new/processed/25_portfolios_1_factor.csv"
PATH_FF3 = "./data/new/processed/25_portfolios_3_factor.csv"
PATH_FF4 = "./data/new/processed/25_portfolios_4_factor.csv"

benchmark = EqualWeight("Equal Weight")

models = [
    benchmark,
    MinVar("Minimum Variance"),
    JagannathanMa("Jagannathan Ma"),
    MinVarShortSellCon("Minimum Variance with Short Sell Constraints"),
    KanZhouEw("Kan Zhou EW"),
    MeanVar("Mean Variance (Markowitz)"),
    MeanVarShortSellCon("Mean Variance with Short Sell Constraints"),
    KanZhou("Kan Zhou Three Fund"),
    BayesStein("Bayes Stein"),
    BayesSteinShortSellCon("Bayes Stein with Short Sell Constraints"),
    MacKinlayPastor("MacKinlay and Pastor")
]

presetPaths = {
    "spsector": PATH_SPSECTOR,
    "industry": PATH_INDUSTRY,
    "international": PATH_INTERNATIONAL,
    "25_1": PATH_FF1,
    "25_3": PATH_FF3,
    "25_4": PATH_FF4,
    "ff4": PATH_Mkt_SMB_HML
}

def runModel(dataJson):
    data = json.loads(dataJson)
    
    delimType = ""
    
    if data["delimType"] == "comma":
        delimType = ","
    else:
        delimType = "\s+"

    selectedModels = [models[i] for i in data["models"]]
    selectedModels.insert(0, models[0])
    
    path = data["fileData"] if data.get("selectedPreset") is None else presetPaths[data["selectedPreset"]]


    # dateFormat: dateFormat ? dateFormat : null,
    # riskFactor: riskFactor ? riskFactor : [], // list of numbers
    # riskFree: riskFree ? riskFree : 0, // single int
    # timeHorizons: timeHorizons, // list of numbers
    # gammas: gammas, // list of numbers
    # dateRangeStart: dateRangeStart ? dateRangeStart : null,
    # dateRangeEnd: dateRangeEnd ? dateRangeEnd : null,
    
    
    dateRange = [] if data["dateRangeStart"] == None or data["dateRangeEnd"] == None else [data["dateRangeStart"], data["dateRangeEnd"]]

    try:
        app = App(path, data["gammas"], data["timeHorizons"], selectedModels,
                dateFormat = data["dateFormat"], dateRange=dateRange,
                riskFactorPositions=data["riskFactor"], riskFreePosition=data["riskFree"], delim=delimType)
            
        sr_dict = app.getSharpeRatios()
        sig_dict = app.getStatisticalSignificanceWRTBenchmark(benchmark)
        
        gammas = data["gammas"]
        sr = format(sr_dict, sig_dict, data["gammas"])
        
        return {
            "gamma": gammas,
            "sr": sr
        }
    
    except Exception as e:
        return e


def format(sr_dict, sig_dict, gammas):
    r = []

    for (k,v), (k2,v2) in zip(sr_dict.items(), sig_dict.items()):
        v = list(v)
        if len(v) == 1:
            v = v * len(gammas)

        if not isinstance(v2, np.ndarray):
            v2 = [v2] * len(gammas)
        else:
            v2 = list(v2)

        r.append([k, v, v2])

    return r


now = datetime.datetime.now()

start_str = "1994-01-01"
start = int(time.mktime(time.strptime(start_str, "%Y-%m-%d")))

if now.hour >= 13 and now.minute >= 30:
    end = now
else:
    end = now - datetime.timedelta(days=1)

end_unix = int(time.time())
end = end.strftime("%Y-%m-%d")

DATE = 0
OPEN = 1
ADJ_CLOSE = 5

LAST_UPDATE_PATH = os.path.join("./data/last_update.txt")
EXPORT_PATH = os.path.join("./data/new/processed")

def to_monthly_data(data):
    monthly_data = {}
    for key, val in data.items():
        val.index = pd.to_datetime(val.index, format="%Y%m%d")
        monthly_data[key] = val.resample("M").last()

    return monthly_data

def cleanData(data):
    cleaned_data = {}

    for sector, df in data.items():
        df = df.reset_index()
        df[df.columns[0]] = df.iloc[:, 0].dt.strftime("%Y%m%d").astype(int)

        df_numpy = df.to_numpy()

        if sector == "T_BILL_3_MO":
            cleaned_data[sector] = removeUnnecessaryData(df_numpy, True)
        else:
            cleaned_data[sector] = removeUnnecessaryData(df_numpy)

    return cleaned_data

def combineData(data):
    header = ""
    date = np.array([])
    change = np.array([])

    for sector, df in data.items():
        if len(date) == 0:
            date = df[:, 0]
            header = "date"

        if len(change) == 0:
            change = df[:, 1]
        else:
            change = np.column_stack((change, df[:, 1]))

        header += "," + sector

    combined_data = np.column_stack((date, change))
    combined_data[:, 0] = combined_data[:, 0].astype(int)

    return header, combined_data

def processData(sector, header, data):
    date = data[:, 0]
    tBill = data[:, 1]
    indices = data[:, 2:]

    diff = indices - tBill[:, np.newaxis]

    out_data = np.column_stack((tBill, diff))

    if not os.path.exists(EXPORT_PATH):
        os.mkdir(EXPORT_PATH)

    out_data = pd.DataFrame(out_data, index=date, columns=header.split(",")[1:])
    out_data.index.name = "date"
    out_data.index = out_data.index.astype(int)

    return out_data

def removeUnnecessaryData(data, tBill=False):
    if (tBill):
        data[:, ADJ_CLOSE] = data[:, ADJ_CLOSE] / 100
        newData = np.column_stack((data[:, DATE], data[:, ADJ_CLOSE]))
        return newData
    else:
        newData = percentageChange(data[:, OPEN], data[:, ADJ_CLOSE])
        newData = np.column_stack((data[:, DATE], newData))
        return newData
    
def readData(filename, sepHeader=False, isCSV=True):
    if isCSV:
        if not sepHeader:
            data = np.genfromtxt(filename, delimiter=',', skip_header=1)

            return data
        else:
            header = np.genfromtxt(filename, delimiter=',', dtype=str, max_rows=1)
            data = np.genfromtxt(filename, delimiter=',', skip_header=1)
            
            return [data, header]
    else:
        f = open(filename, "r")
        data = f.read()
        f.close()

        return data

def percentageChange(open, close):
    return (close - open) / open



def get_sp_sector(all_data_json):
    data = json.loads(all_data_json)
    all_data = {}
    
    for key, val in data.items():
        all_data[key] = pd.read_csv(StringIO(val))
        all_data[key][all_data[key].columns[0]] = pd.to_datetime(all_data[key].iloc[:, 0], format="%Y-%m-%d")
        all_data[key].set_index(all_data[key].columns[0], inplace=True)
        all_data[key].index = all_data[key].index.strftime("%Y%m%d").astype(int)

    to_monthy = to_monthly_data(all_data)
    cleaned_data = cleanData(to_monthy)
    header, combined_data = combineData(cleaned_data)
    out_data = processData("spsector", header, combined_data)
    out_data = out_data.to_csv()

    return out_data







js.createObject(create_proxy(globals()), "pyodideGlobals")
