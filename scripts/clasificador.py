#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Oct 23 19:28:16 2018

@author: braulinho
"""
import os
import numpy as np
from sklearn.externals import joblib

def classify(vector):
    cwd = os.getcwd();
    classifier=joblib.load(cwd+'/scripts/clasificador.pkl')
    v = np.array(vector.split(','), dtype='int8') 
    y=classifier.predict([v])
    print (y[0])
if __name__ == "__main__":
    import sys
    classify(sys.argv[1])