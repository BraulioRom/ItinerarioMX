#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Sep  4 23:18:40 2018

@author: braulinho
"""
from pymongo import MongoClient

def simsMatrix(correo):
    try:
        client = MongoClient('localhost',27017)
        #database reference 
        db = client.Itinerario
        
        #referencias
        historial = db.history
        
        #obtengo datos
        mongo = historial.find({},projection={'_id':0.0, 'lugar':1.0, 'visitantes':1.0})
        lugares=[]
        usuarios=[]
        for registro in mongo:
            lugares.append(str(registro['lugar']))
            usuarios.append(registro['visitantes'])
        
        #datos 
        simsMatrix={}
        for i, lui in enumerate(lugares):
            jaccard=[]
            for j, luj in enumerate(lugares):
                jaccard.append(len(set(usuarios[i]).intersection(usuarios[j]))/
                               len(set(usuarios[i]).union(usuarios[j])))
            simsMatrix[lui]=jaccard                
        
        #obtengo lugares que ha visitado el usuario
        index=[]
        for i in enumerate(usuarios):
            if correo in i[1]:
                index.append([lugares[i[0]],simsMatrix[lugares[i[0]]],i[0]])

        #recomiendo arriba de 80% si es que lo hay segun lo que visito
        result=[]
        for vis in index:
            #obj={}
            #l=[]
            for i,el in enumerate(vis[1]):
                if (i != vis[2]) and (el > 0.79):
                    if lugares[i] not in result:
                        result.append(lugares[i])
            #obj[vis[0]]=l
            #result.append(obj)
        print (result)
    except:
        print([])
    finally:
        client.close()
            
if __name__ == "__main__":
    import sys
    simsMatrix(sys.argv[1])