from typing import Dict, List
import js
import numpy as np
from pyodide.ffi import create_proxy
from portfolioperformance import *

PATH_SPSECTOR = "./data/new/processed/sp_sector.csv"
PATH_INDUSTRY = "./data/new/processed/industry.csv"
PATH_INTERNATIONAL = "./data/new/processed/international_factor.csv"
PATH_Mkt_SMB_HML = "./data/new/processed/ff_4_factor.csv"
PATH_FF1 = "./data/new/processed/25_portfolios_1_factor.csv"
PATH_FF3 = "./data/new/processed/25_portfolios_3_factor.csv"
PATH_FF4 = "./data/new/processed/25_portfolios_4_factor.csv"

# MODEL CONSTANTS

# Risk averse levels
GAMMAS = [1, 2, 3, 4, 5, 10]

# Time horizons
TIME_HORIZON = [60, 120]

benchmark = EqualWeight("Equal Weight")
minVar = MinVar("Minimum Variance")
JagannathanMa = JagannathanMa("Jagannathan Ma")
minVarShortSellCon = MinVarShortSellCon(
    "Minimum Variance with Short Sell Constraints")
kanZhouEw = KanZhouEw("Kan Zhou EW")

meanVar = MeanVar("Mean Variance (Markowitz)")
meanVarShortSellCon = MeanVarShortSellCon(
    "Mean Variance with Short Sell Constraints")
kanZhou = KanZhou("Kan Zhou Three Fund")
bayesStein = BayesStein("Bayes Stein")
bayesSteinShortSellCon = BayesSteinShortSellCon(
    "Bayes Stein with Short Sell Constraints")
macKinlayPastor = MacKinlayPastor("MacKinlay and Pastor")

models = [
    benchmark,
    minVar,
    JagannathanMa,
    minVarShortSellCon,
    kanZhouEw,
    meanVar,
    meanVarShortSellCon,
    kanZhou,
    bayesStein,
    bayesSteinShortSellCon,
    macKinlayPastor
]

presents = {
    "spsector": {
        "path": PATH_SPSECTOR,
        "gammas": GAMMAS,
        "timeHorizon": TIME_HORIZON,
        "models": models,
        "riskFactorPositions": [6],
        "riskFreePosition": 0,
    },

    "industry": {
        "path": PATH_INDUSTRY,
        "gammas": GAMMAS,
        "timeHorizon": TIME_HORIZON,
        "models": models,
        "riskFactorPositions": [-1],
        "riskFreePosition": 0,
    },

    "international": {
        "path": PATH_INTERNATIONAL,
        "gammas": GAMMAS,
        "timeHorizon": TIME_HORIZON,
        "models": models,
        "riskFactorPositions": [-1],
        "riskFreePosition": 0,
    },

    "ff4": {
        "path": PATH_Mkt_SMB_HML,
        "gammas": GAMMAS,
        "timeHorizon": TIME_HORIZON,
        "models": models,
        "riskFactorPositions": [0],
        "riskFreePosition": -1,
    },

    "25_1": {
        "path": PATH_FF1,
        "gammas": GAMMAS,
        "timeHorizon": TIME_HORIZON,
        "models": models,
        "riskFactorPositions": [-1],
        "riskFreePosition": 0,
    }
}

def runPresent(presentName):
    present = presents[presentName]

    app = App(present["path"], present["gammas"], present["timeHorizon"], present["models"],
              riskFactorPositions=present["riskFactorPositions"], riskFreePosition=present["riskFreePosition"])
    
    sr_dict = app.getSharpeRatios()
    sig_dict = app.getStatisticalSignificanceWRTBenchmark(benchmark)

    return [present["gammas"], format(sr_dict, sig_dict)]
    

def format(sr_dict, sig_dict):
    r = []

    for (k,v), (k2,v2) in zip(sr_dict.items(), sig_dict.items()):
        v = list(v)
        if len(v) == 1:
            v = v * len(GAMMAS)

        if not isinstance(v2, np.ndarray):
            v2 = [v2] * len(GAMMAS)
        else:
            v2 = list(v2)

        r.append([k, v, v2])

    return r

js.createObject(create_proxy(globals()), "pyodideGlobals")