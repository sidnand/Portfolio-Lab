# Portfolio Lab

This is a GUI for the Python package [portfolioperformance](https://pypi.org/project/portfolioperformance/).

## Models Built-in

* Equal weighted model (Benchmark)
* Minimum-variance
* Minimum-varaince with shortsale constraints model
* Minimum-varaince with generalized constraints (Jagannathan Ma) model
* Kan Zhou equal weighted model
* Mean-varaince (Markowitz) model
* Mean-variance with shortsale constraints model
* Kan Zhou (2007) "three-fund" model
* Bayes-stein model
* Bayes-stein with shortsale constraints model
* MacKinlay and Pastor’s (2000) model 

## Data

### Locations

``` bash
    data/old # contains old data from original paper

    data/new/orig/<category> # contains new uncleaned data for each category/sector
    data/new/clean/<category> # contains new cleaned data; removed unused columns (Only for SPSectors)
    data/new/pre_processed/<category>.csv # contains new preprocessed data; combined all .csv files in clean/<category>
    data/new/processed/<category>.csv # contains new processed data; 
```

### Sources

* [Ken French's Data Library](http://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html)
    * 25 Portfolios Formed on Size and Book-to-Market (5 x 5)
    * 10 Industry Portfolios
    * Fama/French Developed 3 Factors
    * Country Portfolios formed on B/M, E/P, CE/P, and D/P

* Yahoo Finance
    * S&P 500 Sector ETFs
    * S&P 500 Index
    * 3 Month T-Bill