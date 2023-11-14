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


js.createObject(create_proxy(globals()), "pyodideGlobals")
